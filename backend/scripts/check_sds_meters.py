import requests
import base64
import json

KEY = "2bc8f5eaae344c46814190bffd40060d"
SECRET = "0iIxVYcz5lH8sTjl6c6B89uvyQ4qyl2bojRPv155onzqkqpANt6culpITUBldR8a"
BASE = "https://hp-sds-latam.insightportal.net/PortalAPI"

creds = base64.b64encode((KEY + ":" + SECRET).encode()).decode()
r = requests.post(BASE + "/login", headers={"Authorization": "Basic " + creds})
token = "Bearer " + r.json()["access_token"]

# Usar el cliente Adium (id=8924) como prueba, fecha actual
import datetime

max_date = datetime.datetime.now().strftime("%Y-%m-%dT23:59:59")

r2 = requests.get(
    BASE + "/api/devices/meters/latestbydate/8924",
    headers={"Authorization": token},
    params={"maxReadDateTimeLocal": max_date, "includeExtendedMeters": "true"},
)
data = r2.json()
print("Status:", r2.status_code)
print("Type:", type(data))
if isinstance(data, list) and len(data) > 0:
    print("Total devices:", len(data))
    print("First device all fields:")
    print(json.dumps(data[0], indent=2))
    print("--- Second device ---")
    if len(data) > 1:
        print(json.dumps(data[1], indent=2))
else:
    print("Response:", r2.text[:500])
