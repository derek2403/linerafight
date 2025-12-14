#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Schema, SimpleObject};
use futures::lock::Mutex;
use linera_base::identifiers::AccountOwner as Owner;
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::WithServiceAbi,
    views::View,
    Service, ServiceRuntime,
};

use towerdefense::Operation;

use self::state::{BattleCard, TowerDefenseState, GamePhase, GameRecord, BattleResult, ALLOWED_WAGERS};

pub struct TowerDefenseService {
    state: Arc<Mutex<TowerDefenseState>>,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(TowerDefenseService);

impl WithServiceAbi for TowerDefenseService {
    type Abi = towerdefense::TowerDefenseAbi;
}

impl Service for TowerDefenseService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = TowerDefenseState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        TowerDefenseService {
            state: Arc::new(Mutex::new(state)),
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, query: Self::Query) -> Self::QueryResponse {
        Schema::build(
            QueryRoot { state: self.state.clone() },
            Operation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .finish()
        .execute(query)
        .await
    }
}

struct QueryRoot {
    state: Arc<Mutex<TowerDefenseState>>,
}

#[Object]
impl QueryRoot {
    async fn default_gold(&self) -> u64 {
        let state = self.state.lock().await;
        *state.default_gold.get()
    }

    async fn deployer(&self) -> Option<Owner> {
        let state = self.state.lock().await;
        *state.deployer.get()
    }

    async fn player(&self, owner: Owner) -> Option<PlayerStateObject> {
        let mut state = self.state.lock().await;
        let player_view = state.players.load_entry_mut(&owner).await.ok()?;
        
        let mut history: Vec<GameRecord> = Vec::new();
        let count = player_view.game_history.count();
        for i in 0..count {
            if let Some(record) = player_view.game_history.get(i).await.ok().flatten() {
                history.push(record);
            }
        }

        Some(PlayerStateObject {
            gold_balance: *player_view.gold_balance.get(),
            current_wager: *player_view.current_wager.get(),
            phase: *player_view.phase.get(),
            last_result: *player_view.last_result.get(),
            player_cards: player_view.player_cards.get().clone(),
            opponent_cards: player_view.opponent_cards.get().clone(),
            allowed_wagers: ALLOWED_WAGERS.to_vec(),
            game_history: history,
        })
    }
}

#[derive(SimpleObject)]
struct PlayerStateObject {
    gold_balance: u64,
    current_wager: u64,
    phase: GamePhase,
    last_result: Option<BattleResult>,
    player_cards: Vec<BattleCard>,
    opponent_cards: Vec<BattleCard>,
    allowed_wagers: Vec<u64>,
    game_history: Vec<GameRecord>,
}
