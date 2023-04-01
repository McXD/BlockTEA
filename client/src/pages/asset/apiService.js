import axios from 'axios';

const API_URL = 'http://localhost:3001';

export async function createAsset(asset) {
    const { assetId, assetName, color, size, owner } = asset;
    const appraisedValue = '0'; // Adjust as needed

    await axios.post(`${API_URL}/createAsset`, {
        assetID: assetId,
        color,
        size,
        owner,
        appraisedValue
    });
}

export async function transferAsset( assetId, newOwner) {
    await axios.post(`${API_URL}/transferAsset`, {
        assetID: assetId,
        newOwner
    });
}

export async function readAssets() {
    const response = await axios.get(`${API_URL}/readAllAssets`);
    return response.data;
}

export async function readAsset(id) {
    const response = await axios.get(`${API_URL}/readAsset`, {
        params: { id }
    });
    return response.data;
}

export async function updateAsset(assetId, asset) {
    const { ID, Color, Size, Owner, AppraisedValue } = asset;
    console.log("asset", asset);

    await axios.post(`${API_URL}/updateAsset`, {
        assetID: ID,
        color: Color,
        size: Size,
        owner: Owner,
        appraisedValue: AppraisedValue
    });
}
