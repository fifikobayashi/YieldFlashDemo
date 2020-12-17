// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../YieldDaiBorrower.sol";


contract YieldDaiBorrowerMock is YieldDaiBorrower {
    IERC20 public immutable dai;

    address public sender;
    uint256 public loanAmount;
    uint256 public fee;
    uint256 public balance;

    constructor (IERC20 dai_) public {
        dai = dai_;
    }

    /// @dev Override this function with your own logic. Make sure the contract holds `loanAmount` + `fee` Dai
    // and that `repayFlashLoan` is called.
    function receiveLoan(address sender_, uint256 loanAmount_, uint256 fee_) internal override {
        sender = sender_;
        loanAmount = loanAmount_;
        fee = fee_;
        balance = dai.balanceOf(address(this));
        repayFlashLoan(loanAmount_, fee_);
    }
}
