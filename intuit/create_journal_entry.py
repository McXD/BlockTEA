import requests
from pprint import pprint
import quickbooks_auth as qb_auth

# Refresh the access token (do this when the access token is expired)
access_token = qb_auth.get_access_token()

# Create a new journal entry
url = f'https://sandbox-quickbooks.api.intuit.com/v3/company/{qb_auth.realm_id}/journalentry?minorversion=65'
headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': f'Bearer {access_token}'
}

# Sample journal entry data
journal_entry_data = {
    "Line": [
        {
            "Id": "1",
            "Description": "Sample journal entry",
            "Amount": 100.0,
            "DetailType": "JournalEntryLineDetail",
            "JournalEntryLineDetail": {
                "PostingType": "Debit",
                "AccountRef": {
                    "value": "4"
                }
            }
        },
        {
            "Id": "2",
            "Description": "Sample journal entry",
            "Amount": 100.0,
            "DetailType": "JournalEntryLineDetail",
            "JournalEntryLineDetail": {
                "PostingType": "Credit",
                "AccountRef": {
                    "value": "24"
                }
            }
        }
    ]
}

response = requests.post(url, headers=headers, json=journal_entry_data)
response_json = response.json()

# Print the response JSON
pprint(response_json)