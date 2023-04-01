const express = require("express");
const {connect} = require("@hyperledger/fabric-gateway");
const {newGrpcConnection, newIdentity, newSigner} = require("./connect");
const {TextDecoder} = require('util');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const utf8Decoder = new TextDecoder();

async function buildGateway() {
    const client = await newGrpcConnection();
    return connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        evaluateOptions: () => {
            return {deadline: Date.now() + 5000}; // 5 seconds
        },
        endorseOptions: () => {
            return {deadline: Date.now() + 15000}; // 15 seconds
        },
        submitOptions: () => {
            return {deadline: Date.now() + 5000}; // 5 seconds
        },
        commitStatusOptions: () => {
            return {deadline: Date.now() + 60000}; // 1 minute
        },
    });
}

app.post("/createAsset", async (req, res) => {
    const {assetID, color, size, owner, appraisedValue} = req.body;

    try {
        const gateway = await buildGateway();
        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("asset-transfer-events");

        await contract.submitTransaction(
            "CreateAsset",
            assetID,
            color,
            size.toString(),
            owner,
            appraisedValue.toString()
        );
        gateway.close();

        res.status(200).send("Asset created successfully");
    } catch (error) {
        console.trace();
        console.log(error);
        res.status(500).send(`Failed to create asset: ${error}`);
    }
});

app.post("/transferAsset", async (req, res) => {
    const {assetID, newOwner} = req.body;

    try {
        const gateway = await buildGateway();
        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("asset-transfer-events");

        await contract.submitTransaction("TransferAsset", assetID, newOwner);
        gateway.close();

        res.status(200).send("Asset transferred successfully");
    } catch (error) {
        res.status(500).send(`Failed to transfer asset: ${error}`);
    }
});

app.get("/readAsset", async (req, res) => {
    const id = req.query.id;
    try {
        const gateway = await buildGateway();
        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("asset-transfer-events");

        const result = await contract.evaluateTransaction("ReadAsset", id.toString());
        gateway.close();

        const assets = JSON.parse(utf8Decoder.decode(result));
        res.status(200).json(assets);
    } catch (error) {
        console.log(error);
        res.status(500).send(`Failed to read assets: ${error}`);
    }
});

app.get("/readAllAssets", async (req, res) => {
    try {
        const gateway = await buildGateway();
        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("asset-transfer-events");

        const result = await contract.evaluateTransaction("ReadAssets", "", "");
        gateway.close();

        const assets = JSON.parse(utf8Decoder.decode(result));
        res.status(200).json(assets);
    } catch (error) {
        console.log(error);
        res.status(500).send(`Failed to read assets: ${error}`);
    }
});

// update asset
app.post("/updateAsset", async (req, res) => {
    const {assetID, color, size, owner, appraisedValue} = req.body;

    try {
        const gateway = await buildGateway();
        const network = await gateway.getNetwork("mychannel");
        const contract = network.getContract("asset-transfer-events");

        await contract.submitTransaction(
            "UpdateAsset",
            assetID,
            color,
            size.toString(),
            owner,
            appraisedValue.toString()
        );
        gateway.close();

        res.status(200).send("Asset updated successfully");
    } catch (error) {
        console.trace();
        console.log(error);
        res.status(500).send(`Failed to update asset: ${error}`);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
