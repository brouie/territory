// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

/// @title IFeeCollector
/// @notice Interface for the fee collection and CL8Y buy-burn system
interface IFeeCollector {
    event FeesCollected(uint256 total, uint256 treasuryAmount, uint256 daoAmount, uint256 cl8yAmount);
    event Cl8yBuyBurnExecuted(uint256 bnbSpent, uint256 cl8yBurned);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event DaoTreasuryUpdated(address oldDao, address newDao);
    event RouterUpdated(address oldRouter, address newRouter);
    event Cl8yTokenUpdated(address oldCl8y, address newCl8y);
    event WbnbUpdated(address oldWbnb, address newWbnb);
    event MinCl8ySwapWeiUpdated(uint256 oldMin, uint256 newMin);

    error ZeroAddress();
    error TransferFailed();
    error InsufficientBalance();
    error SwapFailed();

    /// @notice Receive BNB as fees (from Map, Combat, Spawn)
    receive() external payable;

    /// @notice Execute swap of accumulated 30% portion for CL8Y and burn
    /// @dev Can be called by anyone when sufficient BNB has accumulated
    function executeCl8yBuyBurn() external returns (uint256 cl8yBurned);
}
