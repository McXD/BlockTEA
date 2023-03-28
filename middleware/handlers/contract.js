const express = require("express");
const router = express.Router();
const SmartContract = require("../models/SmartContract");
const Web3 = require("web3")

const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

// Add a new smart contract definition
router.post("/", async (req, res) => {
    console.log(req.body);
    const { name, address, owner, abi } = req.body;

    try {
        // Check if the address is valid
        if (!web3.utils.isAddress(address)) {
            return res.status(400).json({ error: "Invalid contract address" });
        }

        // Check if the contract exists on the Ethereum blockchain
        const contractCode = await web3.eth.getCode(address);
        if (contractCode === "0x") {
            return res.status(404).json({ error: "Contract not found on the blockchain" });
        }


        const newSmartContract = new SmartContract({ contract_name: name, contract_address: address, owner: owner, contract_abi: abi });
        await newSmartContract.save();
        res.status(201).json(newSmartContract);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Edit a smart contract definition
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { name, address, abi } = req.body;

    try {
        const contract = await SmartContract.findById(id);

        if (!contract) {
            return res.status(404).json({ error: "Smart contract not found" });
        }

        contract.contract_name = name;
        contract.contract_address = address;
        contract.contract_abi = abi;
        await contract.save();
        res.status(200).json(contract);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Delete a smart contract definition
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const contract = await SmartContract.findById(id);

        if (!contract) {
            return res.status(404).json({ error: "Smart contract not found" });
        }

        await contract.remove();
        res.status(200).json({ message: "Smart contract deleted", contract });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
