import requests
import configparser

class whoop_module:

    def __init__(self, auth_code = None, whoop_id = None):
        self.auth_code = auth_code
        self.whoop_id = whoop_id

    def authorize(self, user_ini):
        config = configparser.ConfigParser()
        config.read(user_ini)
        username = config['whoop']['username']
        password = config['whoop']['password']


        headers = {
                "username": username,
                "password": password,
                "grant_type": "password",
                "issueRefresh": False}
        auth = requests.post("https://api-7.whoop.com/oauth/token", json = headers)

        if auth.status_code == 200:
            content = auth.json()
            user_id = content['user']['id']
            token = content['access_token']
            self.whoop_id = user_id
            self.auth_code = 'bearer ' + token
            print("Authentication successful")

        else:
            print("Authentication failed")