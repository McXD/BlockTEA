const SmartContract = require('../models/smartContract');
const EventConfiguration = require('../models/eventConfiguration');
const JournalEntry = require('../models/journalEntry');
const BlockchainEvent = require('../models/blockchainEvent');
const Account = require('../models/account');
const Web3 = require('web3');
const web3Provider = require('../config').web3Provider;
const web3 = new Web3(new Web3.providers.HttpProvider(web3Provider));

// Function to process a received event
async function processEvent(eventName, args, contract) {
    const smartContractId = contract._id;

    // Query the EventConfiguration collection to find the relevant configuration
    const eventConfig = await EventConfiguration.findOne({
        smartContractId,
        eventName,
    });

    if (!eventConfig) {
        console.log(`No configuration found for event ${eventName}`);
        return;
    }

    // Save the event
    const eventData = {
        id: args._id,
        name: eventName,
        contract_id: smartContractId,
        transaction_hash: args.transactionHash,
        event_data: args,
        is_balanced: false,
    };

    const blockchainEvent = new BlockchainEvent(eventData);
    await blockchainEvent.save();

    // Process the event based on the eventEffects configuration
    for (const effect of eventConfig.eventEffects) {
        const {accountId, amountField, operation} = effect;
        const amount = args[amountField];

        // Update the associated account based on the operation (debit or credit)
        JournalEntry.create({
            account_id: accountId,
            event_id: blockchainEvent._id,
            amount: amount,
            entry_type: operation,
        })
            .then((result) => {
                console.log('Journal Entry Created');
            })
            .catch((err) => {
                console.log(err);
            });

        const getAmountSign = (operation, accountType) => {
            if (operation === "debit") {
                if (["asset", "expense"].includes(accountType)) {
                    return 1;
                } else {
                    return -1;
                }
            } else {
                if (["liability", "equity", "income"].includes(accountType)) {
                    return 1;
                } else {
                    return -1;
                }
            }
        };

        const account = await Account.findById(accountId);

        // Update the balance of the account
        const ret = Account.findByIdAndUpdate(
            accountId,
            {
                $inc: {
                    balance: amount * getAmountSign(operation, account.type),
                },
            },
            {new: true}
        ).then((result) => {
            console.log('Account Updated: ', result);
        });
    }
}

async function setupEventListeners() {
    // Get all event configurations
    const eventConfigs = await EventConfiguration.find();

    for (const eventConfig of eventConfigs) {
        const eventName = eventConfig.eventName;
        const smartContractId = eventConfig.smartContractId;

        // Find the corresponding SmartContract
        const contractData = await SmartContract.findById(smartContractId);

        if (!contractData) {
            console.error(`SmartContract not found for ID: ${smartContractId}`);
            continue;
        }

        const {contract_address, contract_abi} = contractData;
        const contract = new web3.eth.Contract(contract_abi, contract_address);

        const eventAbi = contract._jsonInterface.find(
            (iface) => iface.type === 'event' && iface.name === eventName
        );

        if (!eventAbi) {
            console.error(`Event "${eventName}" not found in the contract ABI.`);
            continue;
        }

        try {
            // Create an event filter for the given event name
            const eventFilter = {
                address: contract_address,
                topics: [eventAbi.signature],
                fromBlock: '0',
            };

            // Start polling for new events
            setInterval(async () => {
                // Get new logs using the event filter
                const logs = await web3.eth.getPastLogs(eventFilter);

                // Process each log
                for (const log of logs) {
                    // Parse the received log using the contract ABI
                    const parsedEvent = web3.eth.abi.decodeLog(eventAbi.inputs, log.data, log.topics.slice(1));
                    parsedEvent.transactionHash = log.transactionHash; // Add transactionHash to the parsed event

                    // skip if the transaction is already processed
                    const isProcessed = await BlockchainEvent.findOne({transaction_hash: parsedEvent.transactionHash});
                    if (isProcessed) {
                        continue;
                    }

                    console.log("Catch event: ", parsedEvent);
                    await processEvent(eventName, parsedEvent, contractData);
                }
            }, 10 * 1000); // Poll every 10 seconds
        } catch (error) {
            console.error(`Error creating event filter for "${eventName}": ${error.message}`);
        }
    }
}


// Initialize mongoose connection
require('../db')().then((_) => console.log('Database connection initialized'));

// Initialize event listeners
setupEventListeners().then((_) => console.log('Event listeners initialized'));
