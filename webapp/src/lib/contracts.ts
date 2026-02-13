/**
 * Contract addresses and ABIs for Territory.
 * Addresses are public (deployed onchain). Override via NEXT_PUBLIC_* env vars.
 * NEVER put PRIVATE_KEY or recovery phrase here or in any env file committed to git.
 */

// opBNB testnet deployment (override with env)
export const ADDRESSES = {
  map: (process.env.NEXT_PUBLIC_MAP_ADDRESS ||
    "0xc4D8C0f4B00f98b448292e0bB9f9B82A401e9855") as `0x${string}`,
  gameMaster: (process.env.NEXT_PUBLIC_GAME_MASTER_ADDRESS ||
    "0x6c3F4d82dE2ed80FB16ed913C2d9269823140Ab6") as `0x${string}`,
  gold: (process.env.NEXT_PUBLIC_GOLD_ADDRESS ||
    "0x30FdB72a6cCcE6B88aB4096d853Fc594CE46520D") as `0x${string}`,
  combat: (process.env.NEXT_PUBLIC_COMBAT_ADDRESS ||
    "0x69CF0E6312013ed119716e258aDA202C63BB6b1c") as `0x${string}`,
  spawn: (process.env.NEXT_PUBLIC_SPAWN_ADDRESS ||
    "0x5289b528068d474f2c5870CBCEf8b7E402F1E03c") as `0x${string}`,
  unitFactory: (process.env.NEXT_PUBLIC_UNIT_FACTORY_ADDRESS ||
    "0x638e2663E256162DDD4511F347b9a59AB4E1316d") as `0x${string}`,
} as const;

// Per-action fees (BNB @ $1000: move/spawn ~$0.01, attack ~$0.05)
// Override with NEXT_PUBLIC_*_FEE_WEI if contracts use different values
const MOVE_FEE = process.env.NEXT_PUBLIC_MOVE_FEE_WEI
  ? BigInt(process.env.NEXT_PUBLIC_MOVE_FEE_WEI)
  : BigInt("10000000000000000"); // 0.00001 ether
const SPAWN_FEE = process.env.NEXT_PUBLIC_SPAWN_FEE_WEI
  ? BigInt(process.env.NEXT_PUBLIC_SPAWN_FEE_WEI)
  : BigInt("10000000000000000"); // 0.00001 ether
const ATTACK_FEE = process.env.NEXT_PUBLIC_ATTACK_FEE_WEI
  ? BigInt(process.env.NEXT_PUBLIC_ATTACK_FEE_WEI)
  : BigInt("50000000000000000"); // 0.00005 ether

export const FEES = { move: MOVE_FEE, spawn: SPAWN_FEE, attack: ATTACK_FEE } as const;

// Minimal ABIs for the functions we use
export const MAP_ABI = [
  {
    name: "getPlayerLocation",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "move",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "fromId", type: "uint256" },
      { name: "toId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "isAdjacent",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "fromId", type: "uint256" },
      { name: "toId", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "getLocationBasePower",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "locationId", type: "uint256" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getLocationOwner",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "locationId", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
] as const;

export const GAME_MASTER_ABI = [
  {
    name: "getBalance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ type: "bool" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const COMBAT_ABI = [
  {
    name: "garrison",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    name: "attack",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "locationId", type: "uint256" },
      { name: "unitToken", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const SPAWN_ABI = [
  {
    name: "spawn",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "locationId", type: "uint256" },
      { name: "level", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

export const GARRISON_ABI = [
  {
    name: "fortify",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "locationId", type: "uint256" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "getUnits",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "locationId", type: "uint256" },
      { name: "token", type: "address" },
    ],
    outputs: [{ type: "uint256" }],
  },
] as const;

export const UNIT_FACTORY_ABI = [
  {
    name: "getToken",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "level", type: "uint256" }],
    outputs: [{ type: "address" }],
  },
] as const;
