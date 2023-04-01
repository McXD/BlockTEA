const odoo = require('../../common/odoo');
const accountMappings = require('../../common/account_mappings');

const interestedEvents = ['CreateAsset', 'TransferAsset'];

const processEvent = async (event, network, contracts) => {
    if (!interestedEvents.includes(event.eventName)) { return }
    const [debitAccountId, creditAccountId] = accountMappings[event.eventName];
    const amount = Number(event.payload.AppraisedValue);
    const date = new Date().toISOString().split('T')[0];
    const journalId = await odoo.createJournalEntry(amount, event.transactionId, event.eventName, date, debitAccountId, creditAccountId, 'Fabric')

    console.log(`Created journal entry ${journalId} for event ${event.eventName} with amount ${amount}`);
};

module.exports = {
    processEvent: processEvent,
};
