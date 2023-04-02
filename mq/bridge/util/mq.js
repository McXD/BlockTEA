// mq.js
const amqp = require('amqplib');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

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

    return { connection, channel };
}

async function sendMessageToQueue(channel, queue, message) {
    await channel.assertQueue(queue);
    const sent = channel.sendToQueue(queue, Buffer.from(message));

    if (sent) {
        console.log(`Message sent to ${queue}: ${message}`);
    } else {
        console.error(`Failed to send message to ${queue}: ${message}`);
    }
}

module.exports = {
    init,
    sendMessageToQueue,
};
