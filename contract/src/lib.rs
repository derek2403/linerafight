use async_graphql::{Request, Response};
use linera_sdk::{
    graphql::GraphQLMutationRoot,
    linera_base_types::{ContractAbi, ServiceAbi},
};
use serde::{Deserialize, Serialize};

pub struct LineraFightAbi;

impl ContractAbi for LineraFightAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for LineraFightAbi {
    type Query = Request;
    type QueryResponse = Response;
}

#[derive(Debug, Deserialize, Serialize, GraphQLMutationRoot)]
pub enum Operation {
    StartGame {
        wager: u64,
    },
    Battle,
    EndWave,
    Reset,
}
