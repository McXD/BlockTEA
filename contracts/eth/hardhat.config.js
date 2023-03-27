require("@nomicfoundation/hardhat-toolbox");

const fs = require("fs");
const { task } = require("hardhat/config");

task("deploy", "Deploys a contract and saves its address")
  .addParam("contract", "The name of the contract to deploy")
  .addOptionalParam(
    "args",
    "The constructor arguments for the contract, separated by commas",
    ""
  )
  .setAction(async (taskArgs, hre) => {
    const { contract, args } = taskArgs;

    console.log(`Deploying ${contract}...`);
    const contractFactory = await hre.ethers.getContractFactory(contract);
    const constructorArgs = args.length
      ? args.split(",").map((arg) => arg.trim())
      : [];
    const contractInstance = await contractFactory.deploy(...constructorArgs);
    await contractInstance.deployed();

    console.log(`${contract} deployed at:`, contractInstance.address);

    // Save the contract address to a file
  fs.writeFileSync(
    `deployments/${contract}.json`,
    JSON.stringify({ address: contractInstance.address })
  );

    console.log(`Address saved to ${contract}_address.json`);
  });


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
};
