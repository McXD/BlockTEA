const config = {
    partyA: {
        name: "BlueTech Ltd.",
        poRole: "buyer",
        fabricOrg: "Org1",
        fabricApiUrl: "http://localhost:3001",
        cordaIdentity: "O=PartyA,L=London,C=GB",
        cordaApiUrl: "http://localhost:10050",
        aisProvider: {
            id: "odoo",
            name: "Odoo",
            url: "http://172.20.73.31:8069/web#action=229&model=account.move.line&view_type=list&cids=1&menu_id=115",
        }
    },
    partyB: {
        name: "GreenSolutions Inc.",
        poRole: "seller",
        fabricOrg: "Org2",
        fabricApiUrl: "http://localhost:3002",
        cordaIdentity: "O=PartyB,L=New York,C=US",
        cordaApiUrl: "http://localhost:10051",
        aisProvider: {
            id: "quickbooks",
            name: "QuickBooks",
            url: "https://app.sandbox.qbo.intuit.com/app/report/builder?rptId=sbg:a9b1d2ed-f82a-48d9-8440-55ad8221265a&type=system&token=JOURNAL"
        }
    },
    apiBaseUrl: "http://localhost:8000",
    etherscanUrl: "http://localhost:4000",
    configApiUrl: "http://localhost:3003",
};

export default config;
