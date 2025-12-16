# ⚔️ LineraFight

A blockchain-powered fighting game built on **Linera**, featuring real-time combat with on-chain state management and **Dynamic Labs** wallet integration.

## 🎮 What is LineraFight?

LineraFight is a wave-based fighting game where players:
1. Connect their wallet and claim a Linera microchain
2. Start a game with a wager
3. Fight through waves of enemies
4. Cash out their winnings or keep fighting for higher rewards

The game state (wager, wave progress, results) is stored on-chain using Linera's innovative microchain architecture, while the combat mechanics run locally for a smooth gameplay experience.

## 🏗️ Architecture

```
linerafight/
├── contract/           # Rust smart contract (Linera)
│   ├── src/
│   │   ├── lib.rs      # ABI definitions & operations
│   │   ├── contract.rs # Main contract logic
│   │   ├── state.rs    # State definitions (Player, etc.)
│   │   └── service.rs  # GraphQL query service
│   └── Cargo.toml
├── frontend/           # React + TypeScript frontend
│   ├── src/
│   │   ├── game/       # Game components (Board, Controls, etc.)
│   │   ├── context/    # GameContext for Linera integration
│   │   ├── lib/        # Linera adapter & Dynamic signer
│   │   └── pages/      # Landing, Game pages
│   └── package.json
└── deploy.sh           # Deployment script
```

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| **Blockchain** | [Linera](https://linera.io) - Microchain architecture |
| **Smart Contract** | Rust + `linera-sdk` |
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS |
| **Wallet** | [Dynamic Labs](https://dynamic.xyz) - Embedded wallet support |
| **Animations** | GSAP, Anime.js, Motion |

## 📋 Smart Contract Operations

The Linera smart contract supports these operations:

| Operation | Description |
|-----------|-------------|
| `StartGame { wager }` | Start a new game with the specified wager |
| `Battle` | Progress through a battle wave |
| `EndWave` | End the game and cash out |
| `Reset` | Reset player state |

## 🚀 Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (for contract compilation)
- [Linera CLI](https://linera.io/docs/getting-started) (for deployment)
- Node.js 18+ (for frontend)

### 1. Deploy the Smart Contract

```bash
# Build and deploy to Linera testnet
./deploy.sh
```

This will compile the Rust contract and deploy it to the Linera Conway testnet.

### 2. Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Dynamic Labs Environment ID
VITE_DYNAMIC_ENVIRONMENT_ID=your-dynamic-environment-id

# Linera Testnet Faucet
VITE_LINERA_FAUCET_URL=https://faucet.testnet-conway.linera.net
```

## 🎯 How It Works

1. **Wallet Connection**: Users connect via Dynamic Labs (supports MetaMask, email login, etc.)
2. **Chain Claim**: A new Linera microchain is claimed for the user from the faucet
3. **Game Start**: The `startGame` mutation is sent on-chain with the wager amount
4. **Gameplay**: Combat runs locally for smooth UX (no per-hit transactions)
5. **Game End**: The `endWave` mutation finalizes the game state on-chain

### Transaction Flow

```
User Action          → Chain Transaction
─────────────────────────────────────────
Start Game           → startGame(wager)
Hit/Attack           → (local only)
Game Over / Cash Out → endWave
```

## 🌐 Deployment (Vercel)

The project includes a `vercel.json` for proper SPA routing and COOP/COEP headers required for SharedArrayBuffer:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Embedder-Policy", "value": "credentialless" }
      ]
    }
  ]
}
```

## 📄 License

MIT

## 🙏 Acknowledgments

- [Linera](https://linera.io) for the blockchain infrastructure
- [Dynamic Labs](https://dynamic.xyz) for wallet integration
- Built with ❤️ for the Linera ecosystem
