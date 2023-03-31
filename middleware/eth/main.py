import os
import json
import time
import importlib
from web3 import Web3
from pymongo import MongoClient

# Connect to the Ethereum network
NETWORK_URL = 'http://127.0.0.1:8545'  # Replace with your local network URL
w3 = Web3(Web3.HTTPProvider(NETWORK_URL))

# Connect to the MongoDB database
client = MongoClient('mongodb://localhost:27017/')
db = client['ethereum_events']
event_collection = db['events']

# Load contract ABIs and deployed addresses
ABI_DIR = 'ABIs'
ADDRESS_DIR = 'addresses'
contract_abi_map = {}
contract_address_map = {}

for file in os.listdir(ABI_DIR):
    if file.endswith('.json'):
        contract_name = file[:-5]  # Remove the '.json' extension
        with open(os.path.join(ABI_DIR, file)) as f:
            contract_abi_map[contract_name] = json.load(f)

for file in os.listdir(ADDRESS_DIR):
    if file.endswith('.json'):
        contract_name = file[:-5]  # Remove the '.json' extension
        with open(os.path.join(ADDRESS_DIR, file)) as f:
            contract_address_map[contract_name] = json.load(f)


# Load callback modules from the callbacks directory
def load_callback_functions(callbacks_dir):
    callback_functions = []

    for file in os.listdir(callbacks_dir):
        if file.endswith('.py') and not file.startswith('__'):
            module_name = file[:-3]  # Remove the '.py' extension
            module = importlib.import_module(f"callbacks.{module_name}")
            callback_functions.append(module.process_event)

    return callback_functions


def create_event_filters(start_block, contract_abi_map, contract_address_map):
    event_filters = {}

    for contract_name in contract_abi_map.keys():
        contract_address = contract_address_map[contract_name]
        contract_abi = contract_abi_map[contract_name]
        my_contract = w3.eth.contract(address=contract_address, abi=contract_abi)
        for item in contract_abi:
            if item.get('type') == 'event':
                event_name = item['name']
                event_filter = my_contract.events[event_name].create_filter(fromBlock=start_block)
                event_filters[f"{contract_name}.{event_name}"] = event_filter

    return event_filters


def get_last_processed_block_number(db):
    last_block_collection = db['last_block']
    last_block_entry = last_block_collection.find_one()

    if last_block_entry:
        return last_block_entry['number']
    else:
        # use the genesis block as the starting point
        # save it to the database
        last_block_collection.insert_one({'number': 0})
        return 0


def poll_events():
    start_block = get_last_processed_block_number(db)
    print(f"Starting from block {start_block}...")
    event_filters = create_event_filters(start_block, contract_abi_map, contract_address_map)
    callback_functions = load_callback_functions('callbacks')

    while True:
        end_block = w3.eth.block_number
        if start_block >= end_block:
            time.sleep(10)
            continue

        for event_key, event_filter in event_filters.items():
            event_filter.filter_params["fromBlock"] = start_block
            event_filter.filter_params["toBlock"] = end_block
            raw_events = event_filter.get_all_entries()
            events = []
            for raw_event in raw_events:
                event = {
                    "logIndex": raw_event["logIndex"],
                    "transactionIndex": raw_event["transactionIndex"],
                    "transactionHash": raw_event["transactionHash"].hex(),
                    "blockHash": raw_event["blockHash"].hex(),
                    "blockNumber": raw_event["blockNumber"],
                    "address": raw_event["address"],
                    "args": raw_event["args"],
                    "event": raw_event["event"],
                }
                events.append(event)

            for event in events:
                # Check if the event already exists in the database
                existing_event = event_collection.find_one({
                    "transactionHash": event["transactionHash"],
                    "logIndex": event["logIndex"],
                    "blockNumber": event["blockNumber"]
                })

                if existing_event is None:
                    # Register the event in the MongoDB database
                    event_id = event_collection.insert_one(event).inserted_id
                    print(f"Registered event with ID: {event_id}")

                    # Call all the callback functions
                    for callback_function in callback_functions:
                        callback_function(event, w3, contract_abi_map)

        # Update the last processed block number in the database
        db['last_block'].update_one({}, {'$set': {'number': end_block}})

        start_block = end_block + 1
        time.sleep(10)  # Poll every 10 seconds


if __name__ == "__main__":
    print("Starting event listener...")
    poll_events()
