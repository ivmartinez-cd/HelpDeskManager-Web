import requests, base64, json

KEY = '2bc8f5eaae344c46814190bffd40060d'
SECRET = '0iIxVYcz5lH8sTjl6c6B89uvyQ4qyl2bojRPv155onzqkqpANt6culpITUBldR8a'
BASE = 'https://hp-sds-latam.insightportal.net/PortalAPI'

creds = base64.b64encode((KEY + ':' + SECRET).encode()).decode()
r = requests.post(BASE + '/login', headers={'Authorization': 'Basic ' + creds})
token = 'Bearer ' + r.json()['access_token']

# Try GET /api/devices/{customerId} to get device list with serial numbers
print('=== Testing /api/devices/{customerId} ===')
r2 = requests.get(BASE + '/api/devices/8924', headers={'Authorization': token})
print('Status:', r2.status_code)
if r2.status_code == 200:
    data = r2.json()
    print('Type:', type(data))
    if isinstance(data, list) and len(data) > 0:
        print('First device fields:', list(data[0].keys()))
        print('First device:', json.dumps(data[0], indent=2))
    else:
        print('Response:', str(data)[:500])
else:
    print('Body:', r2.text[:300])

# Try /api/devices?customerId=...
print('\n=== Testing /api/devices?customerId=8924 ===')
r3 = requests.get(BASE + '/api/devices', headers={'Authorization': token}, params={'customerId': 8924})
print('Status:', r3.status_code)
if r3.status_code == 200:
    data3 = r3.json()
    if isinstance(data3, list) and len(data3) > 0:
        print('First device fields:', list(data3[0].keys()))
        print('First:', json.dumps(data3[0], indent=2))
    else:
        print(str(data3)[:500])
else:
    print('Body:', r3.text[:300])
