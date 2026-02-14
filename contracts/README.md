# Contracts

Solidity contracts for Territory. Built with Foundry.

## Setup

```bash
# If Foundry is not installed, use the local copy (Windows):
$env:PATH = "d:\Dev\Projects\opbnb\.foundry;" + $env:PATH

# Install dependencies (if lib/ is empty)
forge install foundry-rs/forge-std --no-commit
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Build
forge build

# Test
forge test
```

## Deploy

### opBNB Testnet (recommended first)

Uses mock Router, CL8Y, and Gold. Your deployer gets 10,000 Gold.

```powershell
cd contracts
$env:PRIVATE_KEY = "0x..."   # your wallet private key
$env:TESTNET = "1"
$env:RPC_URL = "https://opbnb-testnet-rpc.bnbchain.org"
forge script script/Deploy.s.sol:DeployScript --rpc-url $env:RPC_URL --broadcast
```

### Lower testnet fees (optional)

If 0.001 tBNB per action is too high, the deployer can run:

```powershell
$env:PRIVATE_KEY = "0x..."
$env:MAP_ADDRESS = "0xc4D8C0f4B00f98b448292e0bB9f9B82A401e9855"
$env:COMBAT_ADDRESS = "0x69CF0E6312013ed119716e258aDA202C63BB6b1c"
$env:SPAWN_ADDRESS = "0x5289b528068d474f2c5870CBCEf8b7E402F1E03c"
$env:RPC_URL = "https://opbnb-testnet-rpc.bnbchain.org"
forge script script/SetTestnetFees.s.sol:SetTestnetFeesScript --rpc-url $env:RPC_URL --broadcast
```

Fees become: Move/Spawn 0.00001 BNB, Attack 0.00005 BNB. Frontend defaults match.

### opBNB Mainnet

```powershell
$env:PRIVATE_KEY = "0x..."
$env:TREASURY = "0x..."       # protocol treasury (game ops, rewards)
$env:DAO_TREASURY = "0x..."  # DAO multisig (infrastructure, community); defaults to deployer if unset
$env:ROUTER = "0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb"
$env:CL8Y_TOKEN = "0x..."
$env:WBNB = "0x4200000000000000000000000000000000000006"
$env:RPC_URL = "https://opbnb-mainnet-rpc.bnbchain.org"
# Optional: $env:GOLD_TOKEN = "0x..."
forge script script/Deploy.s.sol:DeployScript --rpc-url $env:RPC_URL --broadcast
```
