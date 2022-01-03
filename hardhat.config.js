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
      accounts: ['0x33149fbe1c6ecc29308df3386dfdff05e9c97194706ea913b78597b20d61da11']
    },
    // fantomMainnet: {
    //   url: `https://rpc.ftm.tools/`,
    //   accounts: ['', ''],
    //   timeout: 20000000
    // },
  },
};
