const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying contracts...");

    // Step 1: Deploy OwnershipLib
    const ownershipLibFactory = await hre.ethers.getContractFactory("OwnershipLib");
    const ownershipLib = await ownershipLibFactory.deploy();
    console.log(`📚 OwnershipLib deployed at: ${ownershipLib.target}`);

    // Step 2: Deploy Ownership using OwnershipLib
    const ownershipContract = await hre.ethers.getContractFactory("Ownership", {
        libraries: {
            OwnershipLib: ownershipLib.target,
        },
    });
    const ownership = await ownershipContract.deploy("0xF2E7E2f51D7C9eEa9B0313C2eCa12f8e43bd1855");
    console.log(`📦 Ownership deployed at: ${ownership.target}`);

    // Step 3: Deploy Authenticity with Ownership address
    const AuthenticityFactory = await hre.ethers.getContractFactory("Authenticity");
    const authenticity = await AuthenticityFactory.deploy(ownership.target);
    console.log(`🧾 Authenticity deployed at: ${authenticity.target}`);

    console.log("✅ Deployment complete.");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});

// 📚 OwnershipLib deployed at: 0x87f707d2D2504A1eBAC6b76D1AB5A2B02B8D572D
//https://sepolia.basescan.org/address/0x87f707d2D2504A1eBAC6b76D1AB5A2B02B8D572D#code

// 📦 Ownership deployed at: 0xab7ab8a73c4B4F37Af5Cd257A3527556001d6F61
// https://sepolia.basescan.org/address/0xab7ab8a73c4B4F37Af5Cd257A3527556001d6F61#code

// 🧾 Authenticity deployed at: 0x281497e6a616BC8fc667DCB58Ee8BCe4CEAB3093
//https://sepolia.basescan.org/address/0x281497e6a616BC8fc667DCB58Ee8BCe4CEAB3093#code

// to verify a contract, you need the contract address and also the constructor parameters
// npx hardhat verify --network base 0xf36f55D6Df2f9d5C7829ed5751d7E88FD3E82c2E 0xF2E7E2f51D7C9eEa9B0313C2eCa12f8e43bd1855 0x527caBd4bb83F94f1Fc1888D0691EF95e86795A1
