const { ethers } = require("hardhat");

async function main() {
  const [deployer, MockDAO] = await ethers.getSigners();
  console.log("Deploying contracts with the account: " + deployer.address);

  // token addresses
  const vno_address = "0x07508992492344749F1D53A147a841bc8B7C9B66";
  const dai_address = "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E";
  const usdc_address = "0x04068da6c83afcfa0e13ba15a6696662335d5b75";
  const wftm_address = "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83";
  const mim_address = "0x82f0B8B456c1A451378467398982d4834b6829c1";
  const frax_address = "0xdc301622e621166bd8e82f2ca0a26c13ad0be355";
  const daiLp_address = "0xea643d73C0566d93F62EdCaFd8851cB5644dDC53";

  /// Initial staking index
  const initialIndex = "3663612244";
  const oldInitialIndex = "1030211592";

  /// First block epoch occurs
  const firstEpochBlock = "114863000";

  /// What epoch will be first epoch
  const firstEpochNumber = "338";

  /// How many blocks are in each epoch
  const epochLengthInBlocks = "28200";

  // Initial reward rate for epoch
  const initialRewardRate = "3000";

  /// Ethereum 0 address, used when toggling changes in treasury
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  /// Large number for approval for VNO
  const largeApproval = "100000000000000000000000000000000";

  /// DAI bond BCV
  const daiBondBCV = "369";
  /// USDC bond BCV
  const usdcBondBCV = "690";
  /// MIM bond BCV
  const mimBondBCV = "690";
  /// wftm bond BCV
  const wftmBondBCV = "690";
  /// Frax bond BCV
  const fraxBondBCV = "690";

  /// Bond vesting length in blocks. 561,000 ~ 5 days
  const bondVestingLength = "423000";

  /// Min bond price
  const minBondPrice = "1000";

  /// Max bond payout
  const maxBondPayout = "100";

  /// DAO fee for bond
  const bondFee = "4000";

  /// Max debt bond can take on
  const maxBondDebt = "1000000000000000";

  /// Initial Bond debt
  const intialBondDebt = "0";

  // deploy sVenosToken
  const SVNO = await ethers.getContractFactory("sVenosToken");
  const sVNO = await SVNO.deploy();
  console.log("svno deployed "+sVNO.address);

  // Deploy OldsVNO
  const OldSVNO = await ethers.getContractFactory("OldsVenosToken");
  const oldsVNO = await OldSVNO.deploy();
  console.log("oldsvno deployed "+oldsVNO.address);

  // Deploy wsVNO
  const WsVNO = await ethers.getContractFactory("wsVNO");
  const wsVNO = await WsVNO.deploy(sVNO.address);
  console.log("wsvno deployed "+wsVNO.address);

  // Deploy treasury
  const Treasury = await ethers.getContractFactory("VenosTreasury");
  const treasury = await Treasury.deploy(vno.address, dai_address, 0);
  console.log("treasury deployed "+treasury.address);

  // Deploy bonding calc
  const VenosBondingCalculator = await ethers.getContractFactory(
    "VenosBondingCalculator"
  );
  const venosBondingCalculator = await VenosBondingCalculator.deploy(
    vno.address
  );
  console.log("bonding calc deployed "+venosBondingCalculator.address);

  // Deploy Oldbonding calc
  const OldVenosBondingCalculator = await ethers.getContractFactory(
    "OldVenosBondingCalculator"
  );
  const oldvenosBondingCalculator = await OldVenosBondingCalculator.deploy(
    vno.address
  );
  console.log("old bonding calc deployed "+oldvenosBondingCalculator.address);

  // Deploy Staking
  const Staking = await ethers.getContractFactory("VenosStaking");
  const staking = await Staking.deploy(
    vno.address,
    sVNO.address,
    epochLengthInBlocks,
    firstEpochNumber,
    firstEpochBlock
  );
  console.log("staking deployed "+staking.address);

  // Deploy OldStaking
  const OldStaking = await ethers.getContractFactory("OldVenosStaking");
  const oldstaking = await OldStaking.deploy(
    vno.address,
    oldsVNO.address,
    epochLengthInBlocks,
    firstEpochNumber,
    firstEpochBlock
  );
  console.log("old staking deployed "+oldstaking.address);

  // Deploy staking distributor
  const Distributor = await ethers.getContractFactory("MigrateDistributor");
  const distributor = await Distributor.deploy(
    treasury.address,
    vno.address,
    epochLengthInBlocks,
    firstEpochBlock,
    oldstaking.address,
    oldsVNO.address,
    staking.address,
    sVNO.address
  );
  console.log("distributor deployed "+distributor.address);

  // distributor set rate
  await distributor.setRate(initialRewardRate);
  console.log("reward rate set");

  // Deploy Redeem_helper
  const REDEEM_HELPER = await ethers.getContractFactory("RedeemHelper");
  const sREDEEM_HELPER = await REDEEM_HELPER.deploy();
  console.log("redeem helper deployed "+sREDEEM_HELPER.address);

  // Deploy staking warmpup
  const StakingWarmpup = await ethers.getContractFactory("StakingWarmup");
  const stakingWarmup = await StakingWarmpup.deploy(
    staking.address,
    sVNO.address
  );
  console.log("staking warmup deployed "+stakingWarmup.address);

  // Deploy staking helper
  const StakingHelper = await ethers.getContractFactory("StakingHelper");
  const stakingHelper = await StakingHelper.deploy(
    staking.address,
    vno.address
  );
  console.log("staking helper deployed "+stakingHelper.address);

  // Deploy oldstaking helper
  const OldStakingHelper = await ethers.getContractFactory("OldStakingHelper");
  const oldstakingHelper = await OldStakingHelper.deploy(
    oldstaking.address,
    vno.address
  );
  console.log("old staking helper deployed "+oldstakingHelper.address);

  // Deploy DAI bond
  //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
  const DAIBond = await ethers.getContractFactory("VenosBondDepository");
  const daiBond = await DAIBond.deploy(
    vno.address,
    dai_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("dai bond deployed "+daiBond.address);

  // Deploy usdc bond
  //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
  const UsdcBond = await ethers.getContractFactory("VenosBondDepository");
  const usdcBond = await UsdcBond.deploy(
    vno.address,
    usdc_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("usdc bond deployed "+usdcBond.address);

  // Deploy wftm bond
  //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
  const WftmBond = await ethers.getContractFactory("VenosBondDepository");
  const wftmBond = await WftmBond.deploy(
    vno.address,
    wftm_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("wftm bond deployed "+wftmBond.address);

  // Deploy mim bond
  //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
  const MimBond = await ethers.getContractFactory("VenosBondDepository");
  const mimBond = await MimBond.deploy(
    vno.address,
    mim_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("mim bond deployed "+mimBond.address);

  // Deploy frax bond
  //@dev changed function call to Treasury of 'valueOf' to 'valueOfToken' in BondDepository due to change in Treausry contract
  const FraxBond = await ethers.getContractFactory("VenosBondDepository");
  const fraxBond = await FraxBond.deploy(
    vno.address,
    frax_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("frax bond deployed "+fraxBond.address);

  // Deploy daiBondStakeDepository1
  const DaiBondStake1 = await ethers.getContractFactory(
    "VenosBondStakeDepository"
  );
  const daiBondStake1 = await DaiBondStake1.deploy(
    "dai4-bond",
    vno.address,
    sVNO.address,
    dai_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("DaiBondStakeDepository1 deployed "+daiBondStake1.address);

  // Deploy daiBondStakeDepository2
  const DaiBondStake2 = await ethers.getContractFactory(
    "VenosBondStakeDepository"
  );
  const daiBondStake2 = await DaiBondStake1.deploy(
    "dai4-2-bond",
    vno.address,
    sVNO.address,
    dai_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("DaiBondStakeDepository2 deployed "+daiBondStake2.address);

  // Deploy usdcBondStakeDepository1
  const UsdcBondStake1 = await ethers.getContractFactory(
    "VenosBondStakeDepository"
  );
  const usdcBondStake1 = await UsdcBondStake1.deploy(
    "usdc4-bond",
    vno.address,
    sVNO.address,
    usdc_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("USDCBondStakeDepository1 deployed "+usdcBondStake1.address);

  // Deploy usdcBondStakeDepository2
  const UsdcBondStake2 = await ethers.getContractFactory(
    "VenosBondStakeDepository"
  );
  const usdcBondStake2 = await UsdcBondStake2.deploy(
    "usdc4-2-bond",
    vno.address,
    sVNO.address,
    usdc_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("USDCBondStakeDepository2 deployed "+usdcBondStake2.address);

  // Deploy mimBondStakeDepository
  const MimBondStake = await ethers.getContractFactory(
    "VenosBondStakeDepository"
  );
  const mimBondStake = await MimBondStake.deploy(
    "mim4-bond",
    vno.address,
    sVNO.address,
    mim_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("mimBondStakeDepository deployed "+mimBondStake.address);

  // Deploy mimBondStakeDepository
  const MimBondStake2 = await ethers.getContractFactory(
    "VenosBondStakeDepository"
  );
  const mimBondStake2 = await MimBondStake2.deploy(
    "mim4-bond",
    vno.address,
    sVNO.address,
    mim_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("mimBondStakeDepository2 deployed "+mimBondStake2.address);

  // Deploy fraxBondStakeDepository
  const FraxBondStake = await ethers.getContractFactory(
    "VenosBondStakeDepository"
  );
  const fraxBondStake = await FraxBondStake.deploy(
    "frax4-bond",
    vno.address,
    sVNO.address,
    frax_address,
    treasury.address,
    MockDAO.address,
    venosBondingCalculator.address
  );
  console.log("fraxBondStakeDepository deployed "+fraxBondStake.address);

  // queue and toggle bond reserve depositor
  await treasury.queue("0", daiBond.address);
  await treasury.queue("0", usdcBond.address);
  await treasury.queue("0", wftmBond.address);
  await treasury.queue("0", mimBond.address);
  await treasury.queue("0", fraxBond.address);
  console.log("treasury queue bond")
  await treasury.toggle("0", daiBond.address, zeroAddress);
  await treasury.toggle("0", usdcBond.address, zeroAddress);
  await treasury.toggle("0", wftmBond.address, zeroAddress);
  await treasury.toggle("0", mimBond.address, zeroAddress);
  await treasury.toggle("0", fraxBond.address, zeroAddress);
  console.log("terasury toggle performed-bondDepository");

  // Set bond terms
  await daiBond.initializeBondTerms(
    daiBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await usdcBond.initializeBondTerms(
    usdcBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await mimBond.initializeBondTerms(
    mimBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await fraxBond.initializeBondTerms(
    fraxBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await wftmBond.initializeBondTerms(
    wftmBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  console.log("daibond initialize");

  // Set staking for bond
  await daiBond.setStaking(staking.address, true);
  await usdcBond.setStaking(staking.address, true);
  await mimBond.setStaking(staking.address, true);
  await wftmBond.setStaking(staking.address, true);
  await fraxBond.setStaking(staking.address, true);
  console.log("daibond setstaking");

  // Initialize sVNO and set the index
  await sVNO.initialize(staking.address);
  await sVNO.setIndex(initialIndex);
  console.log("svno initialize");

  // Initialize oldsVNO and set the index
  await oldsVNO.initialize(oldstaking.address);
  await oldsVNO.setIndex(oldInitialIndex);
  console.log("oldsvno initialize");

  // set distributor contract and warmup contract
  await staking.setContract("0", distributor.address);
  await staking.setContract("1", stakingWarmup.address);
  console.log("staking setcontract");

  // set old distributor contract and warmup contract
  await oldstaking.setContract("0", distributor.address);
  await oldstaking.setContract("1", stakingWarmup.address);
  console.log("staking setcontract");

  // Set treasury for VNO token
  await vno.setVault(treasury.address);
  console.log("vno.setVault");

  // queue and toggle reward manager
  await treasury.queue("8", distributor.address);
  await treasury.toggle("8", distributor.address, zeroAddress);
  console.log("treasury toggle reward manager");

  // queue and toggle deployer reserve depositor 
  await treasury.queue("0", deployer.address);
  await treasury.toggle("0", deployer.address, zeroAddress);
  console.log("treasury toggle deployer reserve depositor");

  // queue and toggle liquidity depositor
  await treasury.queue("4", deployer.address);
  await treasury.toggle("4", deployer.address, zeroAddress);
  console.log("treasury toggle liquidity depositor");

  // Approve staking and staking helper contact to spend deployer's VNO
  await vno.approve(staking.address, largeApproval);
  await vno.approve(stakingHelper.address, largeApproval);
  console.log("vno.approve");
  
  // queue and toggle bond stake reserve depositor
  await treasury.queue("0", daiBondStake1.address);
  await treasury.queue("0", daiBondStake2.address);
  await treasury.queue("0", usdcBondStake1.address);
  await treasury.queue("0", usdcBondStake2.address);
  await treasury.queue("0", mimBondStake.address);
  await treasury.queue("0", mimBondStake2.address);
  await treasury.queue("0", fraxBondStake.address);
  console.log("treasury queue bond stake"); 
  await treasury.toggle("0", daiBondStake1.address, zeroAddress);
  await treasury.toggle("0", daiBondStake2.address, zeroAddress);
  await treasury.toggle("0", usdcBondStake1.address, zeroAddress);
  await treasury.toggle("0", usdcBondStake2.address, zeroAddress);
  await treasury.toggle("0", mimBondStake.address, zeroAddress);
  await treasury.toggle("0", mimBondStake2.address, zeroAddress);
  await treasury.toggle("0", fraxBondStake.address, zeroAddress);
  console.log("terasury toggle bondstake");

  // Set bond stake terms
  await daiBondStake1.initializeBondTerms(
    daiBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await daiBondStake2.initializeBondTerms(
    daiBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await usdcBondStake1.initializeBondTerms(
    usdcBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await usdcBondStake2.initializeBondTerms(
    usdcBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await mimBondStake.initializeBondTerms(
    mimBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await mimBondStake2.initializeBondTerms(
    mimBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  await fraxBondStake.initializeBondTerms(
    fraxBondBCV,
    bondVestingLength,
    minBondPrice,
    maxBondPayout,
    bondFee,
    maxBondDebt,
    intialBondDebt
  );
  console.log("bond stake initialize");

  // Set staking for bond stake
  await daiBondStake1.setStaking(staking.address);
  await daiBondStake2.setStaking(staking.address);
  await usdcBondStake1.setStaking(staking.address);
  await usdcBondStake2.setStaking(staking.address);
  await mimBondStake.setStaking(staking.address);
  await mimBondStake2.setStaking(staking.address);
  await fraxBondStake.setStaking(staking.address);
  console.log("bondstake setstaking");

  //redeem helper addBondContract
  await sREDEEM_HELPER.addBondContract(daiBond.address);
  await sREDEEM_HELPER.addBondContract(usdcBond.address);
  await sREDEEM_HELPER.addBondContract(mimBond.address);
  await sREDEEM_HELPER.addBondContract(fraxBond.address);
  await sREDEEM_HELPER.addBondContract(wftmBond.address);
  await sREDEEM_HELPER.addBondContract(daiBondStake1.address);
  await sREDEEM_HELPER.addBondContract(daiBondStake2.address);
  await sREDEEM_HELPER.addBondContract(usdcBondStake1.address);
  await sREDEEM_HELPER.addBondContract(usdcBondStake2.address);
  await sREDEEM_HELPER.addBondContract(mimBondStake.address);
  await sREDEEM_HELPER.addBondContract(mimBondStake2.address);
  await sREDEEM_HELPER.addBondContract(fraxBondStake.address);
  console.log("addBondContract-redeemHelper");

  console.log("VNO: " + vno.address);
  console.log("Treasury: " + treasury.address);
  console.log("Bonding Calc: " + venosBondingCalculator.address);
  console.log("OldBondingCalc: " + oldvenosBondingCalculator.address);
  console.log("Staking: " + staking.address);
  console.log("OldStaking: " + oldstaking.address);
  console.log("sVNO: " + sVNO.address);
  console.log("OldsVNO: " + oldsVNO.address);
  console.log("wsVNO: " + wsVNO.address);
  console.log("Distributor " + distributor.address);
  console.log("Staking Warmup " + stakingWarmup.address);
  console.log("Staking Helper " + stakingHelper.address);
  console.log("OldStaking Helper " + oldstakingHelper.address);
  console.log("Redeem Helper " + sREDEEM_HELPER.address);
  console.log("DaiBondDepository " + daiBond.address);
  console.log("UsdcBondDepository " + usdcBond.address);
  console.log("mimBondDepository " + mimBond.address);
  console.log("wftmBondDepository " + wftmBond.address);
  console.log("fraxBondDepository " + fraxBond.address);
  console.log("DaiBondStakeDepository1 " + daiBondStake1.address);
  console.log("DaiBondStakeDepository2 " + daiBondStake2.address);
  console.log("UsdcBondStakeDepository1 " + usdcBondStake1.address);
  console.log("UsdcBondStakeDepository2 " + usdcBondStake2.address);
  console.log("mimBondStakeDepository " + mimBondStake.address);
  console.log("mimBondStakeDepository2 " + mimBondStake2.address);
  console.log("fraxBondStakeDepository " + fraxBondStake.address);
}

main()
  .then(() => process.exit())
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
