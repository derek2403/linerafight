#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use std::sync::Arc;

use async_graphql::{EmptySubscription, Object, Schema};
use linera_sdk::{
    graphql::GraphQLMutationRoot, linera_base_types::{WithServiceAbi, AccountOwner}, views::View, Service,
    ServiceRuntime,
};

use linera_fight::Operation;

use self::state::LineraFightState;

pub struct LineraFightService {
    state: LineraFightState,
    runtime: Arc<ServiceRuntime<Self>>,
}

linera_sdk::service!(LineraFightService);

impl WithServiceAbi for LineraFightService {
    type Abi = linera_fight::LineraFightAbi;
}

impl Service for LineraFightService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = LineraFightState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        LineraFightService {
            state,
            runtime: Arc::new(runtime),
        }
    }

    async fn handle_query(&self, query: Self::Query) -> Self::QueryResponse {
        let mut players = Vec::new();
        self.state.players.for_each_index_value(|_owner, player| {
            players.push(player.into_owned());
            Ok(())
        })
        .await
        .expect("Failed to fetch players");

        Schema::build(
            QueryRoot {
                players,
            },
            Operation::mutation_root(self.runtime.clone()),
            EmptySubscription,
        )
        .finish()
        .execute(query)
        .await
    }
}

struct QueryRoot {
    players: Vec<state::Player>,
}

#[Object]
impl QueryRoot {
    async fn player(&self, owner: AccountOwner) -> Option<state::Player> {
        self.players.iter().find(|p| p.owner == owner).cloned()
    }
}
