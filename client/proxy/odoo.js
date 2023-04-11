const xmlrpc = require('xmlrpc');

const odooConnection = (url, db, username, password) => {
    // Create an XML-RPC client
    const [hostname, port] = url.split(':');
    const client = xmlrpc.createClient({ host: hostname, port, path: '/xmlrpc/2/object' });

    const authenticate = async () => {
        const authClient = xmlrpc.createClient({ host: hostname, port, path: '/xmlrpc/2/common' });

        return await new Promise((resolve, reject) => {
            authClient.methodCall('authenticate', [db, username, password, {}], (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    };


    // Fetch accounts
    const fetchAccounts = async () => {
        const uid = await authenticate();

        return new Promise((resolve, reject) => {
            client.methodCall(
                'execute_kw',
                [db, uid, password, 'account.account', 'search_read', [[]], {}],
                (error, result) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
    };

    return { fetchAccounts };
};

module.exports = odooConnection;
