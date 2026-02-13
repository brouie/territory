"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import {
  ADDRESSES,
  MAP_ABI,
  GARRISON_ABI,
  COMBAT_ABI,
  UNIT_FACTORY_ABI,
} from "@/lib/contracts";

const LOCATIONS = [
  { id: 1, x: 50, y: 18, label: "1" },
  { id: 2, x: 22, y: 50, label: "2" },
  { id: 3, x: 78, y: 50, label: "3" },
  { id: 4, x: 50, y: 82, label: "4" },
];

const EDGES = [
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 4],
];

export function MapView() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();

  const { data: playerLoc } = useReadContract({
    address: ADDRESSES.map,
    abi: MAP_ABI,
    functionName: "getPlayerLocation",
    args: address ? [address] : undefined,
  }) as { data?: bigint };

  const { data: unitToken } = useReadContract({
    address: ADDRESSES.unitFactory,
    abi: UNIT_FACTORY_ABI,
    functionName: "getToken",
    args: [BigInt(1)],
  }) as { data?: `0x${string}` };

  const { data: garrisonAddr } = useReadContract({
    address: ADDRESSES.combat,
    abi: COMBAT_ABI,
    functionName: "garrison",
  }) as { data?: `0x${string}` };

  const { data: ownersData } = useReadContracts({
    query: { refetchInterval: 4000 },
    contracts: LOCATIONS.map((l) => ({
      address: ADDRESSES.map,
      abi: MAP_ABI,
      functionName: "getLocationOwner",
      args: [BigInt(l.id)],
    })),
  });

  const { data: basePowerData } = useReadContracts({
    contracts: LOCATIONS.map((l) => ({
      address: ADDRESSES.map,
      abi: MAP_ABI,
      functionName: "getLocationBasePower",
      args: [BigInt(l.id)],
    })),
  });

  const { data: garrisonData } = useReadContracts({
    contracts:
      garrisonAddr && unitToken
        ? LOCATIONS.map((l) => ({
            address: garrisonAddr,
            abi: GARRISON_ABI,
            functionName: "getUnits",
            args: [BigInt(l.id), unitToken],
          }))
        : [],
  });

  if (!mounted || !isConnected) {
    return (
      <div className="h-[420px] flex items-center justify-center text-[#8b949e] font-mono border border-[#21262d] rounded-lg bg-[#0a0e14]">
        Connect wallet to view map
      </div>
    );
  }

  const locId = playerLoc !== undefined ? Number(playerLoc) : 0;

  return (
    <div className="space-y-3">
      <h2 className="font-mono font-semibold text-[#e6edf3]">Territory Map</h2>
      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{
          minHeight: 420,
          background: "linear-gradient(180deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
          border: "1px solid #21262d",
          boxShadow: "inset 0 0 80px rgba(0,0,0,0.4)",
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          style={{ minHeight: 420 }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#21262d" strokeWidth="0.2" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          {EDGES.map(([a, b], i) => {
            const from = LOCATIONS.find((l) => l.id === a)!;
            const to = LOCATIONS.find((l) => l.id === b)!;
            return (
              <line
                key={i}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="#30363d"
                strokeWidth="0.6"
                strokeLinecap="round"
              />
            );
          })}
          {LOCATIONS.map((loc, i) => {
            const owner = ownersData?.[i]?.result as `0x${string}` | undefined;
            const basePower = basePowerData?.[i]?.result as bigint | undefined;
            const garrison = garrisonData?.[i]?.result as bigint | undefined;
            const isYours = owner && address && owner.toLowerCase() === address.toLowerCase();
            const isPvp = owner && owner !== "0x0000000000000000000000000000000000000000";
            const power =
              isPvp && garrison !== undefined
                ? Number(garrison) / 1e18
                : basePower !== undefined
                  ? Number(basePower) / 1e18
                  : 0;
            const isYouHere = locId === loc.id;
            let fill = "#1c2128";
            let stroke = "#30363d";
            if (isYours) {
              fill = "#0d3d2e";
              stroke = isYouHere ? "#39c5cf" : "#238636";
            } else if (isPvp) {
              fill = "#3d1c1c";
              stroke = "#da3633";
            } else {
              fill = "#1c2128";
              stroke = "#8b949e";
            }
            if (isYouHere) stroke = "#39c5cf";
            return (
              <g key={loc.id} filter={isYouHere ? "url(#glow)" : undefined}>
                <circle
                  cx={loc.x}
                  cy={loc.y}
                  r="6"
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isYouHere ? "1.2" : "0.8"}
                />
                <text
                  x={loc.x}
                  y={loc.y - 4.5}
                  textAnchor="middle"
                  fontSize="3"
                  fill="#e6edf3"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {loc.label}
                </text>
                <text
                  x={loc.x}
                  y={loc.y + 6}
                  textAnchor="middle"
                  fontSize="2"
                  fill="#8b949e"
                  fontFamily="monospace"
                >
                  {power > 0 ? `${Math.floor(power)}` : "-"}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="absolute bottom-3 left-3 right-3 flex justify-between text-xs text-[#6e7681] font-mono">
          <span>Numbers = power</span>
          <span>You: teal | Yours: green | Enemy: red | PVE: gray</span>
        </div>
      </div>
      <p className="text-xs text-[#8b949e] font-mono">
        Fortify your captures to defend. Attack PVE or PVP. Power = level x units.
      </p>
    </div>
  );
}
