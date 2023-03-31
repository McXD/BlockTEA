const mongoose = require("mongoose");
const { Schema } = mongoose;

const eventEffectSchema = new Schema({
    accountId: {
        type: Schema.Types.ObjectId,
        ref: "Account",
        required: true,
    },
    amountField: {
        type: String,
        required: true,
    },
    operation: {
        type: String,
        enum: ["debit", "credit"],
        required: true,
    },
});

const eventConfigurationSchema = new Schema({
    smartContractId: {
        type: Schema.Types.ObjectId,
        ref: "SmartContract",
        required: true,
    },
    eventName: {
        type: String,
        required: true,
    },
    eventEffects: [eventEffectSchema],
});

const EventConfiguration = mongoose.model("EventConfiguration", eventConfigurationSchema);

module.exports = EventConfiguration;
