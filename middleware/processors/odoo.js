const mq = require('../util/mq');
const EXCHANGE_NAME = 'blockchain-events';
const { createJournalEntry } = require('../util/odoo');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/blocktea?replicaSet=rs0'; // Replace with your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function getConfigurationsByVendor(vendor) {
    try {
        await client.connect();

        const db = client.db('blocktea'); // Replace with your database name
        const configurationsCollection = db.collection('configurations'); // Replace with your configurations collection name

        // Fetch all configurations with the specified vendor
        const configurations = await configurationsCollection.find({ vendor: vendor }).toArray();

        // Organize the configurations into a map with the event as key
        return configurations.reduce((map, config) => {
            map[config.event] = config;
            return map;
        }, {});
    } catch (error) {
        console.error('Error fetching configurations:', error);
    } finally {
        await client.close();
    }
}


async function listenToExchangeEvents(mqChannel) {
    const queueName = 'odoo';

    // Assert the queue and bind it to the exchange
    await mqChannel.assertQueue(queueName, { durable: true });
    await mqChannel.bindQueue(queueName, EXCHANGE_NAME, '');

    // Start consuming messages from the queue
    mqChannel.consume(queueName, async (msg) => {
        const config = await getConfigurationsByVendor('odoo');

        if (msg !== null) {
            try {
                const event = JSON.parse(msg.content.toString());
                // pass if event is not in config
                // can also do this via queue matching
                if (!config[event.name]) {
                    mqChannel.ack(msg);
                    return;
                }

                console.log(`Received event ${event.name} from ${event.origin} with transaction ID ${event.transactionId}.`)
                const amount = Number(event.payload[config[event.name].amountField]);
                const txHash = event.transactionId;
                const eventName = event.name;
                const date = new Date().toISOString().split('T')[0];
                const debitAccountId = config[event.name].debitAccount.id;
                const creditAccountId = config[event.name].creditAccount.id;
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

main().then(() => console.log('Odoo processor started.')).catch((error) => console.error('Error starting Odoo processor:', error));