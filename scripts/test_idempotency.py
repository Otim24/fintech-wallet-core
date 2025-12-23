import os
import sys
import django
import uuid
import json
from decimal import Decimal

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.ledger.models import LedgerAccount, Transaction, IdempotencyKey

User = get_user_model()

def run():
    print("--- Starting Idempotency Verification ---")
    
    # Setup
    email = "idempotency_tester@example.com"
    user, created = User.objects.get_or_create(email=email)
    if created:
        user.set_password("password123")
        user.save()
        
    client = APIClient()
    client.force_authenticate(user=user)
    
    cash, _ = LedgerAccount.objects.get_or_create(name="Idempotency Cash", type=LedgerAccount.Type.ASSET, user=user)
    income, _ = LedgerAccount.objects.get_or_create(name="Idempotency Income", type=LedgerAccount.Type.INCOME, user=user)
    
    # 1. First Request
    key = str(uuid.uuid4())
    headers = {'HTTP_IDEMPOTENCY_KEY': key} # APIClient expects HTTP_ prefixes for headers
    
    payload = {
        "description": "Idempotent Transaction",
        "entries": [
            {"account_id": str(cash.id), "amount": "50.00", "type": "DEBIT"},
            {"account_id": str(income.id), "amount": "50.00", "type": "CREDIT"}
        ]
    }
    
    print(f"Sending Request 1 (Key: {key})...")
    resp1 = client.post('/api/ledger/transactions/', payload, format='json', **headers)
    
    if resp1.status_code != 201:
        print(f"FAILED Request 1: {resp1.status_code} {resp1.data}")
        return

    txn_id_1 = resp1.data['id']
    print(f"Success 1. Txn ID: {txn_id_1}")
    
    # 2. Second Request (Same Key)
    print("Sending Request 2 (Same Key)...")
    resp2 = client.post('/api/ledger/transactions/', payload, format='json', **headers)
    
    if resp2.status_code != 201:
        print(f"FAILED Request 2: {resp2.status_code} {resp2.data}")
        return
        
    txn_id_2 = resp2.data['id']
    print(f"Success 2. Txn ID: {txn_id_2}")
    
    # 3. Verification
    if txn_id_1 == txn_id_2:
        print("SUCCESS: Transaction IDs match (Cached Response Returned).")
    else:
        print("FAILURE: New Transaction created despite Idempotency Key!")
        
    # 4. DB Check
    count = Transaction.objects.filter(id=txn_id_1).count()
    print(f"DB Count for ID: {count}")
    
    total_txns = Transaction.objects.filter(description="Idempotent Transaction").count()
    print(f"Total 'Idempotent Transaction' count: {total_txns}")
    
    if total_txns == 1:
        print("SUCCESS: Only 1 transaction exists in DB.")
    else:
        print(f"FAILURE: {total_txns} transactions found!")

if __name__ == '__main__':
    run()
