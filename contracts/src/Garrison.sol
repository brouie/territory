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

    /// @notice Get defender power at location for a specific token
    /// @dev This is an alias for getDefenderPowerForToken for backwards compatibility
    /// @param locationId The location to check
    /// @param token The unit token to check power for
    function getDefenderPower(uint256 locationId, IERC20 token) external view returns (uint256) {
        return getDefenderPowerForToken(locationId, token);
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
