// models/Configuration.js

const mongoose = require('mongoose');

const ConfigurationSchema = new mongoose.Schema({
    vendor: { type: String, required: true },
    event: { type: String, required: true },
    debitAccount: {
        type: mongoose.Schema.Types.Mixed,
    },
    creditAccount: {
        type: mongoose.Schema.Types.Mixed,
    },
    amountField: { type: String, required: true },
}, {strict: false});

module.exports = mongoose.model('Configuration', ConfigurationSchema);
