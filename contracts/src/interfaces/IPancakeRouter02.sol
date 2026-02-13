// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

/// @notice Minimal interface for PancakeSwap V2 Router (opBNB/BSC)
interface IPancakeRouter02 {
    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external payable;
}
