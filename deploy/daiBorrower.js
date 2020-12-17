const dai = {
  '42' : '0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa'
}

const func = async function ({ deployments, getNamedAccounts, getChainId }) {
  const { deploy, read, execute } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId()

  if (chainId === '31337') { // buidlerevm's chainId
    console.log('Local deployments not implemented')
    return
  } else {
    const borrower = await deploy('YieldDaiBorrowerMock', {
      from: deployer,
      deterministicDeployment: true,
      args: [dai[chainId]],
    })
    console.log(`Deployed YieldDaiBorrower to ${borrower.address}`);
  }
};

module.exports = func;
module.exports.tags = ["YieldDaiBorrower"];
