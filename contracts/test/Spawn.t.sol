// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {Spawn} from "../src/Spawn.sol";
import {FeeCollector} from "../src/FeeCollector.sol";
import {GameMaster} from "../src/GameMaster.sol";
import {Map} from "../src/Map.sol";
import {UnitFactory} from "../src/UnitFactory.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockGold is ERC20 {
    constructor() ERC20("Gold", "GOLD") {
        _mint(msg.sender, 1000000 ether);
    }
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract SpawnTest is Test {
    Spawn spawn;
    FeeCollector feeCollector;
    GameMaster gameMaster;
    Map map;
    UnitFactory unitFactory;
    MockGold gold;

    address alice = address(0xa11);
    address constant TREASURY = address(0x1111);
    address constant ROUTER = address(0x2222);
    address constant CL8Y = address(0x3333);
    address constant WBNB = address(0x4444);

    function setUp() public {
        feeCollector = new FeeCollector(TREASURY, ROUTER, CL8Y, WBNB);
        gameMaster = new GameMaster();
        map = new Map(address(feeCollector), 0.001 ether);
        unitFactory = new UnitFactory();
        gold = new MockGold();

        unitFactory.createToken(1);
        unitFactory.setTokenMinter(1, address(this));

        spawn = new Spawn(address(gameMaster), address(feeCollector), address(unitFactory), address(map), address(gold), 0.001 ether);
        gameMaster.setGameContract(address(spawn));

        unitFactory.setTokenMinter(1, address(spawn));

        map.addLocation(1);
        map.addLocation(2);

        gold.mint(alice, 1000 ether);
        vm.startPrank(alice);
        gold.approve(address(gameMaster), 1000 ether);
        gameMaster.deposit(gold, 500 ether);
        vm.stopPrank();

        vm.deal(alice, 10 ether);
    }

    function test_SpawnConsumesGoldAndMintsUnits() public {
        vm.prank(alice);
        spawn.spawn{value: 0.001 ether}(1, 1, 100 ether);

        assertEq(gameMaster.getBalance(alice, IERC20(unitFactory.getToken(1))), 100 ether);
        assertEq(gameMaster.getBalance(alice, gold), 400 ether);
    }
}
