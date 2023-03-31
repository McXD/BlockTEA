import datetime
import xmlrpc.client

# Connect to the Odoo instance using XML-RPC
url = 'http://172.20.67.63:8069/'
db = 'demo'
username = 'fyl155165@gmail.com'
password = 'fyl200165'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))


def get_or_create_account(name, user_type_name, code):
    account_id = models.execute_kw(db, uid, password, 'account.account', 'search', [
        [['name', '=', name]]], {'limit': 1})

    if not account_id:
        user_type_id = models.execute_kw(db, uid, password, 'account.account.type', 'search', [
            [['name', '=', user_type_name]]], {'limit': 1})

        if not user_type_id:
            raise ValueError(f"Account type '{user_type_name}' not found.")

        account_id = models.execute_kw(db, uid, password, 'account.account', 'create', [{
            'name': name,
            'code': code,
            'user_type_id': user_type_id[0],
            'reconcile': True,
        }])

    return account_id[0]


account_purchase_orders_id = get_or_create_account('Purchase of Equipments', 'Current Liabilities', 2100)
account_accounts_payable_id = get_or_create_account('Account Payable', 'Current Liabilities', 2000)
account_ether_id = get_or_create_account('Ethers', 'Current Assets', 1000)


def create_journal_entry(event, amount, date, tx_hash):
    account_mappings = {
        'OrderConfirmed': (account_purchase_orders_id, account_accounts_payable_id),
        'InvoicePaid': (account_accounts_payable_id, account_ether_id),
    }

    debit_account_id, credit_account_id = account_mappings[event]

    journal_entry_id = models.execute_kw(db, uid, password, 'account.move', 'create', [{
        'journal_id': 1,
        'date': date,
        'ref': tx_hash,
        'line_ids': [
            (0, 0, {
                'account_id': debit_account_id,
                'name': f'ETH: {event} - Debit',
                'debit': amount,
                'credit': 0.00,
            }),
            (0, 0, {
                'account_id': credit_account_id,
                'name': f'ETH: {event} - Credit',
                'debit': 0.00,
                'credit': amount,
            }),
        ],
    }])

    # Post the journal entry
    models.execute_kw(db, uid, password, 'account.move', 'write',
                      [[journal_entry_id], {'state': 'posted'}])

    return journal_entry_id


def process_event(event, web3_env, contract_abi_map, contract_address_map):
    """
    Process an event with the given web3 environment and contract ABI map.

    :param event: A dictionary containing the event data.
    :param web3_env: A Web3 instance connected to the Ethereum network.
    :param contract_abi_map: A dictionary mapping contract names to their respective ABIs.
    :param contract_address_map: A dictionary mapping contract names to their respective addresses.
    """
    # Determine the appropriate contract name
    contract_name = "PurchaseOrder"
    contract_abi = contract_abi_map.get(contract_name)

    if contract_abi:
        contract_address = contract_address_map[contract_name]
        contract = web3_env.eth.contract(address=contract_address, abi=contract_abi)
        tx_hash = event['transactionHash']
        date = web3_env.eth.get_block(event['blockNumber']).timestamp
        date = datetime.datetime.fromtimestamp(date).strftime('%Y-%m-%d')

        if event["event"] == "OrderConfirmed":
            order_id = event["args"]["orderId"]

            # Call the getOrderDetails function with the orderId
            order_details = contract.functions.getOrder(order_id).call()

            # Assume the getOrderDetails function returns a tuple (amount, date, tx_hash)
            amount = order_details[3] * order_details[4]

            # Call the create_journal_entry function with the obtained data
            journal_entry_id = create_journal_entry('OrderConfirmed', amount, date, tx_hash)
            print(f"Journal entry created with ID: {journal_entry_id}")
        # if event['event'] == "InvoiceCreated":
        #     invoice_id = event['args']['invoiceId']
        #     invoice_details = contract.functions.invoices(invoice_id).call()
        #     amount = invoice_details[2]
        #
        #     journal_entry_id = create_journal_entry('InvoiceCreated', amount, date, tx_hash)
        #     print(f"Journal entry created with ID: {journal_entry_id}")
        if event['event'] == "InvoicePaid":
            invoice_id = event['args']['invoiceId']
            invoice_details = contract.functions.invoices(invoice_id).call()
            amount = invoice_details[2]

            journal_entry_id = create_journal_entry('InvoicePaid', amount, date, tx_hash)
            print(f"Journal entry created with ID: {journal_entry_id}")
    else:
        print(f"No ABI found for contract name '{contract_name}'")
