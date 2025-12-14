use async_graphql::{Request, Response};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{ContractAbi, ServiceAbi},
};
use serde::{Deserialize, Serialize};

pub struct TowerDefenseAbi;

impl ContractAbi for TowerDefenseAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for TowerDefenseAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct TowerDefenseInit {
    pub starting_gold: u64,
    pub random_seed: u64,
}

#[derive(Debug, Deserialize, Serialize, GraphQLMutationRoot)]
pub enum Operation {
    Reset,
    StartGame { wager: u64 },
    Battle,
    EndWave, // Equivalent to Stand
    RequestGold,
}
