import axios from 'axios';

export async function createAsset(baseUrl, asset) {
    const { assetID, color, size, owner, appraisedValue } = asset;

    await axios.post(`${baseUrl}/createAsset`, {
        assetID,
        color,
        size,
        owner,
        appraisedValue
    });
}

export async function transferAsset(baseUrl, assetId, newOwner) {
    await axios.post(`${baseUrl}/transferAsset`, {
        assetID: assetId,
        newOwner
    });
}

export async function readAssets(baseUrl) {
    const response = await axios.get(`${baseUrl}/readAllAssets`);
    return response.data;
}

export async function readAsset(baseUrl, id) {
    const response = await axios.get(`${baseUrl}/readAsset`, {
        params: { id }
    });
    return response.data;
}

export async function updateAsset(baseUrl, assetId, asset) {
    const { ID, Color, Size, Owner, AppraisedValue } = asset;
    console.log("asset", asset);

    await axios.post(`${baseUrl}/updateAsset`, {
        assetID: ID,
        color: Color,
        size: Size,
        owner: Owner,
        appraisedValue: AppraisedValue
    });
}
