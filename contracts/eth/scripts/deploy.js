const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const contractName = "EnterpriseInvoice";
  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await ContractFactory.deploy();
  await contract.deployed();

  console.log(`${contractName} deployed to: ${contract.address}`);

  // Write the contract address to a text file
  fs.writeFileSync(
    `deployments/${contractName}.json`,
    JSON.stringify({ address: contract.address })
  );

  return contract.address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

