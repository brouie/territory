import { defineChain } from "viem";

export const opBnbTestnet = defineChain({
  id: 5611,
  name: "opBNB Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://opbnb-testnet-rpc.bnbchain.org"] },
  },
  blockExplorers: {
    default: {
      name: "opBNB Scan",
      url: "https://opbnb-testnet.bscscan.com",
    },
  },
});
