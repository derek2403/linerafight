#!/bin/bash
set -e

# Navigate to contract directory
cd contract

echo "Building contract..."
# Build for wasm32-unknown-unknown
cargo build --release --target wasm32-unknown-unknown

echo "Deploying to Linera..."
# Publish and create application
# Using 'null' for the empty argument usually works for unit type
APP_ID=$(linera publish-and-create \
  target/wasm32-unknown-unknown/release/linera_fight_contract.wasm \
  target/wasm32-unknown-unknown/release/linera_fight_service.wasm \
  --json-argument "null")

echo "Deployed App ID: $APP_ID"

# Update frontend/src/constants.ts
# Use relative path from 'contract' directory: ../frontend/src/constants.ts
echo "export const CONTRACTS_APP_ID = \"$APP_ID\";" > ../frontend/src/constants.ts

echo "Updated frontend/src/constants.ts with new App ID."
