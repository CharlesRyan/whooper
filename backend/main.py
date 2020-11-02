from whoop_module import whoop_module

cred_path = 'backend/creds.ini'

whoop = whoop_module()
whoop.authorize(cred_path)
print(whoop.get_all_data())