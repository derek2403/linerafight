#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    ensure,
    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};

use towerdefense::{TowerDefenseInit, Operation};

use self::state::{BattleCard, TowerDefenseState, PlayerGameData, GamePhase, GameRecord, BattleResult, ALLOWED_WAGERS};

const CARD_TYPES: [&str; 4] = ["infantry", "ranged", "magic", "siege"];
const POWER_LEVELS: [&str; 13] = [
    "2", "3", "4", "5", "6", "7", "8", "9", "10", "commander", "general", "hero", "ace_unit",
];

pub struct TowerDefenseContract {
    state: TowerDefenseState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(TowerDefenseContract);

impl WithContractAbi for TowerDefenseContract {
    type Abi = towerdefense::TowerDefenseAbi;
}

impl Contract for TowerDefenseContract {
    type Message = ();
    type Parameters = ();
    type InstantiationArgument = TowerDefenseInit;
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = TowerDefenseState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        TowerDefenseContract { state, runtime }
    }

    async fn instantiate(&mut self, argument: Self::InstantiationArgument) {
        self.runtime.application_parameters();

        let starting_gold = argument.starting_gold;
        self.state.default_gold.set(starting_gold);
        
        // Set master seed
        let master_seed = if argument.random_seed == 0 {
            0x9e3779b185ebca87
        } else {
            argument.random_seed
        };
        self.state.master_seed.set(master_seed);
        
        // Set deployer address
        let signer = self.runtime.authenticated_signer().expect("User must be signed in to instantiate");
        self.state.deployer.set(Some(signer));
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        let signer = self.runtime.authenticated_signer().expect("User must be signed in");
        let default_gold = *self.state.default_gold.get();
        let master_seed = *self.state.master_seed.get();
        
        // Load or initialize player
        let player = self.state.players.load_entry_mut(&signer).await.expect("Failed to load player");
        
        // Initialize player if needed
        if *player.random_seed.get() == 0 {
            player.gold_balance.set(default_gold);
            // Mix master seed with signer to get unique seed
            let mut hasher = std::collections::hash_map::DefaultHasher::new();
            use std::hash::{Hash, Hasher};
            master_seed.hash(&mut hasher);
            signer.hash(&mut hasher);
            player.random_seed.set(hasher.finish());
            player.phase.set(GamePhase::WaitingForWave);
        }

        match operation {
            Operation::Reset => {
                if let Err(e) = Self::reset(player) {
                    panic!("{}", e);
                }
            }
            Operation::StartGame { wager } => {
                if let Err(e) = Self::start_wave(player, &mut self.runtime, wager) {
                    panic!("{}", e);
                }
            }
            Operation::Battle => {
                if let Err(e) = Self::battle(player, &mut self.runtime) {
                    panic!("{}", e);
                }
            }
            Operation::EndWave => {
                if let Err(e) = Self::end_wave(player, &mut self.runtime) {
                    panic!("{}", e);
                }
            }
            Operation::RequestGold => {
                let current_balance = *player.gold_balance.get();
                player.gold_balance.set(current_balance.saturating_add(100)); 
                // Also ensure phase is reset if they were stuck
                if *player.gold_balance.get() > 0 && *player.phase.get() == GamePhase::WaveComplete {
                     player.phase.set(GamePhase::WaitingForWave);
                }
            }
        }
        Self::Response::default()
    }
    
    async fn execute_message(&mut self, _message: Self::Message) {}

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl TowerDefenseContract {
    // Reset game to WaitingForWave
    fn reset(player: &mut PlayerGameData) -> Result<(), String> {
        let phase = *player.phase.get();
        ensure!(
            matches!(phase, GamePhase::WaitingForWave | GamePhase::WaveComplete),
            "Cannot reset during active battle"
        );

        player.phase.set(GamePhase::WaitingForWave);

        // Clear previous round data
        player.deck.set(Vec::new());
        player.player_cards.set(Vec::new());
        player.opponent_cards.set(Vec::new());
        player.opponent_hidden_card.set(None);
        player.current_wager.set(0);

        Ok(())
    }

    // Start wave - lock in wager and deal initial cards
    fn start_wave(player: &mut PlayerGameData, runtime: &mut ContractRuntime<Self>, wager: u64) -> Result<(), String> {
        ensure!(ALLOWED_WAGERS.contains(&wager), "Wager must be one of 1,2,3,4,5");
        let phase = *player.phase.get();
        ensure!(
            matches!(phase, GamePhase::WaitingForWave | GamePhase::PlacingWager | GamePhase::WaveComplete),
            "Cannot start wave during active battle"
        );

        let balance = *player.gold_balance.get();
        ensure!(balance >= wager, "Insufficient gold to place wager");

        // Deal cards
        let mut deck = Self::new_shuffled_deck(player);
        let player_card1 = draw_card(&mut deck);
        let player_card2 = draw_card(&mut deck);
        let opponent_up_card = draw_card(&mut deck);
        let opponent_hidden_card = draw_card(&mut deck);

        let player_cards = vec![player_card1, player_card2];

        // Store hidden card separately (hidden from service until boss turn)
        player.opponent_hidden_card.set(Some(opponent_hidden_card));
        // Only show opponent's up card
        player.opponent_cards.set(vec![opponent_up_card.clone()]);

        player.gold_balance.set(balance - wager);
        player.current_wager.set(wager);
        player.deck.set(deck);
        player.player_cards.set(player_cards.clone());
        player.last_result.set(None);

        // Check for instant victory (CriticalVictory)
        let player_power = calculate_power(&player_cards);
        if player_power == 21 {
            // Player has Critical Victory
            Self::reveal_opponent_hidden_card(player);
            let full_opponent_cards = player.opponent_cards.get().clone();
            let opponent_power = calculate_power(&full_opponent_cards);
            if opponent_power == 21 {
                Self::apply_result(player, runtime, BattleResult::Stalemate);
            } else {
                Self::apply_result(player, runtime, BattleResult::CriticalVictory);
            }
        } else {
            player.phase.set(GamePhase::BattleInProgress);
        }

        Ok(())
    }

    // Battle - player draws a card
    fn battle(player: &mut PlayerGameData, runtime: &mut ContractRuntime<Self>) -> Result<(), String> {
        ensure!(
            matches!(*player.phase.get(), GamePhase::BattleInProgress),
            "You can only battle during the battle phase"
        );

        let mut deck = player.deck.get().clone();
        ensure!(!deck.is_empty(), "The reinforcement deck is exhausted");
        let mut player_cards = player.player_cards.get().clone();
        player_cards.push(draw_card(&mut deck));

        player.deck.set(deck);
        player.player_cards.set(player_cards.clone());

        if calculate_power(&player_cards) > 21 {
            // Overwhelmed
            Self::reveal_opponent_hidden_card(player);
            Self::apply_result(player, runtime, BattleResult::Overwhelmed);
        }

        Ok(())
    }

    // EndWave - reveal hidden card and boss plays
    fn end_wave(player: &mut PlayerGameData, runtime: &mut ContractRuntime<Self>) -> Result<(), String> {
        ensure!(
            matches!(*player.phase.get(), GamePhase::BattleInProgress),
            "You can only end wave during the battle phase"
        );

        player.phase.set(GamePhase::BossTurn);

        // Reveal the boss's hidden card
        Self::reveal_opponent_hidden_card(player);

        let mut deck = player.deck.get().clone();
        let mut opponent_cards = player.opponent_cards.get().clone();

        // Boss hits until 17 or higher
        while calculate_power(&opponent_cards) < 17 {
            ensure!(!deck.is_empty(), "The reinforcement deck is exhausted");
            opponent_cards.push(draw_card(&mut deck));
        }

        player.deck.set(deck);
        player.opponent_cards.set(opponent_cards.clone());

        let player_cards = player.player_cards.get().clone();
        let result = determine_outcome(&player_cards, &opponent_cards);
        Self::apply_result(player, runtime, result);

        Ok(())
    }

    // Helper to reveal opponent's hidden card
    fn reveal_opponent_hidden_card(player: &mut PlayerGameData) {
        if let Some(hidden_card) = player.opponent_hidden_card.get().clone() {
            let mut opponent_cards = player.opponent_cards.get().clone();
            opponent_cards.push(hidden_card);
            player.opponent_cards.set(opponent_cards);
            player.opponent_hidden_card.set(None);
        }
    }

    fn apply_result(player: &mut PlayerGameData, runtime: &mut ContractRuntime<Self>, result: BattleResult) {
        let wager = *player.current_wager.get();
        let balance = *player.gold_balance.get();

        // Calculate payout
        let payout = match result {
            BattleResult::CriticalVictory => {
                // 1.5x payout (2.5x total)
                wager.saturating_mul(5).saturating_div(2)
            }
            BattleResult::Victory | BattleResult::EnemyRetreat => {
                // Regular win - double the wager
                wager.saturating_mul(2)
            }
            BattleResult::Stalemate => {
                // Push - return the wager
                wager
            }
            BattleResult::Defeat | BattleResult::Overwhelmed => {
                // Loss - no payout
                0
            }
        };

        let updated_balance = balance.saturating_add(payout);

        // Record game in history
        let now_timestamp = runtime.system_time();
        let now_micros = now_timestamp.micros();
        let record = GameRecord {
            player_cards: player.player_cards.get().clone(),
            opponent_cards: player.opponent_cards.get().clone(),
            wager,
            result,
            payout,
            timestamp: now_micros,
        };
        player.game_history.push(record);

        player.gold_balance.set(updated_balance);
        player.current_wager.set(0);
        player.phase.set(GamePhase::WaveComplete);
        player.last_result.set(Some(result));
    }

    fn new_shuffled_deck(player: &mut PlayerGameData) -> Vec<BattleCard> {
        let mut deck = create_deck();
        let seed = Self::bump_seed(player);
        shuffle(&mut deck, seed);
        deck
    }

    fn bump_seed(player: &mut PlayerGameData) -> u64 {
        let current = *player.random_seed.get();
        let mut rng = SimpleRng::new(current);
        let next = rng.next();
        player.random_seed.set(next);
        next
    }
}

fn create_deck() -> Vec<BattleCard> {
    let mut deck = Vec::with_capacity(CARD_TYPES.len() * POWER_LEVELS.len());
    for card_type in CARD_TYPES {
        for power in POWER_LEVELS {
            deck.push(BattleCard::new(card_type, power));
        }
    }
    deck
}

fn shuffle(deck: &mut [BattleCard], seed: u64) {
    let mut rng = SimpleRng::new(seed);
    for i in (1..deck.len()).rev() {
        let j = (rng.next() as usize) % (i + 1);
        deck.swap(i, j);
    }
}

fn draw_card(deck: &mut Vec<BattleCard>) -> BattleCard {
    deck.pop().expect("deck should contain enough cards")
}

fn calculate_power(cards: &[BattleCard]) -> u8 {
    let mut total = 0u8;
    let mut aces = 0u8;

    for card in cards {
        match card.power.as_str() {
            "ace_unit" => {
                aces += 1;
                total = total.saturating_add(11);
            }
            "commander" | "general" | "hero" => total = total.saturating_add(10),
            value => {
                let parsed = value
                    .parse::<u8>()
                    .unwrap_or_else(|_| panic!("invalid card power {value}"));
                total = total.saturating_add(parsed);
            }
        }
    }

    while total > 21 && aces > 0 {
        total -= 10;
        aces -= 1;
    }

    total
}

fn determine_outcome(player_cards: &[BattleCard], opponent_cards: &[BattleCard]) -> BattleResult {
    let player_power = calculate_power(player_cards);
    let opponent_power = calculate_power(opponent_cards);
    let player_overwhelmed = player_power > 21;
    let opponent_retreated = opponent_power > 21;

    if player_overwhelmed {
        BattleResult::Overwhelmed
    } else if opponent_retreated {
        BattleResult::EnemyRetreat
    } else if player_power > opponent_power {
        BattleResult::Victory
    } else if opponent_power > player_power {
        BattleResult::Defeat
    } else {
        BattleResult::Stalemate
    }
}

struct SimpleRng(u64);

impl SimpleRng {
    fn new(seed: u64) -> Self {
        let seed = if seed == 0 { 0x9e3779b185ebca87 } else { seed };
        SimpleRng(seed)
    }

    fn next(&mut self) -> u64 {
        let mut value = self.0;
        value ^= value << 7;
        value ^= value >> 9;
        value ^= value << 8;
        self.0 = value;
        self.0
    }
}
