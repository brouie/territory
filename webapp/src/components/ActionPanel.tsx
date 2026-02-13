"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import {
  ADDRESSES,
  FEES,
  MAP_ABI,
  GAME_MASTER_ABI,
  GARRISON_ABI,
  ERC20_ABI,
  COMBAT_ABI,
  SPAWN_ABI,
  UNIT_FACTORY_ABI,
} from "@/lib/contracts";
import { parseEther } from "viem";

const LOCATIONS = [1, 2, 3, 4];
const MIN_ATTACK = parseEther("25"); // 25 ether

function ActionButton({
  label,
  onClick,
  disabled,
  loading,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-2 text-sm font-mono border border-[#30363d] rounded hover:border-[#39c5cf] hover:bg-[#21262d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? "..." : label}
    </button>
  );
}

export function ActionPanel() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [depositAmount, setDepositAmount] = useState("");
  const [spawnLoc, setSpawnLoc] = useState(1);
  const [spawnAmount, setSpawnAmount] = useState("");
  const [moveFrom, setMoveFrom] = useState(1);
  const [moveTo, setMoveTo] = useState(2);
  const [attackLoc, setAttackLoc] = useState(1);
  const [attackAmount, setAttackAmount] = useState("");
  const [fortifyLoc, setFortifyLoc] = useState(1);
  const [fortifyAmount, setFortifyAmount] = useState("");

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

  const { data: locationOwners } = useReadContracts({
    contracts: LOCATIONS.map((id) => ({
      address: ADDRESSES.map,
      abi: MAP_ABI,
      functionName: "getLocationOwner",
      args: [BigInt(id)],
    })),
  });

  const { data: locationPowers } = useReadContracts({
    contracts: LOCATIONS.map((id) => ({
      address: ADDRESSES.map,
      abi: MAP_ABI,
      functionName: "getLocationBasePower",
      args: [BigInt(id)],
    })),
  });

  const { data: garrisonUnits } = useReadContracts({
    contracts:
      garrisonAddr && unitToken
        ? LOCATIONS.map((id) => ({
            address: garrisonAddr,
            abi: GARRISON_ABI,
            functionName: "getUnits",
            args: [BigInt(id), unitToken],
          }))
        : [],
  });

  const ERC20_FULL_ABI = [
    ...ERC20_ABI,
    {
      name: "allowance",
      type: "function",
      stateMutability: "view",
      inputs: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
      ],
      outputs: [{ type: "uint256" }],
    },
  ] as const;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ADDRESSES.gold,
    abi: ERC20_FULL_ABI,
    functionName: "allowance",
    args: address ? [address, ADDRESSES.gameMaster] : undefined,
    query: { refetchInterval: 3000 },
  });

  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, reset, error: writeError } = useWriteContract();
  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isTxSuccess,
    isError: isTxError,
    error: txError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isTxSuccess && hash) {
      if (typeof window !== "undefined") {
        console.log("[Territory] tx confirmed:", { hash, blockNumber: receipt?.blockNumber, status: receipt?.status });
      }
      refetchAllowance();
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      reset();
    }
  }, [isTxSuccess, hash, receipt, refetchAllowance, queryClient, reset]);

  const loading = isPending || isConfirming;
  const depositAmt = parseEther(depositAmount || "0");
  const needsApprove = allowance !== undefined && allowance < depositAmt && depositAmt > BigInt(0);

  const handleApprove = () => {
    const max = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935");
    writeContract(
      {
        address: ADDRESSES.gold,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ADDRESSES.gameMaster, max],
      },
      {}
    );
  };

  const handleDeposit = () => {
    if (depositAmt <= BigInt(0)) return;
    writeContract(
      {
        address: ADDRESSES.gameMaster,
        abi: GAME_MASTER_ABI,
        functionName: "deposit",
        args: [ADDRESSES.gold, depositAmt],
      },
      {}
    );
  };

  const handleSpawn = () => {
    const amt = parseEther(spawnAmount || "0");
    if (amt <= BigInt(0)) return;
    writeContract(
      {
        address: ADDRESSES.spawn,
        abi: SPAWN_ABI,
        functionName: "spawn",
        args: [BigInt(spawnLoc), BigInt(1), amt],
        value: FEES.spawn,
      },
      {}
    );
  };

  const handleMove = () => {
    writeContract(
      {
        address: ADDRESSES.map,
        abi: MAP_ABI,
        functionName: "move",
        args: [BigInt(moveFrom), BigInt(moveTo)],
        value: FEES.move,
      },
      {}
    );
  };

  const ownedLocationIds = LOCATIONS.filter((id, i) => {
    const owner = locationOwners?.[i]?.result as `0x${string}` | undefined;
    return owner && address && owner.toLowerCase() === address.toLowerCase();
  });

  const getDefenderPower = (locIndex: number) => {
    const owner = locationOwners?.[locIndex]?.result as `0x${string}` | undefined;
    const basePower = locationPowers?.[locIndex]?.result as bigint | undefined;
    const garrison = garrisonUnits?.[locIndex]?.result as bigint | undefined;
    if (owner && address && owner !== "0x0000000000000000000000000000000000000000") {
      const g = garrison !== undefined ? Number(garrison) / 1e18 : 0;
      return g;
    }
    return basePower !== undefined ? Number(basePower) / 1e18 : 0;
  };

  const handleFortify = () => {
    const effectiveLoc = ownedLocationIds.includes(fortifyLoc) ? fortifyLoc : ownedLocationIds[0];
    const locId = effectiveLoc ?? 0;
    const amt = parseEther(fortifyAmount || "0");
    if (locId <= 0 || amt <= BigInt(0) || !unitToken || !garrisonAddr) return;
    writeContract(
      {
        address: garrisonAddr,
        abi: GARRISON_ABI,
        functionName: "fortify",
        args: [BigInt(locId), unitToken, amt],
      },
      {}
    );
  };

  const handleAttack = () => {
    const amt = parseEther(attackAmount || "0");
    if (amt < MIN_ATTACK || !unitToken) return;
    writeContract(
      {
        address: ADDRESSES.combat,
        abi: COMBAT_ABI,
        functionName: "attack",
        args: [BigInt(attackLoc), unitToken, amt],
        value: FEES.attack,
      },
      {}
    );
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <h2 className="font-mono font-semibold text-[#e6edf3]">Actions</h2>
        <p className="text-sm text-[#8b949e]">Loading...</p>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="space-y-4">
        <h2 className="font-mono font-semibold text-[#e6edf3]">Actions</h2>
        <p className="text-sm text-[#8b949e]">Connect wallet to interact</p>
      </div>
    );
  }

  const txMessage = writeError?.message || txError?.message;
  const showError = (writeError || isTxError) && txMessage;
  const wrongChain = chainId !== 5611;

  return (
    <div className="space-y-4">
      <h2 className="font-mono font-semibold text-[#e6edf3]">Actions</h2>
      <p className="text-xs text-[#6e7681]">
        Order: Approve - Deposit - Spawn - Move - Fortify (defend) - Attack
      </p>
      {wrongChain && (
        <div className="rounded border border-amber-900/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-400">
          Wrong network. Switch to opBNB Testnet (chain 5611).
        </div>
      )}
      {loading && (
        <div className="rounded border border-[#30363d] px-3 py-2 text-sm text-[#8b949e] flex items-center justify-between gap-2">
          <span>Waiting for confirmation...</span>
          <button
            type="button"
            onClick={() => reset()}
            className="shrink-0 px-2 py-1 text-xs font-mono border border-[#30363d] rounded hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      {showError && (
        <div className="rounded border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-400">
          {txMessage}
        </div>
      )}
      {isTxSuccess && hash && (
        <div className="rounded border border-green-900/50 bg-green-950/30 px-3 py-2 text-sm text-green-400">
          Transaction confirmed.
          <a
            href={`https://opbnb-testnet.bscscan.com/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 underline hover:text-green-300"
          >
            View on explorer
          </a>
        </div>
      )}
      <div className="space-y-3">
        <div className="border border-[#21262d] rounded p-3">
          <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Deposit Gold</h3>
          <p className="text-xs text-[#8b949e] mb-2">
            Step 1: Approve. Step 2: Deposit (moves Gold to escrow for Spawn).
          </p>
          <input
            type="text"
            placeholder="Amount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            className="w-full mb-2 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
          />
          <div className="flex gap-2">
            {needsApprove && (
              <ActionButton
                label="Approve"
                onClick={handleApprove}
                loading={loading}
              />
            )}
            <ActionButton
              label="Deposit"
              onClick={handleDeposit}
              disabled={!depositAmount || needsApprove}
              loading={loading}
            />
          </div>
        </div>

        <div className="border border-[#21262d] rounded p-3">
          <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Spawn</h3>
          <p className="text-xs text-[#8b949e] mb-2">
            1 Gold per unit. Needs Gold in escrow (Deposit first). Fee: 0.00001 tBNB
          </p>
          <select
            value={spawnLoc}
            onChange={(e) => setSpawnLoc(Number(e.target.value))}
            className="w-full mb-2 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
          >
            {LOCATIONS.map((id) => (
              <option key={id} value={id}>
                Location {id}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Amount"
            value={spawnAmount}
            onChange={(e) => setSpawnAmount(e.target.value)}
            className="w-full mb-2 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
          />
          <ActionButton
            label="Spawn"
            onClick={handleSpawn}
            disabled={!spawnAmount}
            loading={loading}
          />
        </div>

        {ownedLocationIds.length > 0 && (
          <div className="border border-[#21262d] rounded p-3">
            <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Fortify (PVP Defense)</h3>
            <p className="text-xs text-[#8b949e] mb-2">
              Deploy units to locations you own. Defenders block attackers.
            </p>
            <select
              value={ownedLocationIds.includes(fortifyLoc) ? fortifyLoc : ownedLocationIds[0] ?? 1}
              onChange={(e) => setFortifyLoc(Number(e.target.value))}
              className="w-full mb-2 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
            >
              {ownedLocationIds.map((id) => (
                <option key={id} value={id}>
                  Location {id}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Units to deploy"
              value={fortifyAmount}
              onChange={(e) => setFortifyAmount(e.target.value)}
              className="w-full mb-2 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
            />
            <ActionButton
              label="Fortify"
              onClick={handleFortify}
              disabled={!fortifyAmount || parseEther(fortifyAmount || "0") <= BigInt(0)}
              loading={loading}
            />
          </div>
        )}

        <div className="border border-[#21262d] rounded p-3">
          <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Move</h3>
          <p className="text-xs text-[#8b949e] mb-2">
            Adjacent: 1-2, 1-3, 2-3, 2-4, 3-4. Fee: 0.00001 tBNB (~$0.01)
          </p>
          <div className="flex gap-2 mb-2">
            <select
              value={moveFrom}
              onChange={(e) => setMoveFrom(Number(e.target.value))}
              className="flex-1 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
            >
              {LOCATIONS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
            <span className="text-[#8b949e]">-&gt;</span>
            <select
              value={moveTo}
              onChange={(e) => setMoveTo(Number(e.target.value))}
              className="flex-1 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
            >
              {LOCATIONS.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
          <ActionButton
            label="Move"
            onClick={handleMove}
            loading={loading}
          />
        </div>

        <div className="border border-[#21262d] rounded p-3">
          <h3 className="font-mono text-sm text-[#39c5cf] mb-2">Attack</h3>
          <p className="text-xs text-[#8b949e] mb-2">
            Min 25 units. Power = level x amount. Need power &gt; defender to win. Fee: 0.00005 tBNB
          </p>
          <select
            value={attackLoc}
            onChange={(e) => setAttackLoc(Number(e.target.value))}
            className="w-full mb-2 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
          >
            {LOCATIONS.map((id, i) => {
              const owner = locationOwners?.[i]?.result as `0x${string}` | undefined;
              const isPvp = owner && owner !== "0x0000000000000000000000000000000000000000";
              const p = getDefenderPower(i);
              return (
                <option key={id} value={id}>
                  Target {id} ({isPvp ? "PVP" : "PVE"}, {p} power)
                </option>
              );
            })}
          </select>
          <input
            type="text"
            placeholder="Units (min 25)"
            value={attackAmount}
            onChange={(e) => setAttackAmount(e.target.value)}
            className="w-full mb-2 px-2 py-1 text-sm font-mono bg-[#0d1117] border border-[#30363d] rounded"
          />
          {attackAmount && (() => {
            const amt = parseEther(attackAmount || "0");
            const power = Number(amt) > 0 ? Number(amt) / 1e18 : 0;
            const need = getDefenderPower(attackLoc - 1);
            if (power < 25) return null;
            return (
              <p className="text-xs text-[#6e7681] mb-2">
                Your power: {power}. {need > 0 ? `Need &gt;${need} to win.` : "Empty location, you win."}
              </p>
            );
          })()}
          <ActionButton
            label="Attack"
            onClick={handleAttack}
            disabled={
              !attackAmount ||
              parseEther(attackAmount || "0") < MIN_ATTACK ||
              !unitToken
            }
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
