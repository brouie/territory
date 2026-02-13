// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {ICombat} from "./interfaces/ICombat.sol";
import {IFeeCollector} from "./interfaces/IFeeCollector.sol";
import {IGameMaster} from "./interfaces/IGameMaster.sol";
import {IMap} from "./interfaces/IMap.sol";
import {ILevelToken} from "./interfaces/ILevelToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Garrison} from "./Garrison.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Combat
/// @notice Deterministic PVE/PVP combat. Power = level * amount. Defender wins ties.
contract Combat is ICombat, Ownable, ReentrancyGuard {
    IFeeCollector public feeCollector;
    IGameMaster public gameMaster;
    IMap public map;
    Garrison public garrison;

    uint256 public attackFeeWei;
    uint256 public constant MIN_UNITS = 25 ether;

    constructor(address _feeCollector, address _gameMaster, address _map, address _garrison) Ownable(msg.sender) {
        feeCollector = IFeeCollector(payable(_feeCollector));
        gameMaster = IGameMaster(_gameMaster);
        map = IMap(_map);
        garrison = Garrison(payable(_garrison));
        attackFeeWei = 0.001 ether;
    }

    /// @notice Attack a location. PVE if unowned, PVP if owned.
    /// @param locationId Target location
    /// @param unitToken Attacker's unit token (must be ILevelToken)
    /// @param amount Attacker's unit amount
    function attack(uint256 locationId, IERC20 unitToken, uint256 amount)
        external
        payable
        nonReentrant
    {
        if (!map.hasLocation(locationId)) revert InvalidLocation();
        if (msg.value < attackFeeWei) revert InsufficientFee();
        if (amount < MIN_UNITS) revert BelowMinUnits();

        uint256 attackerBalance = gameMaster.getBalance(msg.sender, unitToken);
        if (attackerBalance < amount) revert InsufficientUnits();

        uint256 level = ILevelToken(address(unitToken)).getLevel();
        uint256 attackerPower = level * amount;

        address defender = map.getLocationOwner(locationId);
        uint256 defenderPower;

        if (defender == address(0)) {
            defenderPower = map.getLocationBasePower(locationId);
        } else {
            defenderPower = garrison.getDefenderPowerForToken(locationId, unitToken);
        }

        uint256 attackerLosses;
        uint256 defenderLosses;

        uint256 defenderAmount = defender == address(0) ? 0 : garrison.getUnits(locationId, unitToken);

        if (attackerPower > defenderPower) {
            attackerLosses = defenderPower > 0 ? (defenderPower * amount) / attackerPower : 0;
            defenderLosses = defenderAmount;

            if (attackerLosses > 0) {
                gameMaster.spendBalance(msg.sender, unitToken, attackerLosses);
            }
            if (defenderLosses > 0) {
                garrison.spendLocationUnits(locationId, unitToken, defenderLosses);
            }

            map.setLocationOwner(locationId, msg.sender);
        } else {
            attackerLosses = amount;
            defenderLosses = defenderPower > 0 ? (attackerPower * defenderAmount) / defenderPower : 0;

            gameMaster.spendBalance(msg.sender, unitToken, attackerLosses);
            if (defenderLosses > 0) {
                garrison.spendLocationUnits(locationId, unitToken, defenderLosses);
            }
        }

        (bool ok,) = address(feeCollector).call{value: attackFeeWei}("");
        require(ok, "Fee transfer failed");

        uint256 excess = msg.value - attackFeeWei;
        if (excess > 0) {
            (bool refundOk,) = msg.sender.call{value: excess}("");
            require(refundOk, "Refund failed");
        }

        emit Attacked(msg.sender, locationId, attackerPower > defenderPower, attackerLosses, defenderLosses);
    }

    function setAttackFeeWei(uint256 _fee) external onlyOwner {
        attackFeeWei = _fee;
    }

    function setFeeCollector(address _fc) external onlyOwner {
        feeCollector = IFeeCollector(payable(_fc));
    }
}
