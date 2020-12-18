# Yield Flash-Mint-Powered Flash Loan

I recently tried out [Alberto Cuesta Canada](https://twitter.com/acuestacanada)'s Flash Mint powered Flash Loan offering from the Yield Protocol, so here's a template contract you can play and customise.

This flash loan basically flash mints fyDAI and then swaps it into DAI for your contract's use via YieldSpace pools.

Some key attributes I've noticed include:
- the use of ERC-3156 wrappers to provide a standardized fyDai and Dai flash lending interfaces to fyDai and Pool contracts.
- the YieldDaiBorrower contract which you inherit from, flash mints fyDAI and then uses it to borrow Dai from YieldSpace pools, which is like a normal AMM but the invariant takes a time to maturity parameter.
- the swapping logic of the flash minted fyDAI into DAI is abstracted away for the end developer.
- the flash fee is roughly 2.5 bps, but can change subject to time-to-maturity and loan-to-reserves ratio.

## Experienced Devs
If you're an experienced dev simply head to https://docs.yield.is and should be pretty easy for you to work things out. Just make your contract inherit YieldDaiBorrower and then override the receiveLoan() function with your mid flash logic.

## Junior Devs
If you're not as experienced with all this flashiness, but would still like to try this out, detailed instructions below:

### Setup and Deployment
1. git clone this repo
```
git clone https://github.com/fifikobayashi/YieldFlashDemo
cd YieldFlashDemo
```
2. setup dependencies
```
npm install @openzeppelin/contracts
npm install dotenv
npm install --save truffle-hdwallet-provider
```
3. sort out your .gitignore and .env
4. update the first argument in truffle migration script to reflect which DAI you want to use (see [docs.yield.is](https://docs.yield.is)) e.g. for kovan DAI
```
module.exports = function (deployer) {
  deployer.deploy(YieldFlashDemo, "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa");
};
```
5. By default, it simply flash mints fyDAI then swaps it for DAI from YieldSpace pools before repaying the amount+fee. If you want to do some fancy arbitrage with the temporarily acquired DAI, then you need to add that to the receiveLoan() function within the YieldFlashDemo contract, before the repayFlashLoan() function is called.
```
    /// @dev Override this function with your own logic. Make sure the contract holds `loanAmount` + `fee` Dai
    // and that `repayFlashLoan` is called.
    function receiveLoan(address sender_, uint256 loanAmount_, uint256 fee_) internal override {
        sender = sender_;
        loanAmount = loanAmount_;
        fee = fee_;
        balance = dai.balanceOf(address(this));

        /**
        * Insert your mid flash logic here
        * e.g. arbitrage, collateral swap, self liquidation, refinancing, exploit research
        **/

        repayFlashLoan(loanAmount_, fee_);
    }
}
```
6. Now let's deploy this contract
```
truffle migrate --network kovan --reset --skipDryRun
```

### Execution
7. Note the deployed contract address and send some DAI to it to cover the approx. 2.5 bps flash fee.
8. Let's jump onto truffle console
```
truffle console --network kovan
```
9. Set the YieldSpace pool e.g. for fyDaiLP20Dec21 on Kovan it is
```
YieldFlashDemo.deployed().then(function(instance){return instance.setPool('0x2b004AF29102Ab5f1ca977a45AF24A26eaa683Ca')});
```
10. Now based on that pool let's check the available flash liquidity so we can ensure we don't try to flash more than this
```
YieldFlashDemo.deployed().then(function(instance){return instance.flashSupply()});
```
11. Then based on how much you want to flash, let's get an estimate of the fee e.g. for 1500 DAI
```
YieldFlashDemo.deployed().then(function(instance){return instance.flashFee('1500000000000000000000')});
```
12. Finally, with all the information known, we execute this flash mint powered flash loan for 1500 DAI
```
YieldFlashDemo.deployed().then(function(instance){return instance.flashBorrow('1500000000000000000000')});
```
13. If all went well, it should look like this on [kovan testnet](https://kovan.etherscan.io/tx/0x406d396044b5cda6cb33f6c6bb891c96a5fe3a4a4b0a982425bc2e78f980b6d5)

### It didn't work, why?
Could be anything, but check whether:
- you forgot to set the YieldSpace Pool prior to flashing or used the wrong address
- you tried to flash more than the available liquidity on testnet
- you forgot to fund the contract with enough DAI to cover the flash fee
- ask [Alberto](https://twitter.com/acuestacanada)


That's it! Have fun with it!

Thanks,
fifikobayashi
