import os
import sys
import django
import random
from datetime import timedelta
from decimal import Decimal
from django.utils import timezone

# Setup Django Context
sys.path.append(os.path.join(os.path.dirname(__file__), '../'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.ledger.models import LedgerAccount, Transaction, JournalEntry, Card, Subscription, FinancialGoal

User = get_user_model()

def run():
    users = User.objects.all()
    if not users.exists():
        print("❌ No users found! Please create a user via the Signup page first.")
        return

    print(f"🚀 Seeding data for {users.count()} users...")
    
    # Create System Account for balancing
    system_user, _ = User.objects.get_or_create(email='system@fintech.local', defaults={'is_active': False})

    system_account, _ = LedgerAccount.objects.get_or_create(
        name='External World',
        user=system_user,
        defaults={'type': LedgerAccount.Type.LIABILITY}
    )

    for user in users:
        if user.email == 'system@fintech.local': continue
        print(f"   👤 Processing user: {user.email}")
        
        # 1. Ensure Account
        account, created = LedgerAccount.objects.get_or_create(
            user=user,
            name='Main Checking',
            defaults={'type': LedgerAccount.Type.ASSET, 'balance': 0}
        )

        
        # 2. Create Cards (If none)
        if not Card.objects.filter(user=user).exists():
            Card.objects.create(user=user, account=account, name="Wise Virtual", type="VIRTUAL", last_4="8821", spending_limit=5000)
            Card.objects.create(user=user, account=account, name="Stripe Metal", type="PHYSICAL", last_4="4582", spending_limit=15000)
            print("      💳 Created 2 Cards")

        # 3. Create Subscriptions
        if not Subscription.objects.filter(user=user).exists():
            Subscription.objects.create(user=user, service_name="Netflix Premium", amount=15.99, next_billing_date=timezone.now().date() + timedelta(days=5))
            Subscription.objects.create(user=user, service_name="Spotify Duo", amount=12.99, next_billing_date=timezone.now().date() + timedelta(days=12))
            Subscription.objects.create(user=user, service_name="Adobe Creative Cloud", amount=54.99, next_billing_date=timezone.now().date() + timedelta(days=1))
            print("      📅 Created 3 Subscriptions")

        # 4. Create Transactions (If few exist)
        # We check Transaction objects linked via entries... expensive query, just check if recent exists
        # Actually, let's just force create 5-10 if total count is low.
        recent_tx_count = Transaction.objects.filter(entries__account=account).distinct().count()
        
        if recent_tx_count < 5:
            # Data: (Name, Amount, Category/Description suffix) -> Amount > 0 = Income (Credit)
            data = [
                ("Salary Deposit", 5240.00, "Income"),
                ("Netflix Premium", -15.99, "Entertainment"),
                ("Uber Ride", -24.50, "Transport"),
                ("Whole Foods", -145.20, "Groceries"),
                ("Spotify", -12.99, "Entertainment"),
                ("Apple Store", -999.00, "Electronics"),
                ("Starbucks", -6.50, "Food"),
                ("Shell Station", -45.00, "Transport")
            ]
            
            for name, amt, cat in data:
                # Create Transaction Container
                tx = Transaction.objects.create(
                    description=name,
                    posted=True # We want COMPLETED transactions
                )
                
                amount_dec = Decimal(str(abs(amt)))
                
                # Determine Types
                # If amt > 0: Income. User Account gets CREDIT. System gets DEBIT.
                # If amt < 0: Expense. User Account gets DEBIT. System gets CREDIT.
                
                if amt > 0:
                    user_type = JournalEntry.EntryType.CREDIT
                    sys_type = JournalEntry.EntryType.DEBIT
                else:
                    user_type = JournalEntry.EntryType.DEBIT
                    sys_type = JournalEntry.EntryType.CREDIT
                    
                # User Entry
                JournalEntry.objects.create(
                   transaction=tx,
                   account=account,
                   amount=amount_dec,
                   type=user_type
                )
                
                # System Balancing Entry
                JournalEntry.objects.create(
                   transaction=tx,
                   account=system_account,
                   amount=amount_dec,
                   type=sys_type
                )
                
                # Update create time for scatter
                tx.created_at = timezone.now() - timedelta(days=random.randint(0, 30))
                tx.save()

            print("      💸 Created balanced transactions")

        # 5. Update Balance (Sum of Credits - Sum of Debits)
        credits = JournalEntry.objects.filter(account=account, type='CREDIT').aggregate(t=django.db.models.Sum('amount'))['t'] or Decimal(0)
        debits = JournalEntry.objects.filter(account=account, type='DEBIT').aggregate(t=django.db.models.Sum('amount'))['t'] or Decimal(0)
        account.balance = credits - debits # If Credit is Income
        # Wait, if Debit is Expense (money leaving), balance should be Income - Expense.
        # So Balance = Credits - Debits.
        account.save()

    print("✅ SEEDING COMPLETE. Refresh your dashboard!")

if __name__ == "__main__":
    run()
