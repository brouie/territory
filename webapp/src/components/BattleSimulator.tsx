"use client";

import { useMemo } from "react";

interface BattleSimulatorProps {
  attackerPower: number;
  defenderPower: number;
  attackerUnits: number;
  isPvp: boolean;
}

interface BattleResult {
  outcome: "win" | "lose" | "invalid";
  attackerLosses: number;
  defenderLosses: number;
  attackerRemaining: number;
  message: string;
}

function simulateBattle(
  attackerPower: number,
  defenderPower: number,
  attackerUnits: number,
  isPvp: boolean
): BattleResult {
  // Invalid cases
  if (attackerUnits < 25) {
    return {
      outcome: "invalid",
      attackerLosses: 0,
      defenderLosses: 0,
      attackerRemaining: attackerUnits,
      message: "Need at least 25 units to attack",
    };
  }

  if (defenderPower === 0) {
    return {
      outcome: "win",
      attackerLosses: 0,
      defenderLosses: 0,
      attackerRemaining: attackerUnits,
      message: "Empty location - guaranteed win!",
    };
  }

  // Defender wins ties
  if (attackerPower <= defenderPower) {
    return {
      outcome: "lose",
      attackerLosses: attackerUnits,
      defenderLosses: isPvp ? Math.floor((attackerPower * defenderPower) / defenderPower) : 0,
      attackerRemaining: 0,
      message: `You lose! Need more than ${defenderPower} power (currently ${attackerPower})`,
    };
  }

  // Attacker wins
  // Loss formula: attackerLosses = (defenderPower * attackerUnits) / attackerPower
  const attackerLosses = Math.ceil((defenderPower * attackerUnits) / attackerPower);
  const attackerRemaining = attackerUnits - attackerLosses;

  return {
    outcome: "win",
    attackerLosses,
    defenderLosses: defenderPower, // Defender loses all
    attackerRemaining,
    message: `Victory! You capture the location.`,
  };
}

export function BattleSimulator({
  attackerPower,
  defenderPower,
  attackerUnits,
  isPvp,
}: BattleSimulatorProps) {
  const result = useMemo(
    () => simulateBattle(attackerPower, defenderPower, attackerUnits, isPvp),
    [attackerPower, defenderPower, attackerUnits, isPvp]
  );

  if (attackerUnits < 25) {
    return null;
  }

  const isWin = result.outcome === "win";
  const borderColor = isWin ? "border-green-900/50" : "border-red-900/50";
  const bgColor = isWin ? "bg-green-950/20" : "bg-red-950/20";
  const textColor = isWin ? "text-green-400" : "text-red-400";

  return (
    <div className={`rounded border ${borderColor} ${bgColor} p-2 sm:p-3 mb-2`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`font-mono font-bold ${textColor} text-xs sm:text-sm`}>
          {isWin ? "VICTORY" : "DEFEAT"}
        </span>
        <span className="text-[10px] sm:text-xs text-[#6e7681]">
          (Battle Preview)
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs mb-2">
        <div className="space-y-1">
          <p className="text-[#8b949e]">Your Power</p>
          <p className="font-mono text-[#e6edf3]">{attackerPower}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[#8b949e]">Defender Power</p>
          <p className="font-mono text-[#e6edf3]">{defenderPower}</p>
        </div>
      </div>

      {isWin && result.attackerLosses > 0 && (
        <div className="border-t border-[#21262d] pt-2 mt-2">
          <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
            <div>
              <p className="text-[#8b949e]">Units Lost</p>
              <p className="font-mono text-amber-400">-{result.attackerLosses}</p>
            </div>
            <div>
              <p className="text-[#8b949e]">Units Remaining</p>
              <p className="font-mono text-green-400">{result.attackerRemaining}</p>
            </div>
          </div>
        </div>
      )}

      <p className={`text-[10px] sm:text-xs ${textColor} mt-2`}>
        {result.message}
      </p>
    </div>
  );
}
