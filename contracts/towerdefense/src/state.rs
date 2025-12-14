use async_graphql::{Enum, SimpleObject};
use linera_sdk::views::{linera_views, CollectionView, LogView, RegisterView, RootView, ViewStorageContext};
use serde::{Deserialize, Serialize};

pub const ALLOWED_WAGERS: [u64; 5] = [1, 2, 3, 4, 5];

use linera_base::identifiers::AccountOwner as Owner;

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct TowerDefenseState {
    pub players: CollectionView<Owner, PlayerGameData>,
    pub default_gold: RegisterView<u64>,
    pub master_seed: RegisterView<u64>,
    pub deployer: RegisterView<Option<Owner>>,
}

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct PlayerGameData {
    pub deck: RegisterView<Vec<BattleCard>>,
    pub player_cards: RegisterView<Vec<BattleCard>>,
    pub opponent_cards: RegisterView<Vec<BattleCard>>,
    pub opponent_hidden_card: RegisterView<Option<BattleCard>>,
    pub gold_balance: RegisterView<u64>,
    pub current_wager: RegisterView<u64>,
    pub phase: RegisterView<GamePhase>,
    pub last_result: RegisterView<Option<BattleResult>>,
    pub random_seed: RegisterView<u64>,
    pub game_history: LogView<GameRecord>,
}

#[derive(Clone, Debug, Serialize, Deserialize, PartialEq, Eq, SimpleObject)]
pub struct BattleCard {
    pub card_type: String, 
    pub power: String, 
    pub id: String,
}

impl BattleCard {
    pub fn new(card_type: &str, power: &str) -> Self {
        let id = format!("{}_type_{}", power, card_type);
        Self {
            card_type: card_type.to_string(),
            power: power.to_string(),
            id,
        }
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Serialize, Deserialize, Enum)]
pub enum GamePhase {
    #[default]
    WaitingForWave,
    PlacingWager,
    BattleInProgress,
    BossTurn,
    WaveComplete,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize, Enum)]
pub enum BattleResult {
    CriticalVictory,
    Victory,
    Defeat,
    Overwhelmed,
    EnemyRetreat,
    Stalemate,
}

#[derive(Clone, Debug, Serialize, Deserialize, SimpleObject)]
pub struct GameRecord {
    pub player_cards: Vec<BattleCard>,
    pub opponent_cards: Vec<BattleCard>,
    pub wager: u64,
    pub result: BattleResult,
    pub payout: u64,
    pub timestamp: u64,
}
