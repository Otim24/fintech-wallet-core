import requests
import sys

BASE_URL = "http://localhost:8000"

def get_auth_token():
    # Helper to get a token (assuming we have an auth endpoint or use credentials)
    # Since we don't have a dedicated /api/auth/login endpoint exposed or configured yet in the task list
    # (Checking task list: we have CustomUser but no DRF Auth Views explicitly listed as created)
    # We will assume we can use Basic Auth or Session for this script if we were logged in,
    # OR we can create a user programmatically if running via `manage.py shell`.
    
    # Since this is an external script, we need an API endpoint for token.
    # If not present, we will run this script as a management command or inside `manage.py shell` 
    # but the goal is to test the API endpoint.
    
    # Let's assume we use Basic Authentication for simplicity if configured, or we need to create a token.
    # Given the state, we haven't set up Djoser or SimpleJWT.
    # I'll write this script to run *internally* via `python manage.py shell` to bypass auth for setup, 
    # then use `Client` from `django.test` to simulate API calls. This is more robust.
    pass

# We will create a standalone Django script
code = """
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.ledger.models import LedgerAccount, Transaction, JournalEntry

User = get_user_model()

def run():
    print("--- Starting Ledger Flow Verification ---")
    
    # 1. Setup User
    email = "testuser@example.com"
    user, created = User.objects.get_or_create(email=email)
    if created:
        user.set_password("password123")
        user.save()
    print(f"User: {user.email}")

    # 2. Setup Accounts
    assets, _ = LedgerAccount.objects.get_or_create(name="Cash", type=LedgerAccount.Type.ASSET, user=user)
    revenue, _ = LedgerAccount.objects.get_or_create(name="Sales Revenue", type=LedgerAccount.Type.INCOME, user=user)
    
    print(f"Asset Account ID: {assets.id} (Balance: {assets.balance})")
    print(f"Revenue Account ID: {revenue.id} (Balance: {revenue.balance})")
    
    initial_asset_balance = assets.balance
    initial_revenue_balance = revenue.balance

    # 3. Test API Endpoint
    client = APIClient()
    client.force_authenticate(user=user)
    
    url = '/api/ledger/transactions/'
    payload = {
        "description": "Sale of Goods",
        "entries": [
            {
                "account_id": str(assets.id),
                "amount": "100.00",
                "type": "DEBIT"
            },
            {
                "account_id": str(revenue.id),
                "amount": "100.00",
                "type": "CREDIT"
            }
        ]
    }
    
    print(f"Sending POST to {url}...")
    response = client.post(url, payload, format='json')
    
    if response.status_code == 201:
        print("SUCCESS: Transaction Created")
        print(response.data)
        
        # 4. Verify Balances Refreshed
        assets.refresh_from_db()
        revenue.refresh_from_db()
        
        print(f"New Asset Balance: {assets.balance} (Expected: {initial_asset_balance + Decimal('100.00')})")
        print(f"New Revenue Balance: {revenue.balance} (Expected: {initial_revenue_balance + Decimal('100.00')})")
        
        if assets.balance == initial_asset_balance + Decimal('100.00') and \
           revenue.balance == initial_revenue_balance + Decimal('100.00'):
            print("VERIFICATION PASSED: Balances updated correctly.")
        else:
            print("VERIFICATION FAILED: Balances incorrect.")
            
    else:
        print(f"FAILED: {response.status_code}")
        print(response.data)

if __name__ == '__main__':
    run()
"""

with open('scripts/test_ledger_flow.py', 'w') as f:
    f.write(code)
