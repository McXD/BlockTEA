const axios = require('axios');

const client_id = 'ABjMlQwTPCYsCyHyO5doeT68Jyu808k8D2Q7tkOfxShLDUxBAC';
const client_secret = 'QeaLW96fisKQldOQE2r2f5z746SFq38n27pYSBjR';
const refresh_token = 'AB116900163421w4Yxp00Pwp66187QJcycAzproDUo7VbKjTk4';
const realm_id = '4620816365289145750';

async function getAccessToken() {
    const url = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    };
    const data = new URLSearchParams({
        grant_type: 'refresh_token',
        client_id,
        client_secret,
        refresh_token,
    });

    try {
        const response = await axios.post(url, data, { headers });
        const responseJson = response.data;

        if (responseJson.access_token) {
            return responseJson.access_token;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching access token:', error);
        return null;
    }
}

const quickbooksConnection = () => {
    const fetchAccounts = async () => {
        const accessToken = await getAccessToken();

        if (!accessToken) {
            throw new Error('Failed to fetch access token');
        }

        const url = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realm_id}/query?query=SELECT%20*%20FROM%20Account`;

        const headers = {
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        };

        try {
            const response = await axios.get(url, { headers });
            return response.data.QueryResponse.Account;
        } catch (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }
    };

    return { fetchAccounts };
};

module.exports = quickbooksConnection;
