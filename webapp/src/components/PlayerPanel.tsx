"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContracts } from "wagmi";
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

export function PlayerPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();

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
      <div className="space-y-4">
        <h2 className="font-mono font-semibold text-[#e6edf3]">Player</h2>
        <div className="space-y-2 text-sm">
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
      <div className="space-y-4">
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
          Location:{" "}
          <span className="font-mono text-[#e6edf3]">
            {isLoading
              ? "..."
              : location !== undefined
                  ? location === BigInt(0)
                  ? "—"
                  : String(location)
                : "—"}
          </span>
        </p>
        <p className="text-[#8b949e]">
          Units:{" "}
          <span className="font-mono text-[#e6edf3]">
            {unitsEscrow !== undefined
              ? formatUnits(unitsEscrow)
              : "—"}
          </span>
        </p>
        <p className="text-[#8b949e]">
          Gold (escrow):{" "}
          <span className="font-mono text-[#e6edf3]">
            {goldEscrow !== undefined
              ? formatUnits(goldEscrow)
              : "—"}
          </span>
        </p>
        <p className="text-[#8b949e]">
          Gold (wallet):{" "}
          <span className="font-mono text-[#e6edf3]">
            {goldWallet !== undefined
              ? formatUnits(goldWallet)
              : "—"}
          </span>
        </p>
      </div>
      <p className="text-xs text-[#6e7681]">
        Deposit Gold (after Approve), then Spawn. Spawn needs Gold in escrow.
      </p>
    </div>
  );
}
