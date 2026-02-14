// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {IMap} from "./interfaces/IMap.sol";
import {IFeeCollector} from "./interfaces/IFeeCollector.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Map
/// @notice Manages locations, adjacency, and movement with per-action fees
/// @dev Movement fee is paid in BNB and forwarded to FeeCollector
contract Map is IMap, Ownable, ReentrancyGuard {
    IFeeCollector public feeCollector;

    /// @notice Movement fee in wei (BNB)
    uint256 public moveFeeWei;

    /// @notice All location IDs
    mapping(uint256 => bool) private _locations;
    /// @notice fromId => toId => adjacent
    mapping(uint256 => mapping(uint256 => bool)) private _adjacent;
    /// @notice Player's current location
    mapping(address => uint256) private _playerLocation;
    /// @notice Location ID list for enumeration
    uint256[] private _locationIds;
    uint256 private _locationCount;
    /// @notice Location owner (0 = unowned, PVE)
    mapping(uint256 => address) private _locationOwner;
    /// @notice PVE base power per location (for unowned locations)
    mapping(uint256 => uint256) private _locationBasePower;
    /// @notice Authorized to set location owner (Combat)
    mapping(address => bool) private _combatAuthorized;

    error InvalidLocation();
    error SameLocation();
    error ZeroFee();

    constructor(address _feeCollector, uint256 _moveFeeWei) Ownable(msg.sender) {
        if (_feeCollector == address(0)) revert InvalidLocation();
        feeCollector = IFeeCollector(payable(_feeCollector));
        moveFeeWei = _moveFeeWei;
    }

    /// @notice Add a location
    function addLocation(uint256 locationId) external onlyOwner {
        if (_locations[locationId]) revert InvalidLocation();
        _locations[locationId] = true;
        _locationIds.push(locationId);
        _locationCount++;
        emit LocationAdded(locationId);
    }

    /// @notice Add an edge (bidirectional for prototype)
    function addEdge(uint256 fromId, uint256 toId) external onlyOwner {
        if (!_locations[fromId] || !_locations[toId]) revert InvalidLocation();
        _adjacent[fromId][toId] = true;
        _adjacent[toId][fromId] = true;
        emit EdgeAdded(fromId, toId);
    }

    /// @notice Move from one location to an adjacent one
    /// @param fromId Current location (must match player's location, or 0 for first move)
    /// @param toId Destination (must be adjacent)
    /// @dev Sends moveFeeWei to FeeCollector via payable transfer
    function move(uint256 fromId, uint256 toId) external payable nonReentrant {
        if (fromId == toId) revert SameLocation();
        if (!_locations[fromId] || !_locations[toId]) revert InvalidLocation();
        if (!_adjacent[fromId][toId]) revert NotAdjacent();
        if (msg.value < moveFeeWei) revert InsufficientFee();

        uint256 current = _playerLocation[msg.sender];
        if (current != 0 && current != fromId) revert InvalidLocation();

        _playerLocation[msg.sender] = toId;

        // Forward fee to FeeCollector (splits 60% protocol / 10% DAO / 30% CL8Y pool)
        (bool ok,) = address(feeCollector).call{value: moveFeeWei}("");
        require(ok, "Fee transfer failed");

        // Refund excess if any
        uint256 excess = msg.value - moveFeeWei;
        if (excess > 0) {
            (bool refundOk,) = msg.sender.call{value: excess}("");
            require(refundOk, "Refund failed");
        }

        emit Moved(msg.sender, fromId, toId, moveFeeWei);
    }

    /// @notice Set initial player location (e.g., after spawn)
    function setPlayerLocation(address player, uint256 locationId) external onlyOwner {
        if (!_locations[locationId]) revert InvalidLocation();
        _playerLocation[player] = locationId;
    }

    /// @notice Get player's current location (0 = not set)
    function getPlayerLocation(address player) external view returns (uint256) {
        return _playerLocation[player];
    }

    /// @notice Check if two locations are adjacent
    function isAdjacent(uint256 fromId, uint256 toId) external view returns (bool) {
        return _adjacent[fromId][toId];
    }

    /// @notice Check if location exists
    function hasLocation(uint256 locationId) external view returns (bool) {
        return _locations[locationId];
    }

    /// @notice Get location count
    function getLocationCount() external view returns (uint256) {
        return _locationCount;
    }

    /// @notice Get location ID by index
    function getLocationAt(uint256 index) external view returns (uint256) {
        require(index < _locationIds.length, "Index out of bounds");
        return _locationIds[index];
    }

    /// @notice Update movement fee
    function setMoveFeeWei(uint256 _moveFeeWei) external onlyOwner {
        moveFeeWei = _moveFeeWei;
    }

    /// @notice Update FeeCollector address
    function setFeeCollector(address _feeCollector) external onlyOwner {
        if (_feeCollector == address(0)) revert InvalidLocation();
        feeCollector = IFeeCollector(payable(_feeCollector));
    }

    /// @notice Authorize Combat contract to set location owners
    function setCombatContract(address combat) external onlyOwner {
        if (combat != address(0)) _combatAuthorized[combat] = true;
    }

    /// @notice Revoke Combat authorization
    function revokeCombatContract(address combat) external onlyOwner {
        _combatAuthorized[combat] = false;
    }

    /// @notice Set location owner (Combat only, when attacker wins)
    function setLocationOwner(uint256 locationId, address owner) external {
        if (!_combatAuthorized[msg.sender]) revert Unauthorized();
        if (!_locations[locationId]) revert InvalidLocation();
        _locationOwner[locationId] = owner;
        emit LocationOwnerUpdated(locationId, owner);
    }

    /// @inheritdoc IMap
    function getLocationOwner(uint256 locationId) external view returns (address) {
        return _locationOwner[locationId];
    }

    /// @notice Set PVE base power for unowned location
    function setLocationBasePower(uint256 locationId, uint256 power) external onlyOwner {
        if (!_locations[locationId]) revert InvalidLocation();
        _locationBasePower[locationId] = power;
    }

    /// @inheritdoc IMap
    function getLocationBasePower(uint256 locationId) external view returns (uint256) {
        return _locationBasePower[locationId];
    }
}
