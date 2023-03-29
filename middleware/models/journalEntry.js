const { Schema, model } = require("mongoose");

const entryTypes = ["debit", "credit"];

const journalEntrySchema = new Schema({
    account_id: {
        type: Schema.Types.Number,
        ref: "Account",
        required: true,
    },
    event_id: {
        type: Schema.Types.Number,
        ref: "BlockchainEvent",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value > 0;
            },
            message: "Amount must be greater than 0",
        },
    },
    entry_type: {
        type: String,
        enum: entryTypes,
        required: true,
    },
});

const JournalEntry = model("JournalEntry", journalEntrySchema);

module.exports = JournalEntry;
