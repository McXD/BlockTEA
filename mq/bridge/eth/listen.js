const Web3 = require('web3');
const fs = require('fs/promises');
const config = require('./config');
const mq = require('../util/mq');
const {join} = require("path");

const NETWORK_URL = config.network.rpcUrl;
const web3 = new Web3(new Web3.providers.HttpProvider(NETWORK_URL));
const LAST_BLOCK_FILE = 'lastBlock.json';

async function getLastBlock() {
    try {
        const filePath = join(__dirname, LAST_BLOCK_FILE);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data).number;
    } catch (error) {
        return 0;
    }
}

async function updateLastBlock(lastBlock) {
    const data = { number: lastBlock };
    await fs.writeFile(LAST_BLOCK_FILE, JSON.stringify(data));
}

function createContractInstances() {
    const contracts = {};
    for (const contractName in config.contracts) {
        const address = config.contracts[contractName].address;
        const abi = config.contracts[contractName].abi;

        contracts[contractName] = new web3.eth.Contract(abi, address);
    }
    return contracts;
}

function createEventFilters(startBlock, contracts) {
    const eventFilters = {};

    for (const contractName in contracts) {
        const contract = contracts[contractName];
        for (const eventName of config.contracts[contractName].interestedEvents) {
            eventFilters[`${contractName}.${eventName}`] = {
                get: (fromBlock, toBlock) => contract.getPastEvents(eventName, {fromBlock, toBlock}),
                fromBlock: startBlock,
                toBlock: 'latest',
            };
        }
    }

    return eventFilters;
}


async function main() {
    console.log(`Starting event listener to ${NETWORK_URL}`);
    const startBlock = await getLastBlock();
    const contracts = createContractInstances();
    const eventFilters = createEventFilters(startBlock, contracts);

    const { channel } = await mq.init();
    const queue = 'blockchain-events';

    await pollEvents(channel, queue, eventFilters, contracts);
}

async function pollEvents(channel, queue, eventFilters, contracts) {
    let startBlock = await getLastBlock();

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
            const rawEvents = await eventFilter.get(eventFilter.fromBlock, eventFilter.toBlock);

            const events = rawEvents.map(rawEvent => {
                return {
                    origin: "ethereum",
                    transactionId: rawEvent.transactionHash,
                    name: rawEvent.event,
                    contract: { address: rawEvent.address },
                    payload: rawEvent.returnValues,
                };
            });

            for (const event of events) {
                // Publish to RabbitMQ
                mq.sendMessageToQueue(channel, queue, JSON.stringify(event));
            }
        }

        // Update the last processed block number in the file
        await updateLastBlock(endBlock);

        startBlock = endBlock + 1;
        await sleep(10000);
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().then(r => console.log('Done')).catch(e => console.error(e));
