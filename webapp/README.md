# Territory Webapp

Minimal UI for map, movement, combat, and spawn. Connect wallet (opBNB/BSC) to interact.

## Setup

```bash
npm install
npm run dev
```

## Features

- Map view with locations and edges
- Player panel (location, units, gold)
- Action panel (Move, Attack, Spawn) - wired when contracts deployed

## Contract Integration

Set contract addresses in `src/lib/contracts.ts` (to be added) and wire up `useReadContract` / `useWriteContract` from wagmi for:

- Map.move(fromId, toId)
- Combat.attack(locationId, unitToken, amount)
- Spawn.spawn(locationId, level, amount)
