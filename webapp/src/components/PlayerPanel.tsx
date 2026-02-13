"use client";

import { useAccount } from "wagmi";

export function PlayerPanel() {
  const { address, isConnected } = useAccount();

  if (!isConnected || !address) {
    return (
      <div className="space-y-3">
        <h2 className="font-mono font-semibold text-[#e6edf3]">Player</h2>
        <p className="text-sm text-[#8b949e]">Connect wallet to see status</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-mono font-semibold text-[#e6edf3]">Player</h2>
      <div className="space-y-2 text-sm">
        <p className="text-[#8b949e]">
          Location: <span className="font-mono text-[#e6edf3]">—</span>
        </p>
        <p className="text-[#8b949e]">
          Units: <span className="font-mono text-[#e6edf3]">—</span>
        </p>
        <p className="text-[#8b949e]">
          Gold: <span className="font-mono text-[#e6edf3]">—</span>
        </p>
      </div>
      <p className="text-xs text-[#6e7681]">
        Contract addresses and balances will load when deployed.
      </p>
    </div>
  );
}
