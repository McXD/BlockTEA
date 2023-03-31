import pprint


def process_event(event, web3_env, contract_abi_map, contract_address_map):
    """
    Process an event with the given web3 environment and contract ABI map.

    :param event: A dictionary containing the event data.
    :param web3_env: A Web3 instance connected to the Ethereum network.
    :param contract_abi_map: A dictionary mapping contract names to their respective ABIs.
    """
    # Pretty print the event data (JSON)
    print("Caught event:")
    pprint.pprint(event)
