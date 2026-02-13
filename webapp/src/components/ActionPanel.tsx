"use client";

import { useAccount } from "wagmi";

export function ActionPanel() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="space-y-3">
        <h2 className="font-mono font-semibold text-[#e6edf3]">Actions</h2>
        <p className="text-sm text-[#8b949e]">Connect wallet to interact</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-mono font-semibold text-[#e6edf3]">Actions</h2>
      <div className="space-y-3">
        <div className="border border-[#21262d] rounded p-3">
          <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Move</h3>
          <p className="text-xs text-[#8b949e] mb-2">
            From location to adjacent. Fee: 0.001 BNB
          </p>
          <button
            disabled
            className="w-full py-2 text-sm font-mono border border-[#30363d] rounded text-[#6e7681] cursor-not-allowed"
          >
            Move (deploy contracts first)
          </button>
        </div>
        <div className="border border-[#21262d] rounded p-3">
          <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Attack</h3>
          <p className="text-xs text-[#8b949e] mb-2">
            Deterministic combat. Fee: 0.001 BNB
          </p>
          <button
            disabled
            className="w-full py-2 text-sm font-mono border border-[#30363d] rounded text-[#6e7681] cursor-not-allowed"
          >
            Attack
          </button>
        </div>
        <div className="border border-[#21262d] rounded p-3">
          <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Spawn</h3>
          <p className="text-xs text-[#8b949e] mb-2">
            Create units from Gold. Fee: 0.001 BNB
          </p>
          <button
            disabled
            className="w-full py-2 text-sm font-mono border border-[#30363d] rounded text-[#6e7681] cursor-not-allowed"
          >
            Spawn
          </button>
        </div>
      </div>
    </div>
  );
}
