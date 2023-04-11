# create_journal_entry.py

import requests
from quickbooks_auth import get_access_token, realm_id
import pika
import json
from datetime import datetime



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

    # Print the response JSON
    return response_json['JournalEntry']['Id']


# Set up the RabbitMQ connection and channel
credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
connection = pika.BlockingConnection(
    pika.ConnectionParameters(host=rabbitmq_host, port=rabbitmq_port, credentials=credentials))
channel = connection.channel()

# Declare the exchange and queue
channel.exchange_declare(exchange='blockchain-events', exchange_type='fanout')
channel.queue_declare(queue='qb_accounting', durable=True)

# Bind the queue to the exchange
channel.queue_bind(exchange='blockchain-events', queue='qb_accounting')

with open('config.json', 'r') as config_file:
    config = json.load(config_file)


# Define the callback function for handling messages
def handle_message(ch, method, properties, body):
    try:
        event = json.loads(body)

        event_origin = event['origin']
        event_name = event['name']

        if event_origin not in config or event_name not in config[event_origin]:
            return

        print(f"Received event {event_name} from {event_origin} with transaction ID {event['transactionId']}.")

        amount = event['payload'][config[event_origin][event_name]['amountField']]
        txHash = event['transactionId']
        eventName = event_name
        date = datetime.now().date().isoformat()
        debitAccountId = config[event_origin][event_name]['debitAccountId']
        creditAccountId = config[event_origin][event_name]['creditAccountId']
        namePrefix = event_origin

        journal_entry_id = createJournalEntry(amount, txHash, eventName, date, debitAccountId, creditAccountId, namePrefix)
        print(f"Created journal entry with ID {journal_entry_id} for event {eventName} with transaction ID {txHash}.")
    except Exception as error:
        print("Error processing event:", error)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)


# Set up the consumer
channel.basic_consume(queue='qb_accounting', on_message_callback=handle_message, auto_ack=True)

# Start consuming messages
print('Listening for blockchain events...')
channel.start_consuming()
