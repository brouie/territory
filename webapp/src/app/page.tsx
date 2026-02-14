"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import Image from "next/image";
import { MapView } from "@/components/MapView";
import { PlayerPanel } from "@/components/PlayerPanel";
import { ActionPanel } from "@/components/ActionPanel";

type MobileTab = "map" | "player" | "actions";

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-mono transition-colors ${
        active
          ? "text-[#39c5cf] border-b-2 border-[#39c5cf] bg-[#0d1117]"
          : "text-[#8b949e] border-b border-[#21262d] hover:text-[#e6edf3]"
      }`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("map");
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
          className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-16"
          style={{
            background: "linear-gradient(180deg, #0a0e14 0%, #0d1117 40%, #161b22 100%)",
          }}
        >
          <Image
            src="/logo-transparent.png"
            alt="Territory"
            width={200}
            height={200}
            className="mb-6 sm:mb-8 w-40 h-40 sm:w-[280px] sm:h-[280px]"
            priority
          />
          <h1 className="font-mono text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#e6edf3] mb-2 sm:mb-3 text-center">
            Territory
          </h1>
          <p className="text-[#8b949e] text-base sm:text-lg max-w-md text-center mb-8 sm:mb-10 px-4">
            Onchain strategy. Capture locations. PVE and PVP. No RNG.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            <button
              onClick={() => connectors[0] && connect({ connector: connectors[0] })}
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold bg-[#39c5cf] text-[#0a0e14] rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-[#39c5cf]/20"
            >
              Connect Wallet
            </button>
            <Link
              href="/docs"
              className="w-full sm:w-auto px-8 py-4 text-base font-semibold border border-[#30363d] text-[#e6edf3] rounded-lg hover:bg-[#21262d] hover:border-[#39c5cf]/50 transition-colors flex items-center justify-center"
            >
              Docs
            </Link>
          </div>
          <div className="mt-12 sm:mt-16 flex flex-wrap justify-center gap-6 sm:gap-12 text-center px-4">
            <div>
              <p className="font-mono text-[#39c5cf] font-semibold mb-1">Onchain</p>
              <p className="text-xs sm:text-sm text-[#6e7681]">Fully verifiable</p>
            </div>
            <div>
              <p className="font-mono text-[#39c5cf] font-semibold mb-1">PVE + PVP</p>
              <p className="text-xs sm:text-sm text-[#6e7681]">Fight or defend</p>
            </div>
            <div>
              <p className="font-mono text-[#39c5cf] font-semibold mb-1">No RNG</p>
              <p className="text-xs sm:text-sm text-[#6e7681]">Skill-based</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#0a0e14]">
      {/* Header */}
      <header className="border-b border-[#21262d] px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between bg-[#0d1117]">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Image
              src="/logo-transparent.png"
              alt="Territory"
              width={32}
              height={32}
              className="object-contain sm:w-10 sm:h-10"
            />
            <h1 className="font-mono text-lg sm:text-xl font-bold tracking-tight text-[#39c5cf] hidden xs:block">
              Territory
            </h1>
          </Link>
          <Link
            href="/docs"
            className="text-xs sm:text-sm text-[#8b949e] hover:text-[#39c5cf] transition-colors"
          >
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-mono text-xs sm:text-sm text-[#8b949e] truncate max-w-[80px] sm:max-w-[140px]">
            {address?.slice(0, 4)}...{address?.slice(-3)}
          </span>
          <button
            onClick={() => disconnect()}
            className="px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border border-[#30363d] rounded hover:bg-[#21262d] transition-colors"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <nav className="lg:hidden flex border-b border-[#21262d] bg-[#0d1117]">
        <TabButton active={mobileTab === "map"} onClick={() => setMobileTab("map")}>
          Map
        </TabButton>
        <TabButton active={mobileTab === "player"} onClick={() => setMobileTab("player")}>
          Player
        </TabButton>
        <TabButton active={mobileTab === "actions"} onClick={() => setMobileTab("actions")}>
          Actions
        </TabButton>
      </nav>

      {/* Mobile Content */}
      <div className="lg:hidden flex-1 p-3 sm:p-4 overflow-auto">
        {mobileTab === "map" && (
          <div className="border border-[#21262d] rounded-lg p-3 sm:p-4 bg-[#0d1117]">
            <MapView />
          </div>
        )}
        {mobileTab === "player" && (
          <div className="border border-[#21262d] rounded-lg p-3 sm:p-4 bg-[#0d1117]">
            <PlayerPanel />
          </div>
        )}
        {mobileTab === "actions" && (
          <div className="border border-[#21262d] rounded-lg p-3 sm:p-4 bg-[#0d1117]">
            <ActionPanel />
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid flex-1 grid-cols-12 gap-4 p-6">
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
