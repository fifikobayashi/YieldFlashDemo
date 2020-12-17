// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./fyDai/YieldMath.sol";
import "./helpers/SafeCast.sol";
import "./interfaces/IPool.sol";
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
 * YieldDaiLender allows ERC-3156 Dai flash loans out of a YieldSpace pool, by flash minting fyDai and selling it to the pool.
 */
contract YieldDaiLender {
    using SafeCast for uint256;
    using SafeMath for uint256;

    IPool public pool;

    constructor (IPool pool_) public {
        pool = pool_;

        // Allow pool to take dai and fyDai for trading
        if (pool.dai().allowance(address(this), address(pool)) < type(uint256).max)
            pool.dai().approve(address(pool), type(uint256).max);
        if (pool.fyDai().allowance(address(this), address(pool)) < type(uint112).max)
            pool.fyDai().approve(address(pool), type(uint256).max);
    }

    /// @dev Fee charged on top of a Dai flash loan.
    function flashFee(uint256 daiBorrowed) public view returns (uint256) {
        uint128 fyDaiAmount = pool.buyDaiPreview(daiBorrowed.toUint128());

        // To obtain the result of a trade on hypothetical reserves we need to call the YieldMath library
        uint256 daiRepaid = YieldMath.daiInForFYDaiOut(
            (uint256(pool.getDaiReserves()).sub(daiBorrowed)).toUint128(),      // Dai reserves minus Dai we just bought
            (uint256(pool.getFYDaiReserves()).add(fyDaiAmount)).toUint128(),    // fyDai reserves plus fyDai we just sold
            fyDaiAmount,                                                        // fyDai flash mint we have to repay
            (pool.fyDai().maturity() - now).toUint128(),                        // This can't be called after maturity
            int128(uint256((1 << 64)) / 126144000),                             // 1 / Seconds in 4 years, in 64.64
            int128(uint256((950 << 64)) / 1000)                                 // Fees applied when selling Dai to the pool, in 64.64
        );

        return daiRepaid.sub(daiBorrowed);
    }

    /// @dev Maximum Dai flash loan available.
    function flashSupply() public view returns (uint256) {
        return pool.getDaiReserves();
    }

    /// @dev Borrow `daiAmount` as a flash loan.
    function flashLoan(address receiver, uint256 daiAmount, bytes memory data) public returns (uint256) {
        bytes memory wrappedData = abi.encode(data, msg.sender, receiver, daiAmount);
        uint256 fyDaiAmount = pool.buyDaiPreview(daiAmount.toUint128());
        pool.fyDai().flashMint(fyDaiAmount, wrappedData);
    }

    /// @dev FYDai `flashMint` callback.
    function executeOnFlashMint(uint256 fyDaiAmount, bytes memory wrappedData) public {
        require(msg.sender == address(pool.fyDai()), "Callbacks only allowed from fyDai contract");

        (bytes memory data, address sender, address receiver, uint256 daiAmount) = abi.decode(wrappedData, (bytes, address, address, uint256));

        uint256 paidFYDai = pool.buyDai(address(this), address(this), daiAmount.toUint128());

        uint256 fee = uint256(pool.buyFYDaiPreview(fyDaiAmount.toUint128())).sub(daiAmount);
        ILoanReceiver(receiver).onFlashLoan(sender, daiAmount, fee, data);
    }

    /// @dev Before the end of the transaction, `receiver` must `transfer` the `loanAmount` plus the `fee`
    /// to this contract and call `repayFlashLoan` to do the conversions that repay the loan.
    function repayFlashLoan(uint256 loanAmount, uint256 fee) public {
        pool.sellDai(address(this), address(this), loanAmount.add(fee).toUint128());
    }
}
