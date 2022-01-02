// @dev. This script will deploy this V1.1 of Olympus. It will deploy the whole ecosystem except for the LP tokens and their bonds.
// This should be enough of a test environment to learn about and test implementations with the Olympus as of V1.1.
// Not that the every instance of the Treasury's function 'valueOf' has been changed to 'valueOfToken'...
// This solidity function was conflicting w js object property name

const { ethers } = require("hardhat");

async function main() {
  const [deployer, MockDAO] = await ethers.getSigners();

  const dev = "0xaF9Ce5fbC97cdA0B3287d1043Dfba36edE47bBc3";

  const VNO = await ethers.getContractFactory("VenosToken");
  const vno = await VNO.deploy();
  console.log("vno deployed "+vno.address);

  await vno.setVault(deployer.address);
  console.log("vno.setVault performed");

  // Deploy DAI
  const DAI = await ethers.getContractFactory("DAI");
  const dai = await DAI.deploy(0);
  console.log("dai deployed "+dai.address);

  await dai.mint(dev, "10000000000000000000000");
  console.log("dai.mint");

  const LBE = await ethers.getContractFactory("VNOSale");
  const lbe = await LBE.deploy(dai.address, vno.address, dev, 3);
  console.log("lbe deployed "+lbe.address);

  await vno.mint(lbe.address, "200000000000");
  console.log("vno minted");
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
