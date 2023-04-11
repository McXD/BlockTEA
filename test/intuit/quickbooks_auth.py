import requests


client_id = 'ABjMlQwTPCYsCyHyO5doeT68Jyu808k8D2Q7tkOfxShLDUxBAC'
client_secret = 'QeaLW96fisKQldOQE2r2f5z746SFq38n27pYSBjR'
refresh_token = 'AB11689237844CFNSQT8MWdY4i4F8ypHnwKIgAp3NckavH5XTF'
realm_id = '4620816365289145750'


def get_access_token():
    url = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer'
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
    }
    data = {
        'grant_type': 'refresh_token',
        'client_id': client_id,
        'client_secret': client_secret,
        'refresh_token': refresh_token
    }

    response = requests.post(url, headers=headers, data=data)
    response_json = response.json()

    if 'access_token' in response_json:
        return response_json['access_token']
    else:
        return None
