#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    linera_base_types::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};
use linera_fight::Operation;
use self::state::{LineraFightState, Player};

pub struct LineraFightContract {
    state: LineraFightState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(LineraFightContract);

impl WithContractAbi for LineraFightContract {
    type Abi = linera_fight::LineraFightAbi;
}

impl Contract for LineraFightContract {
    type Message = ();
    type Parameters = ();
    type InstantiationArgument = ();
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = LineraFightState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        LineraFightContract { state, runtime }
    }

    async fn instantiate(&mut self, _argument: Self::InstantiationArgument) {
        // No init logic needed yet
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        match operation {
            Operation::StartGame { wager } => {
                let owner = self.runtime.authenticated_signer().expect("Authentication required");
                
                let player = Player {
                    owner,
                    wager,
                    wave: 1,
                    last_result: "Start".to_string(),
                    in_game: true,
                };
                self.state.players.insert(&owner, player).expect("Failed to start game");
            }
            Operation::Battle => {
                let owner = self.runtime.authenticated_signer().expect("Authentication required");
                if let Some(mut player) = self.state.players.get(&owner).await.expect("Failed to get player") {
                     if player.in_game {
                        player.wave += 1;
                        player.last_result = "Win".to_string(); 
                        self.state.players.insert(&owner, player).expect("Failed to battle");
                     }
                }
            }
            Operation::EndWave => {
                let owner = self.runtime.authenticated_signer().expect("Authentication required");
                if let Some(mut player) = self.state.players.get(&owner).await.expect("Failed to get player") {
                    player.in_game = false;
                    player.last_result = "Ended".to_string();
                    self.state.players.insert(&owner, player).expect("Failed to end game");
                }
            }
             Operation::Reset => {
                let owner = self.runtime.authenticated_signer().expect("Authentication required");
                 self.state.players.remove(&owner).expect("Failed to reset");
             }
        }
        Self::Response::default()
    }

    async fn execute_message(&mut self, _message: Self::Message) {}

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}
