const odoo = require('../../common/odoo');
const accountMappings = require('../../common/account_mappings');

const interestedEvents = ['OrderConfirmed', 'InvoicePaid'];

const processEvent = async (event, network, contracts) => {
    if (!interestedEvents.includes(event.eventName)) { return }
    let amount = 0;
    if (event.eventName === 'OrderConfirmed') {
        const orderId = event.payload.orderId;
        const order = await contracts['PurchaseOrder'].methods.getOrder(orderId).call()
        amount = Number(order.quantity) * Number(order.price);
        [debitAccountId, creditAccountId] = accountMappings['OrderConfirmed'];
    }

    if (event.eventName === 'InvoicePaid') {
        const invoiceId = event.payload.invoiceId;
        const invoice = await contracts['PurchaseOrder'].methods.invoices(invoiceId).call()
        amount = Number(invoice.amount);
        [debitAccountId, creditAccountId] = accountMappings['InvoicePaid'];
    }

    const date  = new Date().toISOString().split('T')[0];
    const journalId = await odoo.createJournalEntry(amount, event.transactionId, event.eventName, date, debitAccountId, creditAccountId, 'ETH')

    console.log(`Created journal entry ${journalId} for event ${event.eventName} with amount ${amount}`);
};

module.exports = {
    processEvent: processEvent,
};
