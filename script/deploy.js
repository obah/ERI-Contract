const hre = require("hardhat");
require("dotenv").config();


const {OWNER, CERTIFICATE, SIGNING_DOMAIN, SIGNATURE_VERSION} = process.env;

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
    const ownership = await ownershipContract.deploy(OWNER);
    console.log(`📦 Ownership deployed at: ${ownership.target}`);

    // Step 3: Deploy Authenticity with Ownership address
    const AuthenticityFactory = await hre.ethers.getContractFactory("Authenticity");

    const authenticity = await AuthenticityFactory.deploy(
        ownership.target,
        CERTIFICATE,
        SIGNING_DOMAIN,
        SIGNATURE_VERSION
    );
    console.log(`🧾 Authenticity deployed at: ${authenticity.target}`);

    console.log("✅ Deployment complete.");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exitCode = 1;
});

// 📚 OwnershipLib deployed at: 0x3fB3BCdd95271Fc8b7ebFF48d4d7541b982355ef
// https://sepolia.basescan.org/address/0x1684d002f846febCd6A21DB15C71642532a4edAf#code


// 📦 Ownership deployed at: 0x49e8207450dd0204Bb6a89A9edf7CE151cE58BBc
// https://sepolia.basescan.org/address/0x184ecbE6d79710215c9C8Ce0757875714D78d96c#code

// 🧾 Authenticity deployed at: 0x98BC72046616b528D4Bc5bbcC7d99f82237A8B55
// https://sepolia.basescan.org/address/0x8C3F22cAf6fA0879c04889D6fb5e38747c0f75FC#code

// to verify a contract, you need the contract address and also the constructor parameters
// npx hardhat verify --network base 0xf36f55D6Df2f9d5C7829ed5751d7E88FD3E82c2E 0xF2E7E2f51D7C9eEa9B0313C2eCa12f8e43bd1855 0x527caBd4bb83F94f1Fc1888D0691EF95e86795A1
