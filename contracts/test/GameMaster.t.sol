// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import "forge-std/Test.sol";
import {GameMaster} from "../src/GameMaster.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor() ERC20("Mock", "MOCK") {
        _mint(msg.sender, 1000000 ether);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract GameMasterTest is Test {
    GameMaster public gm;
    MockERC20 public token;

    address alice = address(0xa);
    address bob = address(0xb);

    function setUp() public {
        gm = new GameMaster();
        token = new MockERC20();
    }

    function test_DepositAndWithdraw() public {
        token.mint(alice, 100 ether);
        vm.startPrank(alice);
        token.approve(address(gm), 50 ether);
        gm.deposit(token, 50 ether);
        assertEq(gm.getBalance(alice, token), 50 ether);
        gm.withdraw(token, 30 ether);
        assertEq(gm.getBalance(alice, token), 20 ether);
        assertEq(token.balanceOf(alice), 100 ether - 50 ether + 30 ether); // 80 ether
        vm.stopPrank();
    }

    function test_SpendBalanceAsGameContract() public {
        gm.setGameContract(address(this));
        token.mint(alice, 100 ether);
        vm.prank(alice);
        token.approve(address(gm), 100 ether);
        vm.prank(alice);
        gm.deposit(token, 50 ether);

        gm.spendBalance(alice, token, 10 ether);
        assertEq(gm.getBalance(alice, token), 40 ether);
    }

    function test_TransferBalance() public {
        gm.setGameContract(address(this));
        token.mint(alice, 100 ether);
        vm.prank(alice);
        token.approve(address(gm), 100 ether);
        vm.prank(alice);
        gm.deposit(token, 50 ether);

        gm.transferBalance(alice, bob, token, 20 ether);
        assertEq(gm.getBalance(alice, token), 30 ether);
        assertEq(gm.getBalance(bob, token), 20 ether);
    }
}
