// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {IGameMaster} from "./interfaces/IGameMaster.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title GameMaster
/// @notice Escrow for player tokens; no withdrawal penalty (fees are per-action)
/// @dev Authorized game contracts (Map, Combat, Spawn) can modify balances
contract GameMaster is IGameMaster, AccessControl, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant GAME_ROLE = keccak256("GAME_ROLE");

    mapping(address user => mapping(IERC20 token => uint256 balance)) private _balances;
    mapping(IERC20 token => uint256 total) private _totals;

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_ROLE, msg.sender);
    }

    /// @notice Grant game role to a contract (Map, Combat, etc.)
    function setGameContract(address gameContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(GAME_ROLE, gameContract);
    }

    /// @notice Deposit tokens into escrow
    function deposit(IERC20 token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        token.safeTransferFrom(msg.sender, address(this), amount);
        _balances[msg.sender][token] += amount;
        _totals[token] += amount;
        emit Deposited(msg.sender, address(token), amount);
    }

    /// @notice Withdraw tokens from escrow (no burn penalty)
    function withdraw(IERC20 token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(_balances[msg.sender][token] >= amount, "Insufficient balance");
        _balances[msg.sender][token] -= amount;
        _totals[token] -= amount;
        token.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, address(token), amount);
    }

    /// @inheritdoc IGameMaster
    function getBalance(address user, IERC20 token) external view returns (uint256) {
        return _balances[user][token];
    }

    /// @notice Spend user balance (game mechanics only)
    function spendBalance(address user, IERC20 token, uint256 amount) external onlyRole(GAME_ROLE) nonReentrant {
        require(_balances[user][token] >= amount, "Insufficient balance");
        _balances[user][token] -= amount;
        _totals[token] -= amount;
        token.safeTransfer(address(0xdead), amount); // burn by sending to dead, or use burn() if token supports
    }

    /// @notice Add to user balance (rewards, etc.)
    function addBalance(address user, IERC20 token, uint256 amount) external onlyRole(GAME_ROLE) nonReentrant {
        require(amount > 0, "Amount must be > 0");
        _balances[user][token] += amount;
        _totals[token] += amount;
    }

    /// @notice Transfer balance between users (combat, etc.)
    function transferBalance(address from, address to, IERC20 token, uint256 amount)
        external
        onlyRole(GAME_ROLE)
        nonReentrant
    {
        require(_balances[from][token] >= amount, "Insufficient balance");
        _balances[from][token] -= amount;
        _balances[to][token] += amount;
    }
}
