import urllib.request
import json
import time

data = json.dumps({
    'question': 'Should I redeem?',
    'use_sample_data': True,
    'provider': 'gemini'
}).encode()

req = urllib.request.Request(
    'http://localhost:8000/analyze/stream',
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as res:
        for line in res:
            print(line.decode().strip())
except Exception as e:
    print("Error:", e)
