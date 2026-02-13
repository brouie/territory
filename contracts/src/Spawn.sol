// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IGameMaster} from "./interfaces/IGameMaster.sol";
import {IFeeCollector} from "./interfaces/IFeeCollector.sol";
import {UnitFactory} from "./UnitFactory.sol";
import {LevelToken} from "./LevelToken.sol";
import {IMap} from "./interfaces/IMap.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title Spawn
/// @notice Spawn units at locations by consuming resources. Level 1 = gold only.
contract Spawn is Ownable, ReentrancyGuard {
    IGameMaster public gameMaster;
    IFeeCollector public feeCollector;
    UnitFactory public unitFactory;
    IMap public map;

    IERC20 public gold;
    uint256 public spawnFeeWei;
    uint256 public constant COST_PER_UNIT_L1 = 1 ether;

    mapping(uint256 => uint256) public costPerUnit;

    error InsufficientGold();
    error InsufficientFee();
    error InvalidLocation();
    error InvalidLevel();

    event Spawned(address indexed player, uint256 locationId, uint256 level, uint256 amount);

    constructor(
        address _gameMaster,
        address _feeCollector,
        address _unitFactory,
        address _map,
        address _gold,
        uint256 _spawnFeeWei
    ) Ownable(msg.sender) {
        gameMaster = IGameMaster(_gameMaster);
        feeCollector = IFeeCollector(payable(_feeCollector));
        unitFactory = UnitFactory(_unitFactory);
        map = IMap(_map);
        gold = IERC20(_gold);
        spawnFeeWei = _spawnFeeWei;
        costPerUnit[1] = 1 ether;
    }

    function spawn(uint256 locationId, uint256 level, uint256 amount) external payable nonReentrant {
        if (!map.hasLocation(locationId)) revert InvalidLocation();
        if (msg.value < spawnFeeWei) revert InsufficientFee();
        if (amount == 0) revert InvalidLevel();

        address tokenAddr = unitFactory.getToken(level);
        if (tokenAddr == address(0)) revert InvalidLevel();

        uint256 costPer = costPerUnit[level] == 0 ? COST_PER_UNIT_L1 : costPerUnit[level];
        uint256 cost = (amount * costPer) / 1 ether;
        if (gameMaster.getBalance(msg.sender, gold) < cost) revert InsufficientGold();

        gameMaster.spendBalance(msg.sender, gold, cost);
        LevelToken(tokenAddr).mint(address(gameMaster), amount);
        gameMaster.addBalance(msg.sender, IERC20(tokenAddr), amount);

        (bool ok,) = address(feeCollector).call{value: spawnFeeWei}("");
        require(ok, "Fee transfer failed");

        uint256 excess = msg.value - spawnFeeWei;
        if (excess > 0) {
            (bool refundOk,) = msg.sender.call{value: excess}("");
            require(refundOk, "Refund failed");
        }

        emit Spawned(msg.sender, locationId, level, amount);
    }

    function setCostPerUnit(uint256 level, uint256 cost) external onlyOwner {
        costPerUnit[level] = cost;
    }

    function setSpawnFeeWei(uint256 _fee) external onlyOwner {
        spawnFeeWei = _fee;
    }

    function setGold(address _gold) external onlyOwner {
        gold = IERC20(_gold);
    }
}
