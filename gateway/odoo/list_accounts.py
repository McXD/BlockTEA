import xmlrpc.client

# Connect to the Odoo instance using XML-RPC
url = 'http://172.20.67.63:8069/'
db = 'demo'
username = 'fyl155165@gmail.com'
password = 'fyl200165'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))
journal_entries = models.execute_kw(db, uid, password, 'account.move', 'search_read', [
                                    []], {'fields': ['name', 'date', 'ref', 'state', 'invoice_line_ids']})

print('List of journal entries:')
for entry in journal_entries:
    print(entry)
