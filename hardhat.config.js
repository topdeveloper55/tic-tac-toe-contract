require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: "0.7.5",
  networks: {
    fantomTestnet: {
      url: `https://rpc.testnet.fantom.network/`,
      accounts: ['', ''],
      timeout: 20000000
    },
    localhost: {
      url: 'http://localhost:8545',
      accounts: ['', '']
    },
    fantomMainnet: {
      url: `https://rpc.ftm.tools/`,
      accounts: ['', ''],
      timeout: 20000000
    },
  },
};
