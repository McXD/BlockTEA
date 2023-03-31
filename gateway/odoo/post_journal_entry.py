import xmlrpc.client

# Connect to the Odoo instance using XML-RPC
url = 'http://172.20.67.63:8069/'
db = 'demo'
username = 'fyl155165@gmail.com'
password = 'fyl200165'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

# Retrieve the IDs of the accounts to use in the journal entry
account_sale_id = models.execute_kw(db, uid, password, 'account.account', 'search', [
                                    [['name', '=', 'Product Sales']]], {'limit': 1})[0]
account_tax_id = models.execute_kw(db, uid, password, 'account.account', 'search', [
                                   [['name', '=', 'Tax Paid']]], {'limit': 1})[0]
account_revenue_id = models.execute_kw(db, uid, password, 'account.account', 'search', [
                                       [['name', '=', 'Undistributed Profits/Losses']]], {'limit': 1})[0]

# Create the journal entry
journal_entry_id = models.execute_kw(db, uid, password, 'account.move', 'create', [{
    'journal_id': 1,
    'date': '2022-03-31',
    'line_ids': [
        (0, 0, {
            'account_id': account_sale_id,
            'name': 'Sale of product',
            'debit': 100.00,
            'credit': 0.00,
        }),
        (0, 0, {
            'account_id': account_tax_id,
            'name': 'Tax on sale',
            'debit': 0.00,
            'credit': 10.00,
        }),
        (0, 0, {
            'account_id': account_revenue_id,
            'name': 'Revenue from sale',
            'debit': 0.00,
            'credit': 90.00,
        }),
    ],
}])

print('Journal entry created with ID:', journal_entry_id)

models.execute_kw(db, uid, password, 'account.move', 'write',
                  [[journal_entry_id], {'state': 'posted'}])



print('Journal entry posted: ', journal_entry_id)

journal_entries = models.execute_kw(
    db, uid, password, 'account.move', 'search_read', [[]], {'fields': ['name', 'date', 'state']})
print('List of journal entries:')
for entry in journal_entries:
    print(entry)
