import requests
import base64

KEY = "2bc8f5eaae344c46814190bffd40060d"
SECRET = "0iIxVYcz5lH8sTjl6c6B89uvyQ4qyl2bojRPv155onzqkqpANt6culpITUBldR8a"
BASE = "https://hp-sds-latam.insightportal.net/PortalAPI"

# Login
creds = base64.b64encode((KEY + ":" + SECRET).encode()).decode()
r = requests.post(BASE + "/login", headers={"Authorization": "Basic " + creds})
data = r.json()
print("login keys:", list(data.keys()))
token = data.get("access_token") or data.get("token")
bearer = "Bearer " + token

# Get ALL customers
r2 = requests.get(BASE + "/api/customers", headers={"Authorization": bearer})
customers = r2.json()
count = len(customers) if isinstance(customers, list) else -1
print("Total customers:", count)
if isinstance(customers, list) and count > 0:
    print("Fields:", list(customers[0].keys()))
    print("--- First 10 ---")
    for c in customers[:10]:
        cid = c.get("customerId")
        name = c.get("name")
        status = c.get("status") or c.get("active") or c.get("enabled") or "N/A"
        print("id=" + str(cid) + " name=" + str(name) + " status=" + str(status))
    print("--- Searching ISSN ---")
    issn = [c for c in customers if "ISSN" in str(c.get("name", ""))]
    print("ISSN matches:", issn)
    print("--- All field values for first customer ---")
    print(customers[0])
