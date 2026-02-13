// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ILevelToken} from "./interfaces/ILevelToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title LevelToken
/// @notice ERC20 with immutable level for combat power (power = level * amount)
contract LevelToken is ERC20, ILevelToken, Ownable {
    uint256 private immutable _level;
    address public minter;

    constructor(uint256 level, string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {
        _level = level;
    }

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function getLevel() external view returns (uint256) {
        return _level;
    }

    function mint(address to, uint256 amount) external {
        require(msg.sender == minter || msg.sender == owner(), "Not minter");
        _mint(to, amount);
    }
}
