// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {Map} from "../src/Map.sol";
import {FeeCollector} from "../src/FeeCollector.sol";
import {IMap} from "../src/interfaces/IMap.sol";

contract MapTest is Test {
    Map public map;
    FeeCollector public feeCollector;

    address constant TREASURY = address(0x1111);
    address constant DAO = address(0x5555);
    address constant ROUTER = address(0x2222);
    address constant CL8Y = address(0x3333);
    address constant WBNB = address(0x4444);

    address player = address(0x1234);
    uint256 constant MOVE_FEE = 0.001 ether;

    function setUp() public {
        feeCollector = new FeeCollector(TREASURY, DAO, ROUTER, CL8Y, WBNB);
        map = new Map(address(feeCollector), MOVE_FEE);

        // Setup: 3 locations in a line: 1 -- 2 -- 3
        map.addLocation(1);
        map.addLocation(2);
        map.addLocation(3);
        map.addEdge(1, 2);
        map.addEdge(2, 3);
    }

    function test_AddLocationAndEdge() public view {
        assertTrue(map.hasLocation(1));
        assertTrue(map.hasLocation(2));
        assertTrue(map.hasLocation(3));
        assertTrue(map.isAdjacent(1, 2));
        assertTrue(map.isAdjacent(2, 1));
        assertTrue(map.isAdjacent(2, 3));
        assertEq(map.getLocationCount(), 3);
    }

    function test_MovePaysFee() public {
        map.setPlayerLocation(player, 1);
        vm.deal(player, 1 ether);

        vm.prank(player);
        map.move{value: MOVE_FEE}(1, 2);

        assertEq(map.getPlayerLocation(player), 2);
        assertEq(feeCollector.cl8yPoolWei(), (MOVE_FEE * 3000) / 10000);
        assertEq(TREASURY.balance, (MOVE_FEE * 6000) / 10000);
        assertEq(DAO.balance, (MOVE_FEE * 1000) / 10000);
    }

    function test_RevertWhenNotAdjacent() public {
        map.setPlayerLocation(player, 1);
        vm.deal(player, 1 ether);

        vm.prank(player);
        vm.expectRevert(IMap.NotAdjacent.selector);
        map.move{value: MOVE_FEE}(1, 3);
    }

    function test_RevertWhenInsufficientFee() public {
        map.setPlayerLocation(player, 1);
        vm.deal(player, 1 ether);

        vm.prank(player);
        vm.expectRevert(IMap.InsufficientFee.selector);
        map.move{value: MOVE_FEE - 1}(1, 2);
    }

    function test_RefundExcessFee() public {
        map.setPlayerLocation(player, 1);
        vm.deal(player, 1 ether);

        uint256 excess = 0.5 ether;
        uint256 balanceBefore = player.balance;
        vm.prank(player);
        map.move{value: MOVE_FEE + excess}(1, 2);

        assertEq(player.balance, balanceBefore - MOVE_FEE);
    }
}
