const { connect } = require('@hyperledger/fabric-gateway');
const { newGrpcConnection, newIdentity, newSigner } = require('./connect');
const { TextDecoder } = require('util');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const channelName = 'mychannel';
const chaincodeName = 'asset-transfer-events';
const utf8Decoder = new TextDecoder();

const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'fabric_events';
const collectionName = 'events';

let dbClient;
let eventsCollection;

async function connectDb() {
    const client = new MongoClient(mongoUrl);
    await client.connect();
    const db = client.db(dbName);
    eventsCollection = db.collection(collectionName);
    dbClient = client;
}

async function main() {
    await connectDb();

    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });

    try {
        const network = gateway.getNetwork(channelName);
        console.log('\n*** Start chaincode event replay');

        // Loop with a delay using setTimeout
        while (true) {
            // Get start block number from the database
            const lastBlockDoc = await dbClient.db(dbName).collection('last_block').findOne({ channelId: channelName });
            // const startBlock = lastBlockDoc ? BigInt(lastBlockDoc.blockNumber) + BigInt(1) : BigInt(0);
            const startBlock = BigInt(0);
            await replayChaincodeEvents(network, startBlock);

            // Wait for the specified interval before the next iteration
            await new Promise((resolve) => setTimeout(resolve, intervalMilliseconds));
        }
    } catch (error) {
        console.error('Failed to listen for events:', error);
        process.exit(1);
    }
}

async function replayChaincodeEvents(network, startBlock) {
    const events = await network.getChaincodeEvents(chaincodeName, {
        startBlock,
    });

    const callbacksPath = path.join(__dirname, 'callbacks');
    const callbackFiles = fs.readdirSync(callbacksPath).filter((file) => !file.startsWith('__') && file.endsWith('.js'));

    const callbacks = callbackFiles.map((file) => require(path.join(callbacksPath, file)));

    try {
        for await (const event of events) {
            event.payload = JSON.parse(utf8Decoder.decode(event.payload));
            console.log("Full event:", event)

            // Store event in the database if it doesn't already exist
            await eventsCollection.updateOne(
                { transactionId: event.transactionId },
                {
                    $setOnInsert: {
                        blockNumber: event.blockNumber,
                        eventName: event.eventName,
                        payload: event.payload,
                    },
                },
                { upsert: true }
            );

            // Call process_event for each callback
            for (const callback of callbacks) {
                callback.processEvent(event, network, { "asset-transfer-events": network.getContract("asset-transfer-events") });
            }

            // Update last block number in the database
            await dbClient
                .db(dbName)
                .collection('last_block')
                .updateOne(
                    { channelId: channelName },
                    { $set: { blockNumber: event.blockNumber } },
                    { upsert: true }
                );
        }
    } finally {
        events.close();
    }
}

main().catch((error) => {
    console.error('Failed to run the application:', error);
    process.exit(1);
});

// Graceful shutdown
function closeConnections() {
    console.log('Closing connections...');
    dbClient.close();
    process.exit(0);
}

process.on('SIGINT', closeConnections);
process.on('SIGTERM', closeConnections);
