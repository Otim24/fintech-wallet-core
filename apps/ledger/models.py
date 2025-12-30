import uuid
from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class LedgerAccount(models.Model):
    class Type(models.TextChoices):
        ASSET = 'ASSET', _('Asset')
        LIABILITY = 'LIABILITY', _('Liability')
        EQUITY = 'EQUITY', _('Equity')
        INCOME = 'INCOME', _('Income')
        EXPENSE = 'EXPENSE', _('Expense')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=20, choices=Type.choices)
    currency = models.CharField(max_length=3, default='USD')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='ledger_accounts'
    )
    balance = models.DecimalField(max_digits=20, decimal_places=4, default=Decimal('0.0000'))
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.name} ({self.currency})"

class Transaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    reference = models.CharField(max_length=255, unique=True, help_text=_("External reference ID"), blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    posted = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = str(uuid.uuid4())
        super().save(*args, **kwargs)

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['reference']),
        ]

    def clean(self):
        """
        Ensure the transaction is balanced (Debits == Credits).
        Validation is only run if the transaction is being posted or manually called.
        """
        if self.pk and self.posted:
            # Aggregate entries
            debits = self.entries.filter(type=JournalEntry.EntryType.DEBIT).aggregate(total=models.Sum('amount'))['total'] or Decimal('0')
            credits = self.entries.filter(type=JournalEntry.EntryType.CREDIT).aggregate(total=models.Sum('amount'))['total'] or Decimal('0')
            
            if debits != credits:
                raise ValidationError(
                    _("Transaction is not balanced. Debits: %(debits)s, Credits: %(credits)s"),
                    params={'debits': debits, 'credits': credits}
                )

    def __str__(self):
        return f"{self.reference}"

class JournalEntry(models.Model):
    class EntryType(models.TextChoices):
        DEBIT = 'DEBIT', _('Debit')
        CREDIT = 'CREDIT', _('Credit')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    transaction = models.ForeignKey(Transaction, related_name='entries', on_delete=models.CASCADE)
    account = models.ForeignKey(LedgerAccount, related_name='entries', on_delete=models.PROTECT)
    amount = models.DecimalField(max_digits=20, decimal_places=4)
    type = models.CharField(max_length=10, choices=EntryType.choices)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Journal Entries"
        indexes = [
            models.Index(fields=['transaction']),
            models.Index(fields=['account']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.type} {self.amount} - {self.account.name}"

class IdempotencyKey(models.Model):
    key = models.UUIDField(unique=True, db_index=True)
    response_body = models.JSONField()
    response_status = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.key)



class Card(models.Model):
    class CardType(models.TextChoices):
        PHYSICAL = 'PHYSICAL', 'Physical'
        VIRTUAL = 'VIRTUAL', 'Virtual'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cards')
    account = models.ForeignKey(LedgerAccount, on_delete=models.CASCADE, related_name='cards')
    name = models.CharField(max_length=50) # e.g. "Wise", "Stripe"
    last_4 = models.CharField(max_length=4)
    type = models.CharField(choices=CardType.choices, max_length=10)
    is_frozen = models.BooleanField(default=False)
    spending_limit = models.DecimalField(max_digits=12, decimal_places=2, default=1000.00)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.last_4})"

class Subscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    service_name = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    billing_cycle = models.CharField(max_length=20, default='Monthly')
    next_billing_date = models.DateField()
    logo_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.service_name
class FinancialGoal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='financial_goals')
    name = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=20, decimal_places=4)
    current_amount = models.DecimalField(max_digits=20, decimal_places=4, default=Decimal('0.0000'))
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.current_amount}/{self.target_amount})"

class Contact(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='contacts')
    name = models.CharField(max_length=255)
    email = models.EmailField()
    avatar_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'email')

    def __str__(self):
        return self.name
