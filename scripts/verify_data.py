import os
import sys
import django
import json

sys.path.append(os.path.join(os.path.dirname(__file__), '../'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.ledger.models import Transaction, LedgerAccount
from apps.ledger.serializers import TransactionSerializer

User = get_user_model()

def verify():
    user = User.objects.first()
    if not user:
        print("No users found.")
        return

    print(f"Checking data for user: {user.email}")
    
    # Check Accounts
    accounts = LedgerAccount.objects.filter(user=user)
    print(f"Accounts: {accounts.count()}")
    for acc in accounts:
        print(f"  - {acc.name}: {acc.balance}")

    # Check Transactions via Model Query (Same as ViewSet)
    txs = Transaction.objects.filter(entries__account__user=user).distinct()
    print(f"Transactions (QuerySet): {txs.count()}")
    
    if txs.exists():
        first_tx = txs.first()
        print(f"Sample Transaction: {first_tx.description}")
        print(f"Entries: {first_tx.entries.count()}")
        for entry in first_tx.entries.all():
            print(f"  - {entry.type} {entry.amount} ({entry.account.name})")

        # Check Serialization
        serializer = TransactionSerializer(first_tx)
        print("Serialized Data:")
        print(json.dumps(serializer.data, indent=2, default=str))

if __name__ == "__main__":
    verify()
