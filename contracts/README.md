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

## Deploy (opBNB)

```bash
export PRIVATE_KEY=...
export TREASURY=0x...
export ROUTER=0x8cFe327CEc66d1C090Dd72bd0FF11d690C33a2Eb  # PancakeSwap V2 opBNB
export CL8Y_TOKEN=0x...   # CL8Y on opBNB/BSC
export WBNB=0x4200000000000000000000000000000000000006  # opBNB WBNB

forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --broadcast
```
