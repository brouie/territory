"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADDRESSES,
  MAP_ABI,
  GAME_MASTER_ABI,
  UNIT_FACTORY_ABI,
  ERC20_ABI,
} from "@/lib/contracts";

function formatUnits(val: bigint, decimals = 18): string {
  if (val === BigInt(0)) return "0";
  const s = val.toString();
  if (s.length <= decimals) return "0." + s.padStart(decimals, "0");
  const intPart = s.slice(0, -decimals);
  const decPart = s.slice(-decimals).replace(/0+$/, "");
  return decPart ? `${intPart}.${decPart}` : intPart;
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#21262d] rounded ${className || ""}`} />
  );
}

export function PlayerPanel() {
  const [mounted, setMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  useEffect(() => setMounted(true), []);

  const queryClient = useQueryClient();
  const { address, isConnected } = useAccount();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["readContracts"] });
    await queryClient.invalidateQueries({ queryKey: ["readContract"] });
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const { data, isLoading } = useReadContracts({
    query: { refetchInterval: 4000 },
    contracts: [
      {
        address: ADDRESSES.map,
        abi: MAP_ABI,
        functionName: "getPlayerLocation",
        args: address ? [address] : undefined,
      },
      {
        address: ADDRESSES.unitFactory,
        abi: UNIT_FACTORY_ABI,
        functionName: "getToken",
        args: [BigInt(1)],
      },
    ],
  });

  const location = data?.[0]?.result as bigint | undefined;
  const unitTokenAddr = data?.[1]?.result as `0x${string}` | undefined;

  const { data: balanceData } = useReadContracts({
    query: { refetchInterval: 4000 },
    contracts: [
      {
        address: ADDRESSES.gold,
        abi: ERC20_ABI,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
      },
      {
        address: ADDRESSES.gameMaster,
        abi: GAME_MASTER_ABI,
        functionName: "getBalance",
        args: address && ADDRESSES.gold ? [address, ADDRESSES.gold] : undefined,
      },
      {
        address: ADDRESSES.gameMaster,
        abi: GAME_MASTER_ABI,
        functionName: "getBalance",
        args:
          address && unitTokenAddr
            ? [address, unitTokenAddr]
            : undefined,
      },
    ],
  });

  const goldWallet = balanceData?.[0]?.result as bigint | undefined;
  const goldEscrow = balanceData?.[1]?.result as bigint | undefined;
  const unitsEscrow = balanceData?.[2]?.result as bigint | undefined;

  if (!mounted) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="font-mono font-semibold text-[#e6edf3] text-sm sm:text-base">Player</h2>
        <div className="space-y-2 text-xs sm:text-sm">
          <p className="text-[#8b949e]">Location: <span className="font-mono text-[#e6edf3]">—</span></p>
          <p className="text-[#8b949e]">Units: <span className="font-mono text-[#e6edf3]">—</span></p>
          <p className="text-[#8b949e]">Gold (escrow): <span className="font-mono text-[#e6edf3]">—</span></p>
          <p className="text-[#8b949e]">Gold (wallet): <span className="font-mono text-[#e6edf3]">—</span></p>
        </div>
      </div>
    );
  }

  if (!isConnected || !address) {
    return (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="font-mono font-semibold text-[#e6edf3] text-sm sm:text-base">Player</h2>
        <p className="text-xs sm:text-sm text-[#8b949e]">Connect wallet to see status</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono font-semibold text-[#e6edf3] text-sm sm:text-base">Player</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-1.5 text-[#6e7681] hover:text-[#39c5cf] transition-colors disabled:opacity-50"
          title="Refresh data"
        >
          <svg 
            className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
        </button>
      </div>
      
      {/* Loading skeleton state */}
      {isLoading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-0 sm:space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-[#21262d] rounded p-2 sm:border-0 sm:p-0">
              <Skeleton className="h-3 w-16 mb-1 sm:hidden" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}
        </div>
      )}
      
      {/* Mobile: Grid layout, Desktop: List */}
      {!isLoading && (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-1 sm:gap-0 sm:space-y-2">
        <div className="border border-[#21262d] rounded p-2 sm:border-0 sm:p-0">
          <p className="text-[10px] sm:text-xs text-[#6e7681] sm:hidden">Location</p>
          <p className="text-xs sm:text-sm text-[#8b949e]">
            <span className="hidden sm:inline">Location: </span>
            <span className="font-mono text-[#e6edf3] text-base sm:text-sm">
              {isLoading
                ? "..."
                : location !== undefined
                    ? location === BigInt(0)
                    ? "—"
                    : String(location)
                  : "—"}
            </span>
          </p>
        </div>
        <div className="border border-[#21262d] rounded p-2 sm:border-0 sm:p-0">
          <p className="text-[10px] sm:text-xs text-[#6e7681] sm:hidden">Units</p>
          <p className="text-xs sm:text-sm text-[#8b949e]">
            <span className="hidden sm:inline">Units: </span>
            <span className="font-mono text-[#e6edf3] text-base sm:text-sm">
              {unitsEscrow !== undefined
                ? formatUnits(unitsEscrow)
                : "—"}
            </span>
          </p>
        </div>
        <div className="border border-[#21262d] rounded p-2 sm:border-0 sm:p-0">
          <p className="text-[10px] sm:text-xs text-[#6e7681] sm:hidden">Gold (escrow)</p>
          <p className="text-xs sm:text-sm text-[#8b949e]">
            <span className="hidden sm:inline">Gold (escrow): </span>
            <span className="font-mono text-[#e6edf3] text-base sm:text-sm">
              {goldEscrow !== undefined
                ? formatUnits(goldEscrow)
                : "—"}
            </span>
          </p>
        </div>
        <div className="border border-[#21262d] rounded p-2 sm:border-0 sm:p-0">
          <p className="text-[10px] sm:text-xs text-[#6e7681] sm:hidden">Gold (wallet)</p>
          <p className="text-xs sm:text-sm text-[#8b949e]">
            <span className="hidden sm:inline">Gold (wallet): </span>
            <span className="font-mono text-[#e6edf3] text-base sm:text-sm">
              {goldWallet !== undefined
                ? formatUnits(goldWallet)
                : "—"}
            </span>
          </p>
        </div>
      </div>
      )}
      
      <p className="text-[10px] sm:text-xs text-[#6e7681]">
        Deposit Gold (after Approve), then Spawn. Spawn needs Gold in escrow.
      </p>
    </div>
  );
}
