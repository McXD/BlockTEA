// mq.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'blockchain-events';
const EXCHANGE_TYPE = 'fanout';

async function connect() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        console.log('Connected to RabbitMQ');
        return connection;
    } catch (error) {
        console.error('Failed to connect to RabbitMQ:', error);
        process.exit(1);
    }
}

async function createChannel(connection) {
    try {
        const channel = await connection.createChannel();
        console.log('Channel created');
        return channel;
    } catch (error) {
        console.error('Failed to create channel:', error);
        process.exit(1);
    }
}

async function init() {
    const connection = await connect();
    const channel = await createChannel(connection);
    await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, { durable: false });

    return { connection, channel };
}

async function publish(channel, message) {
    channel.publish(EXCHANGE_NAME, '', Buffer.from(message));
}

module.exports = {
    init,
    publish,
};
