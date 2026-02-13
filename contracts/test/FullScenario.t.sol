// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {FeeCollector} from "../src/FeeCollector.sol";
import {GameMaster} from "../src/GameMaster.sol";
import {Map} from "../src/Map.sol";
import {Garrison} from "../src/Garrison.sol";
import {Combat} from "../src/Combat.sol";
import {UnitFactory} from "../src/UnitFactory.sol";
import {Spawn} from "../src/Spawn.sol";
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

contract FullScenarioTest is Test {
    FeeCollector feeCollector;
    GameMaster gameMaster;
    Map map;
    Garrison garrison;
    Combat combat;
    UnitFactory unitFactory;
    Spawn spawn;
    MockGold gold;

    address alice = address(0xa11);
    address bob = address(0xb0b);
    address constant TREASURY = address(0x1111);
    address constant ROUTER = address(0x2222);
    address constant CL8Y = address(0x3333);
    address constant WBNB = address(0x4444);

    IERC20 unitToken;

    function setUp() public {
        feeCollector = new FeeCollector(TREASURY, ROUTER, CL8Y, WBNB);
        gameMaster = new GameMaster();
        map = new Map(address(feeCollector), 0.001 ether);
        garrison = new Garrison(address(gameMaster), address(map));
        combat = new Combat(address(feeCollector), address(gameMaster), address(map), address(garrison));

        gameMaster.setGameContract(address(garrison));
        gameMaster.setGameContract(address(combat));
        garrison.setGameContract(address(combat));
        map.setCombatContract(address(combat));

        gold = new MockGold();
        unitFactory = new UnitFactory();
        unitFactory.createToken(1);
        unitToken = IERC20(unitFactory.getToken(1));

        spawn = new Spawn(address(gameMaster), address(feeCollector), address(unitFactory), address(map), address(gold));
        gameMaster.setGameContract(address(spawn));
        unitFactory.setTokenMinter(1, address(spawn));

        map.addLocation(1);
        map.addLocation(2);
        map.addLocation(3);
        map.addEdge(1, 2);
        map.addEdge(2, 3);
        map.setLocationBasePower(1, 50 ether);

        gold.mint(alice, 1000 ether);
        vm.deal(alice, 10 ether);
    }

    function test_FullFlow_SpawnMoveAttack() public {
        vm.startPrank(alice);

        gold.approve(address(gameMaster), 1000 ether);
        gameMaster.deposit(gold, 500 ether);

        spawn.spawn{value: 0.001 ether}(1, 1, 100 ether);
        assertEq(gameMaster.getBalance(alice, unitToken), 100 ether);

        vm.stopPrank();
        map.setPlayerLocation(alice, 1);
        vm.startPrank(alice);

        map.move{value: 0.001 ether}(1, 2);
        assertEq(map.getPlayerLocation(alice), 2);

        combat.attack{value: 0.001 ether}(1, unitToken, 100 ether);
        assertEq(map.getLocationOwner(1), alice);

        vm.stopPrank();

        assertGt(TREASURY.balance, 0);
        assertGt(feeCollector.cl8yPoolWei(), 0);
    }
}
