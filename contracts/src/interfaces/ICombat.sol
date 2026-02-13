// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

/// @title ICombat
/// @notice Interface for deterministic PVE/PVP combat
interface ICombat {
    event Attacked(
        address indexed attacker,
        uint256 indexed locationId,
        bool attackerWon,
        uint256 attackerLosses,
        uint256 defenderLosses
    );

    error InsufficientUnits();
    error InsufficientFee();
    error BelowMinUnits();
    error InvalidLocation();
}
