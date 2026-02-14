// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {IFeeCollector} from "./interfaces/IFeeCollector.sol";
import {IPancakeRouter02} from "./interfaces/IPancakeRouter02.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title FeeCollector
/// @notice Collects per-action fees, splits 60% to treasury, 10% to DAO, 30% for CL8Y buy-and-burn
/// @dev Integrates with PancakeSwap V2 router on opBNB for CL8Y swaps
contract FeeCollector is IFeeCollector, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    /// @notice Basis points for protocol treasury share (6000 = 60%)
    uint256 public constant TREASURY_BPS = 6000;
    /// @notice Basis points for DAO treasury share (1000 = 10%)
    uint256 public constant DAO_BPS = 1000;
    /// @notice Basis points for CL8Y share (3000 = 30%)
    uint256 public constant CL8Y_BPS = 3000;
    /// @notice Denominator for basis points
    uint256 public constant BPS_DENOMINATOR = 10000;

    /// @notice Dead address for burning CL8Y (no burn function)
    address private constant DEAD = 0x000000000000000000000000000000000000dEaD;

    /// @notice Protocol treasury address receiving 60% of fees (game ops, rewards)
    address public treasury;
    /// @notice DAO treasury address receiving 10% of fees (infrastructure, community)
    address public daoTreasury;
    /// @notice PancakeSwap V2 router for BNB -> CL8Y swap
    address public router;
    /// @notice CL8Y token address on opBNB/BSC
    address public cl8yToken;
    /// @notice WBNB address for swap path (BNB -> WBNB -> CL8Y)
    address public wbnb;
    /// @notice Minimum BNB to trigger buy-burn (avoid dust swaps)
    uint256 public minCl8ySwapWei;

    /// @notice Accumulated BNB earmarked for CL8Y buy-burn (30% of received fees)
    uint256 public cl8yPoolWei;

    /// @notice Swap BNB for CL8Y via PancakeSwap V2 and send to dead address (burn)
    function _swapBnbForCl8yAndBurn(uint256 amountIn) internal {
        address[] memory path = new address[](2);
        path[0] = wbnb;
        path[1] = cl8yToken;
        IPancakeRouter02(router).swapExactETHForTokensSupportingFeeOnTransferTokens{value: amountIn}(
            0, // amountOutMin - accept any for prototype
            path,
            DEAD,
            block.timestamp
        );
    }

    constructor(address _treasury, address _dao, address _router, address _cl8yToken, address _wbnb) Ownable(msg.sender) {
        if (_treasury == address(0) || _dao == address(0) || _router == address(0) || _cl8yToken == address(0) || _wbnb == address(0)) {
            revert ZeroAddress();
        }
        treasury = _treasury;
        daoTreasury = _dao;
        router = _router;
        cl8yToken = _cl8yToken;
        wbnb = _wbnb;
        minCl8ySwapWei = 0.001 ether; // configurable minimum
    }

    /// @inheritdoc IFeeCollector
    receive() external payable {
        if (msg.value == 0) return;

        uint256 treasuryAmount = (msg.value * TREASURY_BPS) / BPS_DENOMINATOR;
        uint256 daoAmount = (msg.value * DAO_BPS) / BPS_DENOMINATOR;
        uint256 cl8yAmount = msg.value - treasuryAmount - daoAmount;

        if (treasuryAmount > 0) {
            (bool ok,) = treasury.call{value: treasuryAmount}("");
            if (!ok) revert TransferFailed();
        }

        if (daoAmount > 0) {
            (bool ok,) = daoTreasury.call{value: daoAmount}("");
            if (!ok) revert TransferFailed();
        }

        if (cl8yAmount > 0) {
            cl8yPoolWei += cl8yAmount;
        }

        emit FeesCollected(msg.value, treasuryAmount, daoAmount, cl8yAmount);
    }

    /// @inheritdoc IFeeCollector
    function executeCl8yBuyBurn() external nonReentrant returns (uint256 cl8yBurned) {
        uint256 amount = cl8yPoolWei;
        if (amount < minCl8ySwapWei) revert InsufficientBalance();

        cl8yPoolWei = 0;

        uint256 balanceBefore = IERC20(cl8yToken).balanceOf(DEAD);
        _swapBnbForCl8yAndBurn(amount);
        uint256 balanceAfter = IERC20(cl8yToken).balanceOf(DEAD);
        cl8yBurned = balanceAfter - balanceBefore;

        emit Cl8yBuyBurnExecuted(amount, cl8yBurned);
        return cl8yBurned;
    }

    /// @notice Update treasury address
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }

    /// @notice Update DAO treasury address
    function setDaoTreasury(address _dao) external onlyOwner {
        if (_dao == address(0)) revert ZeroAddress();
        address old = daoTreasury;
        daoTreasury = _dao;
        emit DaoTreasuryUpdated(old, _dao);
    }

    /// @notice Update router address
    function setRouter(address _router) external onlyOwner {
        if (_router == address(0)) revert ZeroAddress();
        address old = router;
        router = _router;
        emit RouterUpdated(old, _router);
    }

    /// @notice Update CL8Y token address
    function setCl8yToken(address _cl8yToken) external onlyOwner {
        if (_cl8yToken == address(0)) revert ZeroAddress();
        address old = cl8yToken;
        cl8yToken = _cl8yToken;
        emit Cl8yTokenUpdated(old, _cl8yToken);
    }

    /// @notice Update WBNB address
    function setWbnb(address _wbnb) external onlyOwner {
        if (_wbnb == address(0)) revert ZeroAddress();
        address old = wbnb;
        wbnb = _wbnb;
        emit WbnbUpdated(old, _wbnb);
    }

    /// @notice Set minimum BNB required to execute CL8Y buy-burn
    function setMinCl8ySwapWei(uint256 _min) external onlyOwner {
        minCl8ySwapWei = _min;
    }
}
