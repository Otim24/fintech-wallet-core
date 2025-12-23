from decimal import Decimal
from django.db import transaction
from django.db.models import Sum, Q, F, Case, When
from django.db.models.functions import Coalesce
from django.core.exceptions import ValidationError
from .models import LedgerAccount, Transaction, JournalEntry

class LedgerService:
    @staticmethod
    def create_transaction(user, description, entries_data, reference=None):
        """
        Creates a transaction and its journal entries atomically.
        Updates account balances based on entry type and account type.
        
        :param user: The user initiating the transaction (optional, for logging if needed)
        :param description: Description of the transaction
        :param entries_data: List of dicts [{'account': instance, 'amount': logic, 'type': DEBIT/CREDIT}]
        :param reference: Unique reference ID (optional, generated if None)
        :return: Transaction instance
        """
        with transaction.atomic():
            # Create Transaction
            txn = Transaction(
                description=description,
                posted=True # We immediately post and update balances
            )
            if reference:
                txn.reference = reference
            txn.save() # ID generated here if reference is None/UUID

            debits = Decimal('0.00')
            credits = Decimal('0.00')

            for entry in entries_data:
                account_id = entry['account_id']
                amount = Decimal(str(entry['amount'])) # Ensure Decimal
                entry_type = entry['type']

                # Lock the account row for update to prevent race conditions
                try:
                    locked_account = LedgerAccount.objects.select_for_update().get(id=account_id)
                except LedgerAccount.DoesNotExist:
                     raise ValidationError(f"Account {account_id} does not exist.")

                if amount <= 0:
                     raise ValidationError(f"Amount for account {locked_account.name} must be positive.")

                # Create Journal Entry
                JournalEntry.objects.create(
                    transaction=txn,
                    account=locked_account,
                    amount=amount,
                    type=entry_type
                )
                
                # Update Totals for Validation
                if entry_type == JournalEntry.EntryType.DEBIT:
                    debits += amount
                elif entry_type == JournalEntry.EntryType.CREDIT:
                    credits += amount

                # Update Account Balance (Denormalization)
                # Asset/Expense: Debit (+), Credit (-)
                # Liability/Equity/Income: Debit (-), Credit (+)
                
                if locked_account.type in [LedgerAccount.Type.ASSET, LedgerAccount.Type.EXPENSE]:
                    if entry_type == JournalEntry.EntryType.DEBIT:
                        locked_account.balance += amount
                    else:
                        locked_account.balance -= amount
                else: # Liability, Equity, Income
                    if entry_type == JournalEntry.EntryType.DEBIT:
                        locked_account.balance -= amount
                    else:
                        locked_account.balance += amount
                
                locked_account.save()

            # Validate Double Entry
            if debits != credits:
                raise ValidationError(f"Transaction unbalance: Debits {debits} != Credits {credits}")
            
            return txn

    @staticmethod
    def get_balance(account_id):
        return LedgerAccount.objects.get(id=account_id).balance

    @staticmethod
    def get_trial_balance(user):
        """
        Calculates the trial balance for a user.
        Returns a dict with global totals and a queryset of accounts annotated with debit/credit sums.
        """
        accounts = LedgerAccount.objects.filter(user=user).annotate(
            total_debits=Coalesce(Sum('entries__amount', filter=Q(entries__type=JournalEntry.EntryType.DEBIT)), Decimal('0')),
            total_credits=Coalesce(Sum('entries__amount', filter=Q(entries__type=JournalEntry.EntryType.CREDIT)), Decimal('0'))
        ).annotate(
            net_balance=Case(
                When(type__in=[LedgerAccount.Type.ASSET, LedgerAccount.Type.EXPENSE], then=F('total_debits') - F('total_credits')),
                default=F('total_credits') - F('total_debits')
            )
        )
        
        # Calculate global health check
        global_debits = accounts.aggregate(sum=Sum('total_debits'))['sum'] or Decimal('0')
        global_credits = accounts.aggregate(sum=Sum('total_credits'))['sum'] or Decimal('0')
        
        return {
            'is_balanced': global_debits == global_credits,
            'total_debits': global_debits,
            'total_credits': global_credits,
            'accounts': accounts
        }
