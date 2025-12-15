use linera_sdk::views::{
    linera_views, MapView, RootView, ViewStorageContext,
};
use serde::{Deserialize, Serialize};
use linera_sdk::linera_base_types::AccountOwner as Owner;

#[derive(Debug, Clone, Serialize, Deserialize, async_graphql::SimpleObject)]
pub struct Player {
    pub owner: Owner,
    pub wager: u64,
    pub wave: u32,
    pub last_result: String,
    pub in_game: bool,
}

#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct LineraFightState {
    pub players: MapView<Owner, Player>,
}
