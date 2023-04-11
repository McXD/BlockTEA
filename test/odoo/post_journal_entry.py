import xmlrpc.client

# Connect to the Odoo instance using XML-RPC
url = 'http://172.20.73.31:8069/'
db = 'demo'
username = 'fyl155165@gmail.com'
password = 'fyl200165'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))

# Create the journal entry
journal_entry_id = models.execute_kw(db, uid, password, 'account.move', 'create', [{
    'journal_id': 1,
    'date': '2022-03-31',
    'ref': 'Test negative amount',
    'line_ids': [
        (0, 0, {
            'account_id': 2,
            'debit': -100.00,
            'credit': 0.00,
        }),
        (0, 0, {
            'account_id': 22,
            'debit': 0.00,
            'credit': -100.00,
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
