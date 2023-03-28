const { Schema, model } = require("mongoose");

const smartContractSchema = new Schema({
    contract_name: {
        type: String,
        unique: true,
        required: true,
    },
    owner: {
        type: String,
        required: true,
    },
    contract_address: {
        type: String,
        unique: true,
        required: true,
    },
    contract_abi: {
        type: Array,
        required: true,
    }
});

const SmartContract = model("SmartContract", smartContractSchema);

module.exports = SmartContract;
