import requests
import pika
import json
from datetime import datetime
import pymongo

# Replace with your MongoDB connection string
mongo_uri = "mongodb://localhost:27017/blocktea?replicaSet=rs0"

client = pymongo.MongoClient(mongo_uri)

def get_configurations_by_vendor(vendor):
    db = client["blocktea"]  # Replace with your database name
    configurations_collection = db["configurations"]  # Replace with your configurations collection name

    # Fetch all configurations with the specified vendor
    configurations = configurations_collection.find({"vendor": vendor})

    # Organize the configurations into a dictionary with the event as key
    configurations_map = {config['event']: config for config in configurations}

    return configurations_map


client_id = 'ABjMlQwTPCYsCyHyO5doeT68Jyu808k8D2Q7tkOfxShLDUxBAC'
client_secret = 'QeaLW96fisKQldOQE2r2f5z746SFq38n27pYSBjR'
refresh_token = 'AB11689923931kYF8osGla5CX6q80BVPyvmsoRcTjJ2NmoWTXB'
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


rabbitmq_host = 'localhost'
rabbitmq_port = 5672
rabbitmq_user = 'guest'
rabbitmq_password = 'guest'


def createJournalEntry(amount, txHash, eventName, date, debitAccountId, creditAccountId, namePrefix):
    # Refresh the access token (do this when the access token is expired)
    access_token = get_access_token()

    # Create a new journal entry
    url = f'https://sandbox-quickbooks.api.intuit.com/v3/company/{realm_id}/journalentry?minorversion=65'
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }

    # Journal entry data
    journal_entry_data = {
        "TxnDate": date,
        "Line": [
            {
                "Id": "1",
                "Description": f"{namePrefix} - {eventName} - {txHash}",
                "Amount": amount,
                "DetailType": "JournalEntryLineDetail",
                "JournalEntryLineDetail": {
                    "PostingType": "Debit",
                    "AccountRef": {
                        "value": debitAccountId
                    }
                }
            },
            {
                "Id": "2",
                "Description": f"{namePrefix} - {eventName} - {txHash}",
                "Amount": amount,
                "DetailType": "JournalEntryLineDetail",
                "JournalEntryLineDetail": {
                    "PostingType": "Credit",
                    "AccountRef": {
                        "value": creditAccountId
                    }
                }
            }
        ]
    }

    response = requests.post(url, headers=headers, json=journal_entry_data)
    response_json = response.json()
    print(response_json)

    return response_json['JournalEntry']['Id']


# Set up the RabbitMQ connection and channel
credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host=rabbitmq_host, port=rabbitmq_port, credentials=credentials))
channel = connection.channel()

# Declare the exchange and queue
channel.exchange_declare(exchange='blockchain-events', exchange_type='fanout')
channel.queue_declare(queue='quickbooks', durable=True)

# Bind the queue to the exchange
channel.queue_bind(exchange='blockchain-events', queue='quickbooks')

# Define the callback function for handling messages
def handle_message(ch, method, properties, body):
        try:
            event = json.loads(body)
            event_origin = event['origin']
            event_name = event['name']
            config = get_configurations_by_vendor("quickbooks")

            if event_name not in config:
                return

            print(f"Received event {event_name} from {event_origin} with transaction ID {event['transactionId']}.")

            amount = int(event['payload'][config[event_name]['amountField']])
            txHash = event['transactionId']
            eventName = event_name
            date = datetime.now().date().isoformat()
            debitAccountId = config[event_name]['debitAccount']['Id']
            creditAccountId = config[event_name]['creditAccount']['Id']
            namePrefix = event_origin

            journal_entry_id = createJournalEntry(amount, txHash, eventName, date, debitAccountId, creditAccountId, namePrefix)
            print(f"Created journal entry with ID {journal_entry_id} for event {eventName} with transaction ID {txHash}.")
        except Exception as error:
            print(f"Error processing event with delivery tag {method.delivery_tag}: {error}")
            print(f"Event data: {body}")
            # print the stack trace
            import traceback
            traceback.print_exc()
            ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


# Set up the consumer
channel.basic_consume(queue='quickbooks', on_message_callback=handle_message, auto_ack=False)

# Start consuming messages
print('Listening for blockchain events...')
channel.start_consuming()
