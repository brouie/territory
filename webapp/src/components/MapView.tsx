"use client";

import { useAccount } from "wagmi";

const LOCATIONS = [
  { id: 1, x: 50, y: 20, label: "1" },
  { id: 2, x: 30, y: 50, label: "2" },
  { id: 3, x: 70, y: 50, label: "3" },
  { id: 4, x: 50, y: 80, label: "4" },
];

const EDGES = [
  [1, 2],
  [1, 3],
  [2, 3],
  [2, 4],
  [3, 4],
];

export function MapView() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="h-[400px] flex items-center justify-center text-[#8b949e] font-mono">
        Connect wallet to view map
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-mono font-semibold text-[#e6edf3]">Map</h2>
      <div
        className="relative w-full h-[400px] rounded border border-[#21262d] bg-[#0a0e14]"
        style={{ minHeight: 400 }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
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
                strokeWidth="0.5"
              />
            );
          })}
          {LOCATIONS.map((loc) => (
            <g key={loc.id}>
              <circle
                cx={loc.x}
                cy={loc.y}
                r="4"
                fill="#0d1117"
                stroke="#39c5cf"
                strokeWidth="0.8"
              />
              <text
                x={loc.x}
                y={loc.y + 0.8}
                textAnchor="middle"
                fontSize="2"
                fill="#8b949e"
                fontFamily="monospace"
              >
                {loc.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="text-sm text-[#8b949e] font-mono">
        Locations 1–4. Use Move or Attack in the actions panel.
      </p>
    </div>
  );
}
