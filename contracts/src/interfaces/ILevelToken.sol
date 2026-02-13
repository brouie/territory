// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

/// @title ILevelToken
/// @notice ERC20 token with an immutable level (for combat power = level * amount)
interface ILevelToken {
    function getLevel() external view returns (uint256);
}
