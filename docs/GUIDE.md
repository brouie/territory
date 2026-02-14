# Territory: Player Guide

This guide covers how to play Territory from first connection through combat and territorial control.

## Getting Started (Testnet)

### Step 1: Add opBNB Testnet to Your Wallet

Add opBNB Testnet to MetaMask with these settings:
- **Network Name:** opBNB Testnet
- **RPC URL:** https://opbnb-testnet-rpc.bnbchain.org
- **Chain ID:** 5611
- **Symbol:** tBNB
- **Explorer:** https://opbnb-testnet.bscscan.com

### Step 2: Get tBNB for Fees

Visit the BNB Chain Testnet Faucet: https://www.bnbchain.org/en/testnet-faucet

Enter your wallet address and request tBNB. Each action costs a small fee, so keep some tBNB available.

### Step 3: Get Gold Tokens

On testnet, Gold is minted to the contract deployer. Ask in the Territory community for testnet Gold, or deploy your own contracts for testing.

### Step 4: Connect to Territory

Visit the game, click "Connect Wallet", and ensure you're on opBNB Testnet (chain 5611).

## Before You Start

You need a wallet that supports opBNB or BSC (MetaMask, Trust Wallet, or similar). Ensure you have some BNB for transaction fees. Each action costs a small fee in BNB. Fees are split: 60% to protocol treasury, 10% to DAO treasury, and 30% to CL8Y buy-and-burn.

Contracts must be deployed before you can interact. If you see "deploy contracts first" in the UI, the frontend is waiting for contract addresses from a deployment.

## Map Layout

The map consists of 4 locations connected by paths:

```
       [1]
      /   \
    [2]---[3]
      \   /
       [4]
```

**Adjacent connections:**
- Location 1 connects to: 2, 3
- Location 2 connects to: 1, 3, 4
- Location 3 connects to: 1, 2, 4
- Location 4 connects to: 2, 3

You cannot skip locations. To travel from 1 to 4, you must move through 2 or 3.

## Game Actions

### 1. Deposit Gold

Gold is the base resource. You obtain it offchain (faucet, DEX, or another player) and deposit it into the GameMaster escrow. Approve the contract for your Gold token, then call `deposit(goldToken, amount)`. Your balance is tracked onchain and used for spawning units.

### 2. Spawn Units

Units are created by spending Gold. Each spawn action consumes Gold and mints units into your GameMaster balance. Level 1 units cost 1 Gold per unit. Higher levels require more or different resources.

Call `spawn(locationId, level, amount)` with enough BNB to cover the spawn fee. Units land in your escrow balance. You need at least 25 units to attack.

### 3. Move Between Locations

The map is a graph of locations connected by edges. You can only move to a location that is adjacent to your current one. Your position is updated onchain.

Call `move(fromId, toId)` and send the move fee in BNB. Your player location changes. Movement does not consume units; it relocates you for attack range and logistics.

### 4. Attack

Attacking resolves deterministically. Power equals level times amount: if you send 100 level-1 units, your power is 100.

- **PVE:** Unowned locations have a fixed base power. Your power must exceed it to win. If you win, you take ownership. If you lose, your attacking units are burned.
- **PVP:** Locations held by other players are defended by their fortified units. Same power formula applies. Defender wins ties.

Losses scale with the power ratio. When the attacker wins, attacker losses equal `(defenderPower * attackerAmount) / attackerPower`. The defender loses all deployed units. When the defender wins, the attacker loses everything; the defender loses a proportional amount.

### 5. Fortify

After capturing a location, you can fortify it by moving units there. Call `fortify(locationId, unitToken, amount)`. Those units leave your balance and sit at the location, contributing to its defender power. They are spent if you lose a battle there.

## Fee Structure

| Action | Fee (BNB) |
|--------|-----------|
| Move   | 0.00001   |
| Spawn  | 0.00001   |
| Attack | 0.00005   |

Fees are split: 60% protocol treasury, 10% DAO treasury, 30% CL8Y buy-and-burn. Excess BNB sent with a transaction is refunded.

## Tips

- Simulate battles before attacking. Outcomes are deterministic; you can compute them offchain.
- Fortify valuable locations. An empty captured node is easy to retake.
- Watch adjacency. You cannot skip locations.
- Keep enough BNB for multiple actions. Each move, attack, and spawn is a separate transaction.
