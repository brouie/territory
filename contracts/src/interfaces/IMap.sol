// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

/// @title IMap
/// @notice Interface for map locations and movement
interface IMap {
    event LocationAdded(uint256 indexed locationId);
    event EdgeAdded(uint256 indexed fromId, uint256 indexed toId);
    event Moved(address indexed player, uint256 fromId, uint256 toId, uint256 feePaid);
    event LocationOwnerUpdated(uint256 indexed locationId, address owner);

    error LocationExists();
    error LocationNotFound();
    error NotAdjacent();
    error InsufficientFee();
    error Unauthorized();

    function hasLocation(uint256 locationId) external view returns (bool);
    function getLocationOwner(uint256 locationId) external view returns (address);
    function getLocationBasePower(uint256 locationId) external view returns (uint256);
    function setLocationOwner(uint256 locationId, address owner) external;
}
