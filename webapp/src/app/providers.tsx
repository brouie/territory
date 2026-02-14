"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { opBnbTestnet } from "@/lib/chains";

// Get projectId from https://cloud.reown.com (free)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

const metadata = {
  name: "Territory",
  description: "Onchain strategy game on opBNB",
  url: typeof window !== "undefined" ? window.location.origin : "https://territory.game",
  icons: ["/icon.png"],
};

// Create wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [opBnbTestnet],
});

// Create AppKit modal
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [opBnbTestnet],
  metadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#39c5cf",
    "--w3m-border-radius-master": "2px",
  },
  features: {
    analytics: false,
  },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
