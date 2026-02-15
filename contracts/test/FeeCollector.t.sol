// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {FeeCollector} from "../src/FeeCollector.sol";

contract FeeCollectorTest is Test {
    FeeCollector public feeCollector;

    address constant TREASURY = address(0x1111);
    address constant DAO = address(0x5555);
    address constant REWARD_POOL = address(0x6666);
    address constant ROUTER = address(0x2222);
    address constant CL8Y = address(0x3333);
    address constant WBNB = address(0x4444);

    function setUp() public {
        feeCollector = new FeeCollector(TREASURY, DAO, REWARD_POOL, ROUTER, CL8Y, WBNB);
    }

    function test_Split40_10_20_30() public {
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);

        (bool ok,) = address(feeCollector).call{value: amount}("");
        assertTrue(ok);

        // 40% treasury, 10% DAO, 20% CL8Y, 30% rewards
        assertEq(TREASURY.balance, 0.4 ether);
        assertEq(DAO.balance, 0.1 ether);
        assertEq(feeCollector.cl8yPoolWei(), 0.2 ether);
        assertEq(feeCollector.rewardPoolWei(), 0.3 ether);
    }

    function test_ZeroValueNoRevert() public {
        (bool ok,) = address(feeCollector).call{value: 0}("");
        assertTrue(ok);
        assertEq(feeCollector.cl8yPoolWei(), 0);
        assertEq(feeCollector.rewardPoolWei(), 0);
    }

    function test_BpsConstants() public view {
        assertEq(feeCollector.TREASURY_BPS(), 4000);
        assertEq(feeCollector.DAO_BPS(), 1000);
        assertEq(feeCollector.CL8Y_BPS(), 2000);
        assertEq(feeCollector.REWARD_BPS(), 3000);
        assertEq(feeCollector.BPS_DENOMINATOR(), 10000);
    }

    function test_DistributeReward() public {
        // First, send fees to accumulate reward pool
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);
        (bool ok,) = address(feeCollector).call{value: amount}("");
        assertTrue(ok);

        // Reward pool should have 0.3 ether
        assertEq(feeCollector.rewardPoolWei(), 0.3 ether);

        // Distribute reward to a player
        address player = address(0x7777);
        feeCollector.distributeReward(player, 0.1 ether);

        assertEq(player.balance, 0.1 ether);
        assertEq(feeCollector.rewardPoolWei(), 0.2 ether);
    }
}
