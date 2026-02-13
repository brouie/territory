# Territory Webapp

Next.js UI for Territory. Connect MetaMask on opBNB Testnet (Chain 5611) to play.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Map** – Territory view with ownership (you / enemy / PVE), power per location
- **Player panel** – Location, units, gold escrow and wallet
- **Actions** – Deposit Gold, Spawn, Move, Fortify (defend), Attack

## Contract Addresses

Defaults point to opBNB testnet deployment. Override via `.env.local`:

```
NEXT_PUBLIC_MAP_ADDRESS=0x...
NEXT_PUBLIC_GAME_MASTER_ADDRESS=0x...
NEXT_PUBLIC_GOLD_ADDRESS=0x...
# etc.
```

**Never put PRIVATE_KEY in any env file committed to git.** The webapp uses MetaMask for signing; no private key in frontend.
