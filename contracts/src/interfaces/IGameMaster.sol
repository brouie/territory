// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title IGameMaster
/// @notice Interface for the game escrow and balance management
interface IGameMaster {
    event Deposited(address indexed user, address indexed token, uint256 amount);
    event Withdrawn(address indexed user, address indexed token, uint256 amount);

    error InsufficientBalance();

    function getBalance(address user, IERC20 token) external view returns (uint256);
    function transferBalance(address from, address to, IERC20 token, uint256 amount) external;
    function spendBalance(address user, IERC20 token, uint256 amount) external;
    function addBalance(address user, IERC20 token, uint256 amount) external;
}
