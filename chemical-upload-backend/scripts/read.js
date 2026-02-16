const hre = require("hardhat");

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // your deployed address
  const ChemicalStorage = await hre.ethers.getContractAt("ChemicalStorage", contractAddress);
  
  const all = await ChemicalStorage.getAllChemicals();
  console.log("🧪 Stored Chemicals:");
  console.log(all);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
