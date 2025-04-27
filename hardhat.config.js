require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
    version: "0.8.29",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts", 
    tests: "./test-hardhat", // i deleted test-hardhat, i am using foundry to test
    cache: "./hh-cache",
    artifacts: "./hh-artifacts",
  },
};
