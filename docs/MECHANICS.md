# Core Game Mechanics

## Overview

Skill-based GameFi on opBNB/BSC. Fully onchain, deterministic, no RNG. Map-based gameplay with PVE and PVP battles. All actions incur fees; 30% of fees route to CL8Y buy-and-burn.

## Map Structure

### Locations (Nodes)

- Locations are discrete points on the map
- Each location has a unique ID (uint256)
- Locations may be: empty, player-controlled, or PVE zones
- Location metadata: owner (address or zero for unowned), type (spawn, combat, resource)

### Adjacency (Edges)

- Locations are connected by directed or undirected edges
- Movement is only allowed between adjacent locations
- Edges are defined at map initialization and are immutable for prototype

### Movement Rules

- Player calls `move(fromLocationId, toLocationId)` with their units
- `from` must be adjacent to `to`
- Player must own or control `from` (or have units there)
- Player must have sufficient balance to pay movement fee
- Movement fee is charged per move action (not per unit)

## Combat

### Deterministic Formula

- **Power**: `power = unitLevel * unitAmount`
- **Outcome**: Attacker wins if `attackerPower > defenderPower`; defender wins otherwise (ties go to defender)
- **Losses** (when attacker wins): `attackerLosses = (defenderPower * attackerAmount) / attackerPower`; defender loses all
- **Losses** (when defender wins): `defenderLosses = (attackerPower * defenderAmount) / defenderPower`; attacker loses all
- No randomness; outcome is fully predictable from onchain state

### PVE (Player vs Environment)

- Attacking an unowned or NPC-controlled location
- Minimum units required to attempt (e.g., 25 units)
- Defender power may be fixed (e.g., location difficulty) or zero for empty

### PVP (Player vs Player)

- Attacking a location controlled by another player
- Same power formula; defender may have deployed units
- Defender wins ties

## Spawn

- Players spawn units at designated spawn locations
- Spawn consumes resources (or base currency) from escrow
- Unit level determines resource cost (e.g., level 1 = Gold only; higher levels = Gold + materials)
- Spawn fee charged per spawn action

## Fee Model

### Fee Policy

- **Minimum**: Fee must be at least 10x the gas cost so that L2/gas is at most 10% of the fee
- **Typical actions** (move, spawn): ~$0.01 or less (at BNB $1000: 0.00001 BNB)
- **Expensive actions** (attack): ~$0.05 (at BNB $1000: 0.00005 BNB)

### Per-Action Fees

| Action | Default | USD est. (BNB @ $1000) |
|--------|---------|------------------------|
| move | 0.00001 BNB | $0.01 |
| spawn | 0.00001 BNB | $0.01 |
| attack | 0.00005 BNB | $0.05 |

### Fee Split

- **60%**: Protocol treasury (game operations, rewards, held)
- **10%**: DAO treasury (infrastructure, community-driven)
- **30%**: Routed to CL8Y buy-and-burn (swap for CL8Y on DEX, then burn)

### Fee Token

- Prototype: BNB (native) for simplicity; fees collected in contract
- Alternative: In-game ERC20; users approve and pay before action

## CL8Y Integration

1. FeeCollector receives fees (BNB or token)
2. On each fee collection (or batched): split 60/10/30
3. 30% portion: swap via DEX/router on opBNB for CL8Y
4. Burn received CL8Y (send to dead address or use burn function if available)
5. 60% to protocol treasury, 10% to DAO treasury

## Skill-Based Design

- All outcomes determined by: unit composition, positioning, power math
- No dice, no randomness, no oracle-based RNG
- Players can simulate battles offchain before submitting transactions
