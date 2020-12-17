# Yield fyDai Flash

This repo contains:
- Contracts implementing a package to flash borrow Dai from YieldSpace pools
- ERC-3156 wrappers to provide a standardized fyDai and Dai flash lending interfaces to fyDai and Pool contracts.

## fyDai-flash NPM package

This package contains the YieldDaiBorrower contract that can be inherited from to obtain flash borrowing capabilities, with Dai provided from a YieldSpace pool.

 - setPool(address): Set a lending pool to flash borrow from.
 - flashFee(uint): Obtain the fee to pay for a given loan. Time-sensitive.
 - flashSupply(): Obtain the maximum loan available.
 - executeOnFlashMint(uint, data): FYDai callback, not executable by EOAs.
 - receiveLoan(address, uint, uint): User callback. Override with your reaction to receiving the loan.
 - repayFlashLoan(uint, fee): Execute after transferring the loan amount plus fee to resolve the flash loan.
