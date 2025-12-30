from rest_framework import serializers
from decimal import Decimal
from django.db import transaction
from .models import LedgerAccount, Transaction, JournalEntry, FinancialGoal, Contact, Card, Subscription

class LedgerAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerAccount
        fields = ['id', 'name', 'type', 'currency', 'balance', 'created_at']
        read_only_fields = ['balance', 'created_at']

class JournalEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = JournalEntry
        fields = ['id', 'account', 'amount', 'type']

class TransactionSerializer(serializers.ModelSerializer):
    entries = JournalEntrySerializer(many=True)

    class Meta:
        model = Transaction
        fields = ['id', 'reference', 'description', 'created_at', 'posted', 'entries']
        read_only_fields = ['created_at']

# --- Input Serializers for API Layer ---

class JournalEntryInputSerializer(serializers.Serializer):
    account_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=20, decimal_places=4, min_value=Decimal('0.01'))
    type = serializers.ChoiceField(choices=JournalEntry.EntryType.choices)

class TransactionCreateSerializer(serializers.Serializer):
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)
    reference = serializers.CharField(max_length=255, required=False, allow_blank=True)
    entries = serializers.ListField(
        child=JournalEntryInputSerializer(),
        min_length=2
    )

    def validate(self, data):
        """
        Pre-validation for the input data structure.
        Detailed logic (balance checks) happens in the Service Layer, 
        but we can do basic checks here if needed.
        """
        return data

# --- Reporting Serializers ---

class TrialBalanceAccountSerializer(serializers.ModelSerializer):
    total_debits = serializers.DecimalField(max_digits=20, decimal_places=4)
    total_credits = serializers.DecimalField(max_digits=20, decimal_places=4)
    net_balance = serializers.DecimalField(max_digits=20, decimal_places=4)

    class Meta:
        model = LedgerAccount
        fields = ['id', 'name', 'type', 'currency', 'balance', 'total_debits', 'total_credits', 'net_balance']

class TrialBalanceSerializer(serializers.Serializer):
    is_balanced = serializers.BooleanField()
    total_debits = serializers.DecimalField(max_digits=20, decimal_places=4)
    total_credits = serializers.DecimalField(max_digits=20, decimal_places=4)
    accounts = TrialBalanceAccountSerializer(many=True)

class AccountStatementEntrySerializer(serializers.ModelSerializer):
    transaction_description = serializers.CharField(source='transaction.description')
    transaction_reference = serializers.CharField(source='transaction.reference')
    transaction_date = serializers.DateTimeField(source='transaction.created_at')

    class Meta:
        model = JournalEntry
        fields = ['id', 'amount', 'type', 'transaction_description', 'transaction_reference', 'transaction_date']

class FinancialGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialGoal
        fields = ['id', 'name', 'target_amount', 'current_amount', 'deadline', 'created_at']
        read_only_fields = ['current_amount', 'created_at']

class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'avatar_url', 'created_at']
        read_only_fields = ['created_at']

class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ['id', 'user', 'account', 'name', 'last_4', 'type', 'is_frozen', 'spending_limit', 'balance', 'created_at']
        read_only_fields = ['balance', 'created_at', 'user', 'account', 'name', 'last_4']

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = ['id', 'user', 'service_name', 'amount', 'billing_cycle', 'next_billing_date', 'logo_url', 'is_active', 'created_at']
        read_only_fields = ['created_at', 'user']
