// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {LevelToken} from "./LevelToken.sol";
import {ILevelToken} from "./interfaces/ILevelToken.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title UnitFactory
/// @notice Creates and tracks level-based unit tokens
contract UnitFactory is Ownable {
    constructor() Ownable(msg.sender) {}
    mapping(uint256 => address) private _tokens;

    event TokenCreated(uint256 level, address token);

    function createToken(uint256 level) external onlyOwner returns (address) {
        require(_tokens[level] == address(0), "Level exists");
        string memory name = string.concat("Unit L", _toString(level));
        string memory symbol = string.concat("UNIT", _toString(level));
        LevelToken token = new LevelToken(level, name, symbol);
        _tokens[level] = address(token);
        emit TokenCreated(level, address(token));
        return address(token);
    }

    function setTokenMinter(uint256 level, address minter) external onlyOwner {
        LevelToken(_tokens[level]).setMinter(minter);
    }

    function mintFor(uint256 level, address to, uint256 amount) external onlyOwner {
        LevelToken(_tokens[level]).mint(to, amount);
    }

    function getToken(uint256 level) external view returns (address) {
        return _tokens[level];
    }

    function _toString(uint256 n) internal pure returns (string memory) {
        if (n == 0) return "0";
        uint256 j = n;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        j = n;
        while (j != 0) {
            k = k - 1;
            uint8 temp = uint8(48 + (j % 10));
            bstr[k] = bytes1(temp);
            j /= 10;
        }
        return string(bstr);
    }
}
