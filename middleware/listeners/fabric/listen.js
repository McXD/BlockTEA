const { connect } = require('@hyperledger/fabric-gateway');
const { newGrpcConnection, newIdentity, newSigner } = require('./connect');
const { TextDecoder } = require('util');
const config = require('./config');
const mq = require('../../util/mq');
const utf8Decoder = new TextDecoder();
const path = require('path')
const fs = require('fs/promises');
const LAST_BLOCK_FILE = path.resolve(__dirname, 'last_block.json');

async function getStartBlock(channelName) {
    try {
        const data = await fs.readFile(LAST_BLOCK_FILE, 'utf-8');
        const parsedData = JSON.parse(data);
        return BigInt(parsedData[channelName]) || BigInt(0); // Convert string to BigInt
    } catch (error) {
        console.log("getLastBlock", error)
        return BigInt(0)
    }
}

async function updateStartBlock(channelName, lastBlock) {
    let data = {};
    try {
        const fileData = await fs.readFile(LAST_BLOCK_FILE, 'utf-8');
        data = JSON.parse(fileData);
    } catch (error) {
        // Ignore if the file does not exist or has incorrect content
        console.log("updateLastBlock", error)
    }

    data[channelName] = lastBlock.toString();
    await fs.writeFile(LAST_BLOCK_FILE, JSON.stringify(data));
}
async function main() {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });
    const mqChannel = (await mq.init()).channel;

    try {
        const channels = Object.keys(config.channels);
        await Promise.all(channels.map(channelName => processChannel(gateway, channelName, mqChannel)));
    } catch (error) {
        console.error('Failed to listen for events:', error);
        process.exit(1);
    }
}

async function processChannel(gateway, channelName, mqChannel) {
    const network = gateway.getNetwork(channelName);
    console.log(`\n*** Start chaincode event replay for channel: ${channelName}`);

    let startBlock = await getStartBlock(channelName);

    while (true) {
        startBlock = await replayChaincodeEvents(mqChannel, network, channelName, startBlock);

        // Wait for the specified interval before the next iteration
        await new Promise((resolve) => setTimeout(resolve, 10000));
    }
}

async function replayChaincodeEvents(mqChannel, network, channelName, startBlock) {
    const contract = network.getContract('qscc');
    let lastBlock = startBlock;

    for (const chaincodeName in config.channels[channelName].chaincodes) {
        const events = await network.getChaincodeEvents(chaincodeName, { startBlock });
        const interestedEvents = new Set(config.channels[channelName].chaincodes[chaincodeName].events);

        try {
            for await (const rawEvent of events) {
                // Check if the current event is specified in the config for this chaincode
                if (interestedEvents.has(rawEvent.eventName)) {
                    const event = {
                        // TODO: read time from block/tx instead of using current time
                        // Unix timestamp in seconds
                        timestamp: Math.floor(Date.now() / 1000),
                        origin: "hyperledger",
                        transactionId: rawEvent.transactionId,
                        name: rawEvent.eventName,
                        contract: { channelName: channelName, chaincodeName: rawEvent.chaincodeName },
                        payload: JSON.parse(utf8Decoder.decode(rawEvent.payload)),
                    }

                    mq.publish(mqChannel, JSON.stringify(event));
                    console.log(JSON.stringify(event))
                }

                const newBlockNumber = BigInt(rawEvent.blockNumber);
                if (newBlockNumber !== lastBlock) {
                    await updateStartBlock(channelName, lastBlock)
                    lastBlock = newBlockNumber
                }
            }
        } finally {
            events.close();
        }
    }

    return lastBlock + BigInt(1);
}


main().catch((error) => {
    console.error('Failed to run the application:', error);
    process.exit(1);
});

// Graceful shutdown
function closeConnections() {
    console.log('Closing connections...');
    process.exit(0);
}

process.on('SIGINT', closeConnections);
process.on('SIGTERM', closeConnections);
