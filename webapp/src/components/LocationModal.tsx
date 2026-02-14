"use client";

import { useEffect } from "react";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationId: number;
  owner: string | null;
  basePower: number;
  garrisonUnits: number;
  isYours: boolean;
  isPvp: boolean;
  adjacentLocations: number[];
}

const ADJACENCY_MAP: Record<number, number[]> = {
  1: [2, 3],
  2: [1, 3, 4],
  3: [1, 2, 4],
  4: [2, 3],
};

export function LocationModal({
  isOpen,
  onClose,
  locationId,
  owner,
  basePower,
  garrisonUnits,
  isYours,
  isPvp,
}: LocationModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const adjacentLocations = ADJACENCY_MAP[locationId] || [];
  const effectivePower = isPvp ? garrisonUnits : basePower;
  
  let statusColor = "text-[#8b949e]";
  let statusBg = "bg-[#21262d]";
  let statusText = "Unclaimed (PVE)";
  
  if (isYours) {
    statusColor = "text-green-400";
    statusBg = "bg-green-950/30";
    statusText = "You Own This";
  } else if (isPvp) {
    statusColor = "text-red-400";
    statusBg = "bg-red-950/30";
    statusText = "Enemy Territory (PVP)";
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-[#0d1117] border border-[#21262d] rounded-lg w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d]">
          <h3 className="font-mono font-semibold text-[#e6edf3]">
            Location {locationId}
          </h3>
          <button
            onClick={onClose}
            className="text-[#8b949e] hover:text-[#e6edf3] transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Status Badge */}
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-mono ${statusColor} ${statusBg}`}>
            {statusText}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-[#21262d] rounded p-3">
              <p className="text-[10px] sm:text-xs text-[#6e7681] mb-1">Defense Power</p>
              <p className="font-mono text-lg sm:text-xl text-[#e6edf3]">{effectivePower}</p>
              <p className="text-[10px] text-[#6e7681]">
                {isPvp ? "Garrison units" : "Base power"}
              </p>
            </div>
            <div className="border border-[#21262d] rounded p-3">
              <p className="text-[10px] sm:text-xs text-[#6e7681] mb-1">Type</p>
              <p className="font-mono text-lg sm:text-xl text-[#e6edf3]">{isPvp ? "PVP" : "PVE"}</p>
              <p className="text-[10px] text-[#6e7681]">
                {isPvp ? "Player owned" : "Environment"}
              </p>
            </div>
          </div>

          {/* Owner */}
          {isPvp && owner && (
            <div className="border border-[#21262d] rounded p-3">
              <p className="text-[10px] sm:text-xs text-[#6e7681] mb-1">Owner</p>
              <p className="font-mono text-xs sm:text-sm text-[#e6edf3] break-all">
                {isYours ? "You" : `${owner.slice(0, 6)}...${owner.slice(-4)}`}
              </p>
            </div>
          )}

          {/* Adjacent Locations */}
          <div className="border border-[#21262d] rounded p-3">
            <p className="text-[10px] sm:text-xs text-[#6e7681] mb-2">Connected To</p>
            <div className="flex gap-2">
              {adjacentLocations.map((loc) => (
                <span
                  key={loc}
                  className="px-3 py-1 bg-[#21262d] rounded font-mono text-sm text-[#39c5cf]"
                >
                  {loc}
                </span>
              ))}
            </div>
          </div>

          {/* Attack Hint */}
          {!isYours && (
            <div className="bg-[#161b22] rounded p-3 text-[10px] sm:text-xs text-[#8b949e]">
              <p className="font-mono text-[#39c5cf] mb-1">To capture:</p>
              <p>Need more than {effectivePower} power ({effectivePower + 1}+ units)</p>
            </div>
          )}

          {/* Fortify Hint for owned locations */}
          {isYours && (
            <div className="bg-[#161b22] rounded p-3 text-[10px] sm:text-xs text-[#8b949e]">
              <p className="font-mono text-green-400 mb-1">Tip:</p>
              <p>Fortify this location with more units to defend against attackers!</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#21262d]">
          <button
            onClick={onClose}
            className="w-full py-2 text-sm font-mono border border-[#30363d] rounded hover:border-[#39c5cf] hover:bg-[#21262d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
