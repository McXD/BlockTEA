def process_event(event, web3_env, contract_abi_map):
    """
    Process an event with the given web3 environment and contract ABI map.

    :param event: A dictionary containing the event data.
    :param web3_env: A Web3 instance connected to the Ethereum network.
    :param contract_abi_map: A dictionary mapping contract names to their respective ABIs.
    """
    # Log the event data
    print(f"Sample callback processing event: {event}")

    # You can access the contract_abi_map to perform contract-related operations.
    # Depending on the event data, you can determine which contract ABI to use.
    # Example:
    contract_name = "PurchaseOrder"  # Replace this with logic to determine the appropriate contract name.
    contract_abi = contract_abi_map.get(contract_name)

    if contract_abi:
        # Check if the event is of interest: "NewOrder"
        if event["event"] == "NewOrder":
            buyer = event["args"]["buyer"]
            seller = event["args"]["seller"]
            order_id = event["args"]["orderId"]

            print(f"New order detected: Buyer: {buyer}, Seller: {seller}, Order ID: {order_id}")
    else:
        print(f"No ABI found for contract name '{contract_name}'")

    # Add your custom logic for processing the event here
