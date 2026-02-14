# Contract Architecture

## Overview

```
UserActions (move, attack, spawn)
       |
       v
Core Contracts: Map, Combat, GameMaster
       |
       v
   FeeCollector (receives fees)
       |
       +-- 60% --> Protocol Treasury (game ops, rewards)
       |
       +-- 10% --> DAO Treasury (infrastructure, community)
       |
       +-- 30% --> CL8Y Router --> buy CL8Y --> burn
```

## Contracts

### FeeCollector

- Receives fees from Map, Combat, and GameMaster (or spawn logic)
- Splits incoming value: 60% to protocol treasury, 10% to DAO treasury, 30% to CL8Y buy-burn
- If fee token is BNB: accept `payable`, split native
- If fee token is ERC20: receive via transfer, split and route
- Integrates with DEX (PancakeSwap or similar on opBNB) for CL8Y swap
- Burns CL8Y by sending to dead address or calling burn

### GameMaster

- Escrow for player tokens (resources, units)
- `deposit(token, amount)`: user transfers tokens in
- `withdraw(token, amount)`: user withdraws (no burn penalty; fees are per-action)
- Balance tracking: `user => token => amount`
- Authorized game contracts (Map, Combat, spawn) can `spendBalance` / `addBalance` / `transferBalance`
- Does not impose withdrawal burn; fee model is separate
- `addBalance`: caller must ensure GameMaster holds the tokens (transfer or mint to GameMaster first)

### Map

- Manages locations (nodes) and adjacency (edges)
- `addLocation(locationId)` or `setLocations(locationIds[])`
- `addEdge(fromId, toId)` for adjacency
- `move(player, fromLocationId, toLocationId, unitAmount?)`: validates adjacency, deducts fee, updates player position
- Calls FeeCollector with movement fee
- May integrate with GameMaster for unit balance checks

### Combat

- `attack(attacker, defenderLocationId, attackerUnitLevel, attackerUnitAmount)`
- Resolves deterministically using `power = level * amount`
- Applies losses (burn/spend units)
- Charges attack fee to FeeCollector
- Updates location ownership if attacker wins

### CL8Y Router (or embedded in FeeCollector)

- Takes 30% of fees (CL8Y_BPS)
- Swaps for CL8Y via DEX (exact path TBD: BNB->CL8Y or token->BNB->CL8Y)
- Burns CL8Y (dead address or `burn()`)

## Data Flow

### Move

1. User calls `Map.move(from, to)` with fee
2. Map validates adjacency, player position, fee
3. Map sends fee to FeeCollector
4. FeeCollector splits 60/10/30 (protocol/DAO/CL8Y)
5. Map updates player location

### Attack

1. User calls `Combat.attack(defenderLocationId, mercLevel, mercAmount)` with fee
2. Combat fetches defender power, computes outcome
3. Combat spends/burns units via GameMaster
4. Combat sends fee to FeeCollector
5. FeeCollector splits 60/10/30 (protocol/DAO/CL8Y)
6. Combat updates location owner if attacker wins

### Spawn

1. User calls spawn (e.g., `GameMaster.spawn()` or dedicated Spawn contract) with resources + fee
2. Resources consumed from escrow
3. Units minted/added to player
4. Fee sent to FeeCollector
5. FeeCollector splits 60/10/30 (protocol/DAO/CL8Y)

## Access Control

- GameMaster: `restricted` for spend/add/transfer (only Map, Combat, Spawn)
- Map, Combat: may use Ownable or AccessControl for admin (add locations, set fees)
- FeeCollector: may receive from any; treasury/CL8Y addresses set by admin

## Dependencies

- OpenZeppelin: AccessControl, ReentrancyGuard, SafeERC20
- DEX: PancakeSwap V2/V3 router on opBNB (address TBD for mainnet)
- CL8Y: Token address on opBNB (TBD)
