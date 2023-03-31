const { Schema, model } = require("mongoose");

const accountTypes = ["asset", "liability", "equity", "income", "expense"];

const accountSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
    },
    type: {
        type: String,
        enum: accountTypes,
        required: true,
    },
    balance: {
        type: Number,
        required: true,
    },
});

const Account = model("Account", accountSchema);

module.exports = Account;
