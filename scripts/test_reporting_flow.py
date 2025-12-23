import os
import sys
import django
from decimal import Decimal
import json

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.ledger.models import LedgerAccount, Transaction, JournalEntry

User = get_user_model()

def run():
    print("--- Starting Reporting Flow Verification ---")
    
    # 1. Setup Data
    email = "reporting_user@example.com"
    user, created = User.objects.get_or_create(email=email)
    if created:
        user.set_password("password123")
        user.save()
    
    client = APIClient()
    client.force_authenticate(user=user)

    # Create Accounts
    cash, _ = LedgerAccount.objects.get_or_create(name="Cash Report", type=LedgerAccount.Type.ASSET, user=user)
    sales, _ = LedgerAccount.objects.get_or_create(name="Sales Report", type=LedgerAccount.Type.INCOME, user=user)
    
    print(f"Cash ID: {cash.id}")

    # Create Transactions (Batch)
    # Clean slate for this specific test pattern
    JournalEntry.objects.filter(account=cash).delete() 
    # This might leave hanging Transactions or unbalanced Ledger if we are not careful, 
    # but for reading test it's fine to just verify the Count.
    # actually, deleting JournalEntries manually might break balance checks later but we just asserted TrialBalance.
    # Better: delete Transactions.
    Transaction.objects.filter(description__startswith="Sale").delete()
    
    url_tx = '/api/ledger/transactions/'
    
    print("Creating Transactions...")
    for i in range(5):
        payload = {
            "reference": f"REF-REPORT-{i+1}",
            "description": f"Sale {i+1}",
            "entries": [
                {"account_id": str(cash.id), "amount": "10.00", "type": "DEBIT"},
                {"account_id": str(sales.id), "amount": "10.00", "type": "CREDIT"}
            ]
        }
        resp = client.post(url_tx, payload, format='json')
        if resp.status_code != 201:
            print(f"Error creating txn {i+1}: {resp.status_code} {resp.data}")

    print("Transactions Created.")

    # 2. Test Trial Balance
    print("\nTesting Trial Balance...")
    url_tb = '/api/ledger/trial-balance/'
    resp_tb = client.get(url_tb)
    
    if resp_tb.status_code == 200:
        data = resp_tb.data
        print(f"Is Balanced: {data['is_balanced']}")
        print(f"Total Debits: {data['total_debits']}")
        print(f"Total Credits: {data['total_credits']}")
        
        if data['is_balanced'] and Decimal(data['total_debits']) > 0:
             print("SUCCESS: Trial Balance Verified.")
        else:
             print(f"FAILED: Trial Balance inconsistent. Data: {data}")
    else:
        print(f"FAILED: Status {resp_tb.status_code}, {resp_tb.data}")

    # 3. Test Account Statement
    print("\nTesting Account Statement (Pagination)...")
    url_stmt = f'/api/ledger/accounts/{cash.id}/statement/?page_size=2'
    resp_stmt = client.get(url_stmt)
    
    if resp_stmt.status_code == 200:
        data = resp_stmt.data
        print(f"Count: {data['count']}")
        print(f"Next: {data['next']}")
        print(f"Results on Page 1: {len(data['results'])}")
        
        if len(data['results']) == 2 and data['next'] is not None:
             print("SUCCESS: Pagination working.")
        else:
             print("FAILED: Pagination logic mismatch.")
             print(data)
    else:
        print(f"FAILED: Status {resp_stmt.status_code}, {resp_stmt.data}")

if __name__ == '__main__':
    run()
