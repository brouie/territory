// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.30;

import {IPancakeRouter02} from "../interfaces/IPancakeRouter02.sol";

/// @title MockRouter
/// @notice Testnet-only: forwards received BNB to recipient instead of swapping
contract MockRouter is IPancakeRouter02 {
    address public recipient;

    constructor(address _recipient) {
        recipient = _recipient;
    }

    function swapExactETHForTokensSupportingFeeOnTransferTokens(
        uint256,
        address[] calldata,
        address,
        uint256
    ) external payable override {
        if (msg.value > 0 && recipient != address(0)) {
            (bool ok,) = recipient.call{value: msg.value}("");
            require(ok, "MockRouter: transfer failed");
        }
    }
}
