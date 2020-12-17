const fyDai = {
  '' : {
    '1' : '',
    '42' : ''
  },
  '' : {
    '1' : '',
    '42' : ''
  },
  '' : {
    '1' : '',
    '42' : ''
  },
  '' : {
    '1' : '',
    '42' : ''
  },
  '' : {
    '1' : '',
    '42' : ''
  },
}

const func = async function ({ deployments, getNamedAccounts, getChainId }) {
  const { deploy, read, execute } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId()

  /* if (chainId === '31337') { // buidlerevm's chainId
    console.log('Local deployments not implemented')
    return
  } else {
    lender = await deploy('YieldFYDaiLender-' + name, {
      from: deployer,
      deterministicDeployment: true,
      args: [fyDai[name][chainId]],
    })
    console.log(`Deployed YieldFYDaiLender to ${lender.address}`);
  } */
};

module.exports = func;
module.exports.tags = ["YieldFYDaiLender"];
