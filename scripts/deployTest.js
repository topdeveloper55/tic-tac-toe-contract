const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  //deploy TIC contract
  const TicToken = await ethers.getContractFactory("TicToken");
  const ticToken = await TicToken.deploy();
  console.log("token address: ", ticToken.address);
  await ticToken.setVault(deployer.address);
  console.log("ticToken.setVault");
  await ticToken.mint(deployer.address, "1000000000000");

  // Deploy TicTacToe
  const TIC = await ethers.getContractFactory("TicTacToe");
  const tic = await TIC.deploy(ticToken.address);
  console.log("Tic deployed "+tic.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
