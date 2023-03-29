const { Schema, model } = require("mongoose");

const blockchainEventSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    contract_id: {
        type: Schema.Types.ObjectId,
        ref: "SmartContract",
        required: true,
    },
    transaction_hash: {
        type: String,
        required: true,
    },
    event_data: {
        type: Schema.Types.Mixed,
        required: true,
    },
    is_balanced: {
        type: Boolean,
        default: false,
    },
});

const BlockchainEvent = model("BlockchainEvent", blockchainEventSchema);

module.exports = BlockchainEvent;
