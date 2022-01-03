const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  // Deploy TicTacToe
  const TIC = await ethers.getContractFactory("TicTacToe");
  const tic = await TIC.deploy();
  console.log("Tic deployed "+tic.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
