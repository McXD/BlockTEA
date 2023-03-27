const { ethers } = require("hardhat");
const fs = require("fs");

async function deployContract(contractName, contractArgs) {
  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await ContractFactory.deploy(...contractArgs);
  await contract.deployed();

  console.log(`${contractName} deployed to: ${contract.address}`);

  // Write the contract address to a text file
  fs.writeFileSync(
    `deployments/${contractName}.txt`,
    JSON.stringify({ address: contract.address })
  );

  return contract.address;
}

module.exports = {
  deployContract, // Export the deployContract function as a module
};
