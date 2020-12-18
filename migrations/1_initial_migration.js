const YieldFlashDemo = artifacts.require("YieldFlashDemo");

module.exports = function (deployer) {
  deployer.deploy(YieldFlashDemo, "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa");
};
