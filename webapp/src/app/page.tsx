"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { MapView } from "@/components/MapView";
import { PlayerPanel } from "@/components/PlayerPanel";
import { ActionPanel } from "@/components/ActionPanel";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between bg-[#0d1117]">
        <h1 className="font-mono text-xl font-bold tracking-tight text-[#39c5cf]">
          Territory
        </h1>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <>
              <span className="font-mono text-sm text-[#8b949e] truncate max-w-[140px]">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="px-4 py-2 text-sm font-medium border border-[#30363d] rounded hover:bg-[#21262d] transition-colors"
              >
                Disconnect
              </button>
            </>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="px-4 py-2 text-sm font-medium bg-[#39c5cf] text-[#0a0e14] rounded hover:opacity-90 transition-opacity"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-4 p-6">
        <aside className="col-span-3 border border-[#21262d] rounded-lg p-4 bg-[#0d1117]">
          <PlayerPanel />
        </aside>
        <section className="col-span-6 border border-[#21262d] rounded-lg p-4 bg-[#0d1117] overflow-auto">
          <MapView />
        </section>
        <aside className="col-span-3 border border-[#21262d] rounded-lg p-4 bg-[#0d1117]">
          <ActionPanel />
        </aside>
      </div>
    </main>
  );
}
