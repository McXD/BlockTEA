const mq = require('../util/mq');
const EXCHANGE_NAME = 'blockchain-events';
const { createJournalEntry } = require('../util/odoo');

const config = {
    ethereum: {
        OrderConfirmed: {
            "debitAccountId": 1,
            "creditAccountId": 2,
            "amountField": "totalAmount"
        },
        InvoicePaid: {
            debitAccountId: 2,
            creditAccountId: 3,
            amountField: "amount"
        }
    },
    hyperledger: {
        CreateAsset: {
            debitAccountId: 1,
            creditAccountId: 2,
            amountField: "AppraisedValue"
        },
        TransferAsset: {
            debitAccountId: 2,
            creditAccountId: 3,
            amountField: "AppraisedValue"
        }
    }
}

async function listenToExchangeEvents(mqChannel) {
    const queueName = 'odoo_accounting';

    // Assert the queue and bind it to the exchange
    await mqChannel.assertQueue(queueName, { durable: true });
    await mqChannel.bindQueue(queueName, EXCHANGE_NAME, '');

    // Start consuming messages from the queue
    mqChannel.consume(queueName, async (msg) => {
        if (msg !== null) {
            try {
                const event = JSON.parse(msg.content.toString());
                // pass if event is not in config
                // can also do this via queue matching
                if (!config[event.origin] || !config[event.origin][event.name]) {
                    mqChannel.ack(msg);
                    return;
                }

                console.log(`Received event ${event.name} from ${event.origin} with transaction ID ${event.transactionId}.`)
                const amount = Number(event.payload[config[event.origin][event.name].amountField]);
                const txHash = event.transactionId;
                const eventName = event.name;
                const date = new Date().toISOString().split('T')[0];
                const debitAccountId = config[event.origin][event.name].debitAccountId;
                const creditAccountId = config[event.origin][event.name].creditAccountId;
                const namePrefix = event.origin;

                const id = await createJournalEntry(amount, txHash, eventName, date, debitAccountId, creditAccountId, namePrefix);
                console.log(`Created journal entry with ID ${id} for event ${eventName} with transaction ID ${txHash}.`)
                // Acknowledge the message after processing it
                mqChannel.ack(msg);
            } catch (error) {
                console.error('Error processing event:', error);
                // You can choose to either requeue the message or ignore it
                mqChannel.nack(msg, false, true); // Requeue the message
            }
        }
    }, { noAck: false });
}

// In your main function, call `listenToExchangeEvents`
async function main() {
    // ...
    // Connect to the MQ channel and start listening for events
    const mqChannel = (await mq.init()).channel;
    listenToExchangeEvents(mqChannel);
    // ...
}

main();