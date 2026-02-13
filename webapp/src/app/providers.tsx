"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { opBnbTestnet } from "@/lib/chains";
import { metaMask } from "wagmi/connectors";

const config = createConfig({
  chains: [opBnbTestnet],
  connectors: [metaMask()],
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
