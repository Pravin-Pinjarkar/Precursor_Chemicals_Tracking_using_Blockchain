import { ethers } from "ethers";
import dotenv from "dotenv";
import CONTRACT_ABI from "./ChemicalStorageABI.json" assert { type: "json" };

dotenv.config();

// ------------------------------
// 1. Blockchain + Contract Setup
// ------------------------------
const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545");

// Use private key from .env to sign transactions
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Deployed contract address from deployment
const contractAddress = process.env.CONTRACT_ADDRESS;

// Create contract instance
const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, wallet);

// ------------------------------
// 2. Function: Add Chemical Data
// ------------------------------
export const addChemicalToBlockchain = async (name, formula, quantity, location, ownerName) => {
  try {
    const tx = await contract.storeChemical(name, formula, quantity, location, ownerName);
    console.log("⏳ Transaction submitted. Hash:", tx.hash);

    await tx.wait();
    console.log("✅ Transaction confirmed!");

    return { success: true, txHash: tx.hash };
  } catch (error) {
    console.error("❌ Error in addChemicalToBlockchain:", error);
    return { success: false, error: error.message };
  }
};

// ------------------------------
// 3. Function: Get Chemical by ID
// ------------------------------
export const getChemicalFromBlockchain = async (id) => {
  try {
    const chemical = await contract.getChemical(id);

    return {
      id: id,
      name: chemical[0],
      formula: chemical[1],
      quantity: chemical[2].toString(),
      location: chemical[3],
      owner: chemical[4],
      timestamp: new Date(parseInt(chemical[5]) * 1000).toLocaleString(),
    };
  } catch (error) {
    console.error("❌ Error in getChemicalFromBlockchain:", error);
    return null;
  }
};

// ------------------------------
// 4. Function: Get All Chemicals
// ------------------------------
export const getAllChemicals = async () => {
  try {
    const chemicalCount = await contract.getChemicalCount();
    const results = [];

    for (let i = 0; i < chemicalCount; i++) {
      const chemical = await getChemicalFromBlockchain(i);
      if (chemical) results.push(chemical);
    }

    return results;
  } catch (error) {
    console.error("❌ Error in getAllChemicals:", error);
    return [];
  }
};

console.log("✅ Blockchain utility loaded successfully!");
