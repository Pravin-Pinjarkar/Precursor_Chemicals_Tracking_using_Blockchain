const hre = require("hardhat");

async function main() {
  // Get contract factory
  const ChemicalStorage = await hre.ethers.getContractFactory("ChemicalStorage");

  // Deploy contract
  const chemicalStorage = await ChemicalStorage.deploy();

  // Wait for deployment to complete
  await chemicalStorage.waitForDeployment();

  console.log("✅ ChemicalStorage deployed to:", await chemicalStorage.getAddress());
}

// Run the deploy function and handle errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
