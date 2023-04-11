# BlockTEA

This repo is a demonstration of BlockTEA (Blockchain-based Triple-Entry Accounting). It is a proof-of-concept that shows how blockchain can be integrated with Accounting Information Systems (AIS) to provide a more secure and transparent accounting system. This is the final year project of the author for BSc. Computer Science at The Hong Kong Polytechnic University.

## Scenarios

This demo utilizes three blockchains: Ethereum, Hyperledger Fabric and Corda. It connects with two AIS: Odoo and QuickBooks. The following scenarios are implemented:

* Purchase Order
* Asset Transfer
* I-Owe-You (IOU)

## Setting Up

### Blockchains

Three blockchains are used in this demo: Ethereum, Hyperledger Fabric and Corda. Each of them has their own prerequisites and setup steps.

#### Ethereum

Make sure dependencies are installed: `npm install`.

```bash
cd etherum

## Start the local blockchain (:8545)
npx hardhat node

## In a new terminal, deploy the Purchase Order smart contract
## The contract address is deterministic so you don't have to modify the configuration
## Make sure you only deploy the contract once or else you will need to change the address
npx hardhat run scripts/deploy.js --network localhost
```

#### Hyperledger Fabric

Refer to the [Hyperledger Fabric documentation](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html) for the prerequisites. You can also use the `install-fabric.sh` script to install them.

Two organizations will be created `Org1` and `Org2`. In the demo, Org1 is the fictional company "BlueTech Ltd." and Org2 is "GreenSolutions Inc.".

```bash
cd fabric/test-network

## Bootstrap the network
./network.sh up createChannel

## Deploy the Asset Transfer chaincode
./network.sh deployCC -ccn asset-transfer-events -ccp ../chaincode/ -ccl javascript
```

#### Corda

Two parties will be created `PartyA` and `PartyB`. In the demo, PartyA represents "BlueTech Ltd." and PartyB represents "GreenSolutions Inc.".

```bash
cd corda

## Build the nodes and CorDapps
./gradlew deployNodes

## Start the nodes
build/nodes/runnodes
```

#### Explorers

The blockchains can be explored using the following explorers:

* [BlockScout](https://github.com/blockscout/blockscout)
* [Hyperledger Explorer](https://github.com/hyperledger-labs/blockchain-explorer)

Please refer to the official documentation for the setup steps. They can be linked to in the React client app (e.g., for viewing transaction details).

### Smart Contract Gateways

Unlike Ethereum, Hyperledger Fabric and Corda do not have a standard API for smart contracts. Therefore, a gateway is required to interact with the smart contracts. The gateway is an HTTP API that exposes the smart contract functions.

#### Hyperledger Fabric

```bash
cd fabric/api

## Skip if already installed
npm install

## Start the gateway for Org1 (:3001)
node app.js

## Start the gateway for Org2 (:3002)
# node app.js Org2 // Not used in the demo
```

#### Corda

```bash
cd corda

## Start the gateway for PartyA (:10051)
./gradlew runPartyAServer

## Start the gateway for PartyB (:10052)
./gradlew runPartyBServer
```

### Blockchain Event Listeners

In this demo, the two parties share the same set of listeners. The listeners will transform the event and send it to the message queue (on default ampq port 5672). Make sure you have a message broker running. The demo uses RabbitMQ.

```bash
cd ./listeners

# Ethereum
node ethereum/listen.js

# Hyperledger Fabric
cd fabric/listen.js
node listener.js

# Corda
# Listener is running together with the PartyA Gateway
```

### Event Processors

The event processors will listen to the message queue and process the events. There are three pre-defined processors:

* `odoo`: account for the events in Odoo (for BlueTech Ltd.)
* `quickbooks`: account for the events in QuickBooks (for GreenSolutions Inc.)
* `log`: log the events to MongoDB

Make sure that you have configured the credentials in `processor/config.js`. Also make sure that you have MongoDB running (default port 27017).

```bash

```bash
cd processor

node odoo.js
node log.js
python3 quickbooks.py
```

### React Client

The client is a React application that allows the user to interact with the system. In addition to the API gateways for smart contract, the client also connect to a few more backend services (e.g., proxy).  

```bash
cd client

## Start the proxy services (:8081)
node server.js

## Start the web socket server (:8082)
node ws.js

## Start the client (:3000)
npm start
```

### AIS

You can spin up your local [Odoo instance](https://github.com/odoo/odoo) and use the [QuickBooks sandbox](https://developer.intuit.com/app/developer/qbo/docs/develop/sandboxes/manage-your-sandboxes) to for the demo. Remember to update the credentials in the code. 

## Demo Flow

### Create Related Accounts

First, create the following accounts in Odoo and QuickBooks. The account names can be flexible just to distinguish them from the other system-generated accounts.

| AIS        | Account Name                   | Account Type | Description                               |
|------------|--------------------------------|--------------|-------------------------------------------|
| Odoo       | Ether                          | Asset        | PO is settled in Ether                    |
| Odoo       | Inventory (BlockTEA)           | Asset        | Inventory account for PO                  |
| Odoo       | Accounts Payable (BlockTEA)    | Liability    | Accounts payable for PO                   |
| Odoo       | Fabric Asset                   | Asset        | Asset account for Fabric Asset Transfer   |
| Odoo       | Cash (BlockTEA)                | Asset        | Cash account for the demo                 |
| Odoo       | Profit on Fabric Asset         | Revenue      | Revenue account for Fabric Asset Transfer |
| Odoo       | Opening Balance (Fabric Asset) | Equity       | Opening balance for Fabric Asset Transfer |
| Odoo       | Loan Receivable (IOU)          | Asset        | Loan receivable for IOU                   |
| QuickBooks | Accounts Receivable (BlockTEA) | Asset        | Accounts receivable for PO                |
| QuickBooks | Revenue (BlockTEA)             | Revenue      | Revenue account for PO                    |
| QuickBooks | Ether                          | Asset        | Purchase orders are settled in Ether      |
| QuickBooks | Fabric Asset                   | Asset        | Asset account for Fabric Asset Transfer   |
| QuickBooks | Cash (BlockTEA)                | Asset        | Cash account for the demo                 |
| QuickBooks | Profit on Fabric Asset         | Revenue      | Revenue account for Fabric Asset Transfer |
| QuickBooks | Opening Balance (Fabric Asset) | Equity       | Opening balance for Fabric Asset Transfer |
| QuickBooks | Loan Payable (IOU)             | Liability    | Loan payable for IOU                      |

### Configure Accounting Settings

#### BlueTech Ltd.

1. Go to the client app and click on the "Configuration" tab under "Accounting". Use the profile of "BlueTech Ltd." to configure the accounting settings.

2. Add the following configurations:

| Event          | Debit Account               | Credit Account                 | Amount Field   |
|----------------|-----------------------------|--------------------------------|----------------|
| OrderConfirmed | Inventory (BlockTEA)        | Accounts Payable (BlockTEA)    | totalAmount    |
| InvoicePaid    | Accounts Payable (BlockTEA) | Cash (BlockTEA)                | amount         |
| CreateAsset    | Fabric Asset                | Opening Balance (Fabric Asset) | appraisedValue |
| TransferAsset  | Cash (BlockTEA)             | Fabric Asset                   | appraisedValue |
| IssueIOU       | Loan Receivable (IOU)       | Cash (BlockTEA)                | amount         |

#### GreenSolutions Inc.

1. Go to the client app and click on the "Configuration" tab under "Accounting". Use the profile of "GreenSolutions Inc." to configure the accounting settings.

2. Add the following configurations:

| Event          | Debit Account                  | Credit Account     | Amount Field   |
|----------------|--------------------------------|--------------------|----------------|
| OrderConfirmed | Accounts Receivable (BlockTEA) | Revenue (BlockTEA) | totalAmount    |
| InvoicePaid    | Revenue (BlockTEA)             | Ether              | amount         |
| TransferAsset  | Fabric Asset                   | Cash (BlockTEA)    | appraisedValue |
| IssueIOU       | Cash (BlockTEA)                | Loan Payable (IOU) | amount         |

### Purchase Order

1. Go to the client app and click on the "Purchase Order" tab. Use the profile of "BlueTech Ltd." to create a purchase order for "GreenSolutions Inc.". By default, the addresses for BlueTech is 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 and 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 for GreenSolutions.

2. A `NewOrder` event will be emitted. And you can check this in the "Event Stream" tab. Since we didn't configure the accounting for this event, nothing will be recorded in the AIS.

3. Use the profile of "GreenSolutions Inc." to confirm the purchase order. A `OrderConfirmed` event will be emitted. The accounting settings will be used to record the event in the AIS. Go to the AIS for both companies to check it. A link is provided under the "Accounting" tab.

4. Use the profile of "GreenSolutions Inc." to create an invoice for the purchase order. A `InvoiceCreated` event will be emitted. Since we didn't configure the accounting for this event, nothing will be recorded in the AIS.

5. Use the profile of "BlueTech Ltd." to pay the invoice. A `InvoicePaid` event will be emitted. The accounting settings will be used to record the event in the AIS. Go to the AIS for both companies to check it. A link is provided under the "Accounting" tab.

### Asset Transfer

1. Go to the client app and click on the "Asset Transfer" tab. Use the profile of "BlueTech Ltd." to create an asset transfer for "GreenSolutions Inc.". 

2. A `CreateAsset` event will be emitted. BlueTech will record the asset in the AIS. GreenSolutions will not since it is not configured.

3. Trigger the transfer by clicking on the `transfer` action of the newly created asset. A `TransferAsset` event will be emitted. Both parties will account for this event as configured.

### IOU

1. Go to the client app and click on the "IOU" tab. Use the profile of "BlueTech Ltd." to create an IOU for "GreenSolutions Inc.".

2. An `IssueIOU` event will be emitted. Both parties will account for the event.

3. Use the profile of "GreenSolutions Inc." to pay the IOU. A `Settle` event will be emitted. Both parties will account for the event.

## Work in Progress

Handle other events and allow more complex configurations.
