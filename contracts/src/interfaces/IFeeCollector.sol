// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

/// @title IFeeCollector
/// @notice Interface for the fee collection system with player rewards
/// @dev Fee split: 40% protocol, 10% DAO, 20% CL8Y buy-burn, 30% reward pool
interface IFeeCollector {
    event FeesCollected(uint256 total, uint256 treasuryAmount, uint256 daoAmount, uint256 cl8yAmount, uint256 rewardAmount);
    event Cl8yBuyBurnExecuted(uint256 bnbSpent, uint256 cl8yBurned);
    event RewardsClaimed(address indexed player, uint256 amount);
    event RewardPoolUpdated(address oldPool, address newPool);
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

    /// @notice Execute swap of accumulated 20% portion for CL8Y and burn
    /// @dev Can be called by anyone when sufficient BNB has accumulated
    function executeCl8yBuyBurn() external returns (uint256 cl8yBurned);
}
