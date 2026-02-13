// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {FeeCollector} from "../src/FeeCollector.sol";

contract FeeCollectorTest is Test {
    FeeCollector public feeCollector;

    address constant TREASURY = address(0x1111);
    address constant ROUTER = address(0x2222);
    address constant CL8Y = address(0x3333);
    address constant WBNB = address(0x4444);

    function setUp() public {
        feeCollector = new FeeCollector(TREASURY, ROUTER, CL8Y, WBNB);
    }

    function test_Split70_30() public {
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);

        (bool ok,) = address(feeCollector).call{value: amount}("");
        assertTrue(ok);

        assertEq(feeCollector.cl8yPoolWei(), 0.3 ether);
        assertEq(TREASURY.balance, 0.7 ether);
    }

    function test_ZeroValueNoRevert() public {
        (bool ok,) = address(feeCollector).call{value: 0}("");
        assertTrue(ok);
        assertEq(feeCollector.cl8yPoolWei(), 0);
    }

    function test_BpsConstants() public view {
        assertEq(feeCollector.TREASURY_BPS(), 7000);
        assertEq(feeCollector.CL8Y_BPS(), 3000);
        assertEq(feeCollector.BPS_DENOMINATOR(), 10000);
    }
}
