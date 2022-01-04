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
      url: "http://localhost:8545",
      accounts: [
        "0x8273ff06b44de6ada4fe2abf10b7edc51f64ad33b1f0cc32c1cc038b8e6ed352",
      ],
    },
    // fantomMainnet: {
    //   url: `https://rpc.ftm.tools/`,
    //   accounts: ['', ''],
    //   timeout: 20000000
    // },
  },
};
