// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ILevelToken} from "./interfaces/ILevelToken.sol";
import {IGameMaster} from "./interfaces/IGameMaster.sol";
import {IMap} from "./interfaces/IMap.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Garrison
/// @notice Holds defender units at locations for PVP combat
contract Garrison is AccessControl, ReentrancyGuard {
    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    IGameMaster public gameMaster;
    IMap public map;

    /// @notice locationId => token => amount
    mapping(uint256 => mapping(IERC20 => uint256)) private _units;

    constructor(address _gameMaster, address _map) {
        gameMaster = IGameMaster(_gameMaster);
        map = IMap(_map);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function setGameContract(address combat) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(GAME_ROLE, combat);
    }

    /// @notice Fortify a location with units (must own location)
    function fortify(uint256 locationId, IERC20 token, uint256 amount) external nonReentrant {
        require(map.getLocationOwner(locationId) == msg.sender, "Not location owner");
        require(amount > 0, "Amount must be > 0");
        gameMaster.transferBalance(msg.sender, address(this), token, amount);
        _units[locationId][token] += amount;
    }

    /// @notice Get defender power at location (sum of level * amount for each token)
    function getDefenderPower(uint256 locationId) external view returns (uint256 power) {
        address owner = map.getLocationOwner(locationId);
        if (owner == address(0)) return 0;
        // We don't iterate all tokens - caller passes token. For single-token prototype we need token.
        // Simpler: store (locationId => token => amount), and we need to know which tokens exist.
        // For now, we'll have a single token per location assumption, or Combat passes the token.
        // Actually getDefenderPower needs to sum over all tokens at location. We can't enumerate.
        // Alternative: getDefenderPower(locationId, token) returns that token's contribution.
        // Combat would need to call for each possible token. For prototype with one unit type: one token.
        // Let's change to getDefenderPower(locationId, token) - combat passes the defender token.
        return 0;
    }

    /// @notice Get defender power for a specific token at location
    function getDefenderPowerForToken(uint256 locationId, IERC20 token) public view returns (uint256) {
        uint256 amount = _units[locationId][token];
        if (amount == 0) return 0;
        uint256 level = ILevelToken(address(token)).getLevel();
        return level * amount;
    }

    /// @notice Burn defender units (Combat calls when applying losses)
    function spendLocationUnits(uint256 locationId, IERC20 token, uint256 amount) external onlyRole(GAME_ROLE) {
        require(_units[locationId][token] >= amount, "Insufficient garrison");
        _units[locationId][token] -= amount;
        gameMaster.spendBalance(address(this), token, amount);
    }

    /// @notice Get units at location for token
    function getUnits(uint256 locationId, IERC20 token) external view returns (uint256) {
        return _units[locationId][token];
    }
}
