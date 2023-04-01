const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const MongoClient = require('mongodb').MongoClient;

// Connect to the Ethereum network
const NETWORK_URL = 'http://127.0.0.1:8545';
const web3 = new Web3(new Web3.providers.HttpProvider(NETWORK_URL));

// Load contract ABIs and deployed addresses
const ABI_PATH = path.join(__dirname, 'ABIs');
const ADDRESS_PATH = path.join(__dirname, 'addresses');
const contractAbiMap = {};
const contractAddressMap = {};
const contracts = {};

for (const file of fs.readdirSync(ABI_PATH)) {
    if (file.endsWith('.json')) {
        const contractName = file.slice(0, -5);
        const content = fs.readFileSync(path.join(ABI_PATH, file), 'utf-8');
        contractAbiMap[contractName] = JSON.parse(content);
    }
}

for (const file of fs.readdirSync(ADDRESS_PATH)) {
    if (file.endsWith('.json')) {
        const contractName = file.slice(0, -5);
        const content = fs.readFileSync(path.join(ADDRESS_PATH, file), 'utf-8');
        contractAddressMap[contractName] = JSON.parse(content);
    }
}

for (const contractName in contractAbiMap) {
    const contractAddress = contractAddressMap[contractName];
    const contractAbi = contractAbiMap[contractName];
    contracts[contractName] = new web3.eth.Contract(contractAbi, contractAddress);
}

async function main() {
    const client = new MongoClient('mongodb://localhost:27017/');
    await client.connect();
    const db = client.db('ethereum_events');
    const eventCollection = db.collection('events');

    console.log(`Starting event listener to ${NETWORK_URL}`);
    await pollEvents(db, eventCollection);
}

async function loadCallbacks(callbacksDir) {
    const callbacksPath = path.join(__dirname, callbacksDir);
    const callbackFiles = fs.readdirSync(callbacksPath).filter((file) => !file.startsWith('__') && file.endsWith('.js'));

    return callbackFiles.map((file) => require(path.join(callbacksPath, file)));
}

function createEventFilters(startBlock, contractAbiMap, contractAddressMap) {
    const eventFilters = {};

    for (const contractName in contracts) {
        const contract = contracts[contractName];

        for (const item of contractAbiMap[contractName]) {
            if (item.type === 'event') {
                const eventName = item.name;
                const eventFilter = {
                    get: () => contract.getPastEvents(eventName, { fromBlock: startBlock, toBlock: 'latest' }),
                    fromBlock: startBlock,
                    toBlock: 'latest',
                };
                eventFilters[`${contractName}.${eventName}`] = eventFilter;
            }
        }
    }

    return eventFilters;
}

async function getLastProcessedBlockNumber(db) {
    const lastBlockCollection = db.collection('last_block');
    const lastBlockEntry = await lastBlockCollection.findOne();

    if (lastBlockEntry) {
        return lastBlockEntry.number;
    } else {
        await lastBlockCollection.insertOne({ number: 0 });
        return 0;
    }
}

async function pollEvents(db, eventCollection) {
    let startBlock = await getLastProcessedBlockNumber(db);
    console.log(`Starting from block ${startBlock}`);
    const eventFilters = createEventFilters(startBlock, contractAbiMap, contractAddressMap);
    const callbacks = await loadCallbacks('callbacks');

    while (true) {
        const endBlock = await web3.eth.getBlockNumber();
        if (startBlock >= endBlock) {
            await sleep(10000);
            continue;
        }

        for (const eventKey in eventFilters) {
            const eventFilter = eventFilters[eventKey];
            eventFilter.fromBlock = startBlock;
            eventFilter.toBlock = endBlock;
            const rawEvents = await eventFilter.get();

            const events = rawEvents.map(rawEvent => {
                return {
                    logIndex: rawEvent.logIndex,
                    transactionIndex: rawEvent.transactionIndex,
                    transactionId: rawEvent.transactionHash,
                    blockHash: rawEvent.blockHash,
                    blockNumber: rawEvent.blockNumber,
                    address: rawEvent.address,
                    payload: rawEvent.returnValues,
                    eventName: rawEvent.event,
                };
            });

            for (const event of events) {
                const existingEvent = await eventCollection.findOne({
                    transactionId: event.transactionId,
                    logIndex: event.logIndex,
                    blockNumber: event.blockNumber,
                });

                if (!existingEvent) {
                    const eventID = (await eventCollection.insertOne(event)).insertedId;
                    console.log(`Registered event with ID: ${eventID}`);

                    for (const callback of callbacks) {
                        await callback.processEvent(event, web3, contracts);
                    }
                }
            }
        }

        // Update the last processed block number in the database
        await db.collection('last_block').updateOne({}, { $set: { number: endBlock } });

        startBlock = endBlock + 1;
        await sleep(10000);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().then(r => console.log('Done')).catch(e => console.error(e));