"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Image from "next/image";
import { MapView } from "@/components/MapView";
import { PlayerPanel } from "@/components/PlayerPanel";
import { ActionPanel } from "@/components/ActionPanel";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0e14]">
        <div className="animate-pulse text-[#6e7681] font-mono">Loading...</div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen flex flex-col">
        <div
          className="flex-1 flex flex-col items-center justify-center px-6 py-16"
          style={{
            background: "linear-gradient(180deg, #0a0e14 0%, #0d1117 40%, #161b22 100%)",
          }}
        >
          <Image
            src="/logo-transparent.png"
            alt="Territory"
            width={280}
            height={280}
            className="mb-8"
            priority
          />
          <h1 className="font-mono text-4xl md:text-5xl font-bold tracking-tight text-[#e6edf3] mb-3">
            Territory
          </h1>
          <p className="text-[#8b949e] text-lg max-w-md text-center mb-10">
            Onchain strategy. Capture locations. PVE and PVP. No RNG.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="px-8 py-4 text-base font-semibold bg-[#39c5cf] text-[#0a0e14] rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#39c5cf]/20"
            >
              Connect Wallet
            </button>
            <Link
              href="/docs"
              className="px-8 py-4 text-base font-semibold border border-[#30363d] text-[#e6edf3] rounded-lg hover:bg-[#21262d] hover:border-[#39c5cf]/50 transition-colors flex items-center"
            >
              Docs
            </Link>
          </div>
          <div className="mt-16 flex gap-12 text-center">
            <div>
              <p className="font-mono text-[#39c5cf] font-semibold mb-1">Onchain</p>
              <p className="text-sm text-[#6e7681]">Fully verifiable</p>
            </div>
            <div>
              <p className="font-mono text-[#39c5cf] font-semibold mb-1">PVE + PVP</p>
              <p className="text-sm text-[#6e7681]">Fight or defend</p>
            </div>
            <div>
              <p className="font-mono text-[#39c5cf] font-semibold mb-1">No RNG</p>
              <p className="text-sm text-[#6e7681]">Skill-based</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-[#21262d] px-6 py-4 flex items-center justify-between bg-[#0d1117]">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
            src="/logo-transparent.png"
            alt="Territory"
            width={40}
            height={40}
            className="object-contain"
          />
          <h1 className="font-mono text-xl font-bold tracking-tight text-[#39c5cf]">
            Territory
          </h1>
          </Link>
          <Link
            href="/docs"
            className="text-sm text-[#8b949e] hover:text-[#39c5cf] transition-colors"
          >
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-[#8b949e] truncate max-w-[140px]">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 text-sm font-medium border border-[#30363d] rounded hover:bg-[#21262d] transition-colors"
          >
            Disconnect
          </button>
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
