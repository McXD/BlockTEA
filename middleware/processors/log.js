const { MongoClient } = require('mongodb');
const mq = require('../util/mq');

const MONGODB_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const DB_NAME = 'blocktea';
const COLLECTION_NAME = 'events';
const QUEUE_NAME = 'log';
const EXCHANGE_NAME = 'blockchain-events';

async function main() {
    // Connect to RabbitMQ
    const { channel } = await mq.init();
    const { queue } = await channel.assertQueue(QUEUE_NAME, { exclusive: true });
    channel.bindQueue(queue, EXCHANGE_NAME, '');

    // Connect to MongoDB
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(DB_NAME);
    const eventCollection = db.collection(COLLECTION_NAME);

    // Consume messages from the queue
    channel.consume(queue, async (msg) => {
        if (msg) {
            const event = JSON.parse(msg.content.toString());
            console.log(`Received event: ${JSON.stringify(event)}`);

            // Save the event to MongoDB
            await eventCollection.insertOne(event);

            // Acknowledge the message
            channel.ack(msg);
        }
    });
}

main().then(() => console.log('Logging processor started')).catch((err) => console.error(err));
