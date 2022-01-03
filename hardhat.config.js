require("@nomiclabs/hardhat-waffle");
module.exports = {
  solidity: "0.7.5",
  networks: {
    // fantomTestnet: {
    //   url: `https://rpc.testnet.fantom.network/`,
    //   accounts: ['', ''],
    //   timeout: 20000000
    // },
    localhost: {
      url: 'http://localhost:8545',
      accounts: ['0x7759ce0dc5de35225c89369435186c8509ec828f271b10541eac78a7d6ce0811']
    },
    // fantomMainnet: {
    //   url: `https://rpc.ftm.tools/`,
    //   accounts: ['', ''],
    //   timeout: 20000000
    // },
  },
};
