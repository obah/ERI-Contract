const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying contracts...");

    // Step 1: Deploy OwnershipLib
    // const ownershipLibFactory = await hre.ethers.getContractFactory("OwnershipLib");
    // const ownershipLib = await ownershipLibFactory.deploy();
    // console.log(`📚 OwnershipLib deployed at: ${ownershipLib.target}`);
    //
    // // Step 2: Deploy Ownership using OwnershipLib
    // const ownershipContract = await hre.ethers.getContractFactory("Ownership", {
    //     libraries: {
    //         OwnershipLib: ownershipLib.target,
    //     },
    // });
    // const ownership = await ownershipContract.deploy("0xF2E7E2f51D7C9eEa9B0313C2eCa12f8e43bd1855");
    // console.log(`📦 Ownership deployed at: ${ownership.target}`);

    // Step 3: Deploy Authenticity with Ownership address
    const AuthenticityFactory = await hre.ethers.getContractFactory("Authenticity");
    // const authenticity = await AuthenticityFactory.deploy(ownership.target);
    const authenticity = await AuthenticityFactory.deploy("0x2c20b3c33D21C5196Ae1596e84cAC31B96553C73");
    console.log(`🧾 Authenticity deployed at: ${authenticity.target}`);

    console.log("✅ Deployment complete.");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});

// 📚 OwnershipLib deployed at: 0x28DD9DD29dFFAd9908Ba8991e947887F58FfB1cB
// https://sepolia.basescan.org/address/0x28DD9DD29dFFAd9908Ba8991e947887F58FfB1cB#code


// 📦 Ownership deployed at: 0x2c20b3c33D21C5196Ae1596e84cAC31B96553C73
// https://sepolia.basescan.org/address/0x2c20b3c33D21C5196Ae1596e84cAC31B96553C73#code

// 🧾 Authenticity deployed at: 0x1160cCbfb67Ecf3b95B5547A635E88E36E2E23aD
// https://sepolia.basescan.org/address/0x1160cCbfb67Ecf3b95B5547A635E88E36E2E23aD#code

// to verify a contract, you need the contract address and also the constructor parameters
// npx hardhat verify --network base 0xf36f55D6Df2f9d5C7829ed5751d7E88FD3E82c2E 0xF2E7E2f51D7C9eEa9B0313C2eCa12f8e43bd1855 0x527caBd4bb83F94f1Fc1888D0691EF95e86795A1
