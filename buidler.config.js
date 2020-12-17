const fs = require('fs')
const path = require('path')
usePlugin('@nomiclabs/buidler-truffle5')
usePlugin('solidity-coverage')
usePlugin('buidler-gas-reporter')
usePlugin('buidler-deploy')


// REQUIRED TO ENSURE METADATA IS SAVED IN DEPLOYMENTS (because solidity-coverage disable it otherwise)
const {
  TASK_COMPILE_GET_COMPILER_INPUT
} = require("@nomiclabs/buidler/builtin-tasks/task-names");
task(TASK_COMPILE_GET_COMPILER_INPUT).setAction(async (_, bre, runSuper) => {
  const input = await runSuper();
  input.settings.metadata.useLiteralContent = bre.network.name !== "coverage";
  return input;
})


function nodeUrl(network) {
  let infuraKey
  try {
    infuraKey = fs.readFileSync(path.resolve(__dirname, '.infuraKey')).toString().trim()
  } catch(e) {
    infuraKey = ''
  }
  return `https://${network}.infura.io/v3/${infuraKey}`
}

let mnemonic = process.env.MNEMONIC;
if (!mnemonic) {
  try {
    mnemonic = fs.readFileSync(path.resolve(__dirname, '.secret')).toString().trim()
  } catch(e){}
}
const accounts = mnemonic ? {
  mnemonic,
}: undefined;

module.exports = {
  defaultNetwork: 'buidlerevm',
  networks: {
    kovan: {
      accounts,
      url: nodeUrl('kovan'),
      timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
      gasPrice: 10000000000,  // 10 gwei
      skipDryRun: false       // Skip dry run before migrations? (default: false for public nets )
    },
    goerli: {
      accounts,
      url: nodeUrl('goerli'),
    },
    rinkeby: {
      accounts,
      url: nodeUrl('rinkeby')
    },
    ropsten: {
      accounts,
      url: nodeUrl('ropsten')
    },
    mainnet: {
      accounts,
      url: nodeUrl('mainnet'),
      timeoutBlocks: 200,     // # of blocks before a deployment times out  (minimum/default: 50)
      gasPrice: 50000000000,  // 50 gwei
      skipDryRun: false       // Skip dry run before migrations? (default: false for public nets )
    },
    coverage: {
      url: 'http://127.0.0.1:8555',
    },
  },
  solc: {
    version: '0.6.10',
    optimizer: {
      enabled: true,
      runs: 20000,
    },
  },
  gasReporter: {
    enabled: true,
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    coverage: './coverage',
    coverageJson: './coverage.json',
    artifacts: './artifacts',
  },
  namedAccounts: {
    deployer: 0
  }
}