// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.10;

import "./interfaces/IFYDai.sol";

/**
 * ILoanReceiver receives flash loans, and is expected to repay them plus a fee.
 * Implements ERC-3156: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3156.md
 * `receiver` should verify that the `onFlashLoan` caller is in a whitelist of trusted lenders.
 */
interface ILoanReceiver {
    function onFlashLoan(address sender, uint256 loanAmount, uint256 fee, bytes memory data) external;
}

/**
 * YieldFYDaiLender allows flash loans of fyDai compliant with ERC-3156: https://github.com/ethereum/EIPs/blob/master/EIPS/eip-3156.md
 */
contract YieldFYDaiLender {
    IFYDai public fyDai;

    constructor (IFYDai fyDai_) public {
        fyDai = fyDai_;
    }

    /// @dev Fee charged on top of a fyDai flash loan.
    function flashFee(uint256) public view returns (uint256) {
        return 0;
    }

    /// @dev Maximum fyDai flash loan available.
    function flashSupply() public view returns (uint256) {
        return type(uint112).max - fyDai.totalSupply(); // Can't overflow
    }

    /// @dev ERC-3156 entry point to send `fyDaiAmount` fyDai to `receiver` as a flash loan.
    function flashLoan(address receiver, uint256 fyDaiAmount, bytes memory data) public returns (uint256) {
        bytes memory wrappedData = abi.encode(data, msg.sender, receiver);
        fyDai.flashMint(fyDaiAmount, wrappedData);
    }

    /// @dev FYDai `flashMint` callback, which bridges to the ERC-3156 `onFlashLoan` callback.
    function executeOnFlashMint(uint256 fyDaiAmount, bytes memory wrappedData) public {
        require(msg.sender == address(fyDai), "Callbacks only allowed from fyDai contract");
        (bytes memory data, address sender, address receiver) = abi.decode(wrappedData, (bytes, address, address));
        ILoanReceiver(receiver).onFlashLoan(sender, fyDaiAmount, 0, data);
    }
}
