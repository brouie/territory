"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { opBnbTestnet } from "@/lib/chains";
import { injected } from "wagmi/connectors";

// Simple config with injected connector only
// This works with ALL browser extension wallets:
// - MetaMask
// - Trust Wallet (browser extension)
// - Rabby
// - Coinbase Wallet
// - OKX Wallet
// - And many more...
const config = createConfig({
  chains: [opBnbTestnet],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [opBnbTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
