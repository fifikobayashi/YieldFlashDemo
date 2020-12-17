const pools = {
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
    lender = await deploy('YieldDaiLender-' + name, {
      from: deployer,
      deterministicDeployment: true,
      args: [pools[name][chainId]],
    })
    console.log(`Deployed YieldDaiLender to ${lender.address}`); 
  } */
};

module.exports = func;
module.exports.tags = ["YieldDaiLender"];
