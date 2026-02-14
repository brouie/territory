"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { opBnbTestnet } from "@/lib/chains";
import { injected, walletConnect } from "wagmi/connectors";

// Get projectId from https://cloud.reown.com (free)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const metadata = {
  name: "Territory",
  description: "Onchain strategy game on opBNB",
  url: typeof window !== "undefined" ? window.location.origin : "https://territory.game",
  icons: ["/icon.png"],
};

// Create config with appropriate connectors
const config = createConfig({
  chains: [opBnbTestnet],
  connectors: projectId && projectId !== "demo-project-id"
    ? [
        injected({ shimDisconnect: true }),
        walletConnect({
          projectId,
          metadata,
          showQrModal: true,
        }),
      ]
    : [
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
