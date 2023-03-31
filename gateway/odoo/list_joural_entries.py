import xmlrpc.client

# Connect to the Odoo instance using XML-RPC
url = 'http://172.20.67.63:8069/'
db = 'demo'
username = 'fyl155165@gmail.com'
password = 'fyl200165'

common = xmlrpc.client.ServerProxy('{}/xmlrpc/2/common'.format(url))
uid = common.authenticate(db, username, password, {})

models = xmlrpc.client.ServerProxy('{}/xmlrpc/2/object'.format(url))
accounts = models.execute_kw(db, uid, password, 'account.account', 'search_read', [
                             []], {'fields': ['id', 'name']})

print('List of accounts:')
for account in accounts:
    print(account)
