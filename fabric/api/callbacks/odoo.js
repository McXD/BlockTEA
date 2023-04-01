const xmlrpc = require('xmlrpc');
const fs = require("fs");

const odooConfig = {
    url: 'http://172.20.67.63:8069/',
    db: 'demo',
    username: 'fyl155165@gmail.com',
    password: 'fyl200165',
};

const objectClient = xmlrpc.createClient(`${odooConfig.url}/xmlrpc/2/object`);
const commonClient = xmlrpc.createClient(`${odooConfig.url}/xmlrpc/2/common`);

function authenticate() {
    return new Promise((resolve, reject) => {
        commonClient.methodCall('authenticate', [odooConfig.db, odooConfig.username, odooConfig.password, {}], (error, uid) => {
            if (error) {
                reject(error);
            } else {
                resolve(uid);
            }
        });
    });
}

async function createJournalEntry(event) {
    const accountMappings = JSON.parse(fs.readFileSync('account_mappings.json', 'utf8'));
    const uid = await authenticate();

    if (!accountMappings[event.eventName]) {
        return Promise.resolve();
    }

    const [debitAccountId, creditAccountId] = accountMappings[event.eventName];
    // number
    const amount = Number(event.payload.AppraisedValue);
    const txHash = event.transactionId
    const date = new Date().toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
        objectClient.methodCall(
            'execute_kw',
            [
                odooConfig.db,
                uid,
                odooConfig.password,
                'account.move',
                'create',
                [
                    {
                        journal_id: 1,
                        date: date,
                        ref: txHash,
                        line_ids: [
                            [0, 0, {
                                account_id: debitAccountId,
                                name: `FABRIC: ${event.eventName} - Debit`,
                                debit: amount,
                                credit: 0.00,
                            }],
                            [0, 0, {
                                account_id: creditAccountId,
                                name: `FABRIC: ${event.eventName} - Credit`,
                                debit: 0.00,
                                credit: amount,
                            }],
                        ],
                    },
                ],
            ],
            (error, journalEntryId) => {
                if (error) {
                    reject(error);
                } else {
                    // Post the journal entry
                    objectClient.methodCall(
                        'execute_kw',
                        [
                            odooConfig.db,
                            uid,
                            odooConfig.password,
                            'account.move',
                            'write',
                            [[journalEntryId], {state: 'posted'}],
                        ],
                        (error) => {
                            if (error) {
                                reject(error);
                            } else {
                                resolve(journalEntryId);
                            }
                        },
                    );
                }
            },
        );
    });
}

const processEvent = async (event, network, contracts) => {
    const journalEntryId = await createJournalEntry(event);
    console.log(`Posted journal entry with ID ${journalEntryId}`);
}

module.exports = {
    processEvent: processEvent,
};
