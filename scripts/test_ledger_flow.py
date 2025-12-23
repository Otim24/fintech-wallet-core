
import os
import sys
import django
from decimal import Decimal

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

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
        
        if assets.balance == initial_asset_balance + Decimal('100.00') and            revenue.balance == initial_revenue_balance + Decimal('100.00'):
            print("VERIFICATION PASSED: Balances updated correctly.")
        else:
            print("VERIFICATION FAILED: Balances incorrect.")
            
    else:
        print(f"FAILED: {response.status_code}")
        print(response.data)

if __name__ == '__main__':
    run()
