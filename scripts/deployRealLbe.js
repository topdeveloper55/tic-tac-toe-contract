// @dev. This script will deploy this V1.1 of Olympus. It will deploy the whole ecosystem except for the LP tokens and their bonds.
// This should be enough of a test environment to learn about and test implementations with the Olympus as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'...
// This solidity function was conflicting w js object property name

const { ethers } = require("hardhat");

async function main() {
  const [deployer, MockDAO] = await ethers.getSigners();

  const dev = "0xaF9Ce5fbC97cdA0B3287d1043Dfba36edE47bBc3";
  const vnoAddress = "0x07508992492344749F1D53A147a841bc8B7C9B66";
  const daiAddress = "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E";
  const total = 600;

  const LBE = await ethers.getContractFactory("VNOSale");
  const lbe = await LBE.deploy(daiAddress, vnoAddress, dev, total);
  console.log("lbe deployed "+lbe.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
