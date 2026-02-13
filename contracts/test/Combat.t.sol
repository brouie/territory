// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {Combat} from "../src/Combat.sol";
import {FeeCollector} from "../src/FeeCollector.sol";
import {GameMaster} from "../src/GameMaster.sol";
import {Map} from "../src/Map.sol";
import {Garrison} from "../src/Garrison.sol";
import {UnitFactory} from "../src/UnitFactory.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ICombat} from "../src/interfaces/ICombat.sol";

contract CombatTest is Test {
    Combat combat;
    FeeCollector feeCollector;
    GameMaster gameMaster;
    Map map;
    Garrison garrison;
    UnitFactory unitFactory;

    IERC20 unitToken;
    address constant TREASURY = address(0x1111);
    address constant ROUTER = address(0x2222);
    address constant CL8Y = address(0x3333);
    address constant WBNB = address(0x4444);

    address alice = address(0xa11);
    address bob = address(0xb0b);

    function setUp() public {
        feeCollector = new FeeCollector(TREASURY, ROUTER, CL8Y, WBNB);
        gameMaster = new GameMaster();
        map = new Map(address(feeCollector), 0.001 ether);
        garrison = new Garrison(address(gameMaster), address(map));
        combat = new Combat(address(feeCollector), address(gameMaster), address(map), address(garrison), 0.001 ether);

        gameMaster.setGameContract(address(garrison));
        gameMaster.setGameContract(address(combat));
        garrison.setGameContract(address(combat));
        map.setCombatContract(address(combat));

        unitFactory = new UnitFactory();
        unitFactory.createToken(1);
        unitToken = IERC20(unitFactory.getToken(1));

        map.addLocation(1);
        map.addLocation(2);
        map.addEdge(1, 2);
        map.setLocationBasePower(1, 50);

        unitFactory.mintFor(1, alice, 1000 ether);
        vm.startPrank(alice);
        unitToken.approve(address(gameMaster), 1000 ether);
        gameMaster.deposit(unitToken, 1000 ether);
        vm.stopPrank();

        vm.deal(alice, 10 ether);
    }

    function test_PVE_AttackerWins() public {
        vm.prank(alice);
        combat.attack{value: 0.001 ether}(1, unitToken, 100 ether);

        assertEq(map.getLocationOwner(1), alice);
    }

    function test_PVE_DefenderWins() public {
        map.setLocationBasePower(2, 100 ether);
        vm.prank(alice);
        combat.attack{value: 0.001 ether}(2, unitToken, 50 ether);

        assertEq(map.getLocationOwner(2), address(0));
        assertEq(gameMaster.getBalance(alice, unitToken), 950 ether);
    }

    function test_RevertInsufficientFee() public {
        vm.prank(alice);
        vm.expectRevert(ICombat.InsufficientFee.selector);
        combat.attack{value: 0.0001 ether}(1, unitToken, 100 ether);
    }

    function test_RevertBelowMinUnits() public {
        vm.prank(alice);
        vm.expectRevert(ICombat.BelowMinUnits.selector);
        combat.attack{value: 0.001 ether}(1, unitToken, 10 ether);
    }
}
