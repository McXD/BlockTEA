const processEvent = async (event, network, contracts) => {
    const ret = await contracts["asset-transfer-events"].evaluateTransaction("ReadAsset", "asset1")
    console.log(event);
    console.log(ret)
    console.log(await network.getName())
};

module.exports = {
    processEvent: processEvent,
};
