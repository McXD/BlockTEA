const { connect } = require('@hyperledger/fabric-gateway');
const { newGrpcConnection, newIdentity, newSigner } = require('./connect');
const { TextDecoder } = require('util');
const fs = require('fs');
const path = require('path');


const channelName = 'mychannel';
const chaincodeName = 'asset-transfer-events';
const utf8Decoder = new TextDecoder();

async function main() {
    const client = await newGrpcConnection();
    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
    });

    try {
        const network = gateway.getNetwork(channelName);
        const startBlock = BigInt(0); // Change this value as needed

        await replayChaincodeEvents(network, startBlock);
    } catch (error) {
        console.error('Failed to listen for events:', error);
        process.exit(1);
    } finally {
        gateway.close();
        client.close();
    }
}

async function replayChaincodeEvents(network, startBlock) {
    console.log('\n*** Start chaincode event replay');

    const events = await network.getChaincodeEvents(chaincodeName, {
        startBlock,
    });

    const callbacksPath = path.join(__dirname, 'callbacks');
    // Load all callbacks from the callbacks directory, ignoring those start with "__"
    const callbackFiles = fs.readdirSync(callbacksPath).filter((file) => !file.startsWith('__'));

    const callbacks = callbackFiles.map((file) => require(path.join(callbacksPath, file)));

    try {
        for await (const event of events) {
            event.payload = JSON.parse(utf8Decoder.decode(event.payload));
            // Call process_event for each callback
            for (const callback of callbacks) {
                callback.processEvent(event, network, { "asset-transfer-events": network.getContract("asset-transfer-events") });
            }
        }
    } finally {
        events.close();
    }
}

main().catch((error) => {
    console.error('Failed to run the application:', error);
    process.exit(1);
});
