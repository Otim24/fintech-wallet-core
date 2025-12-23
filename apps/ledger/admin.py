from django.contrib import admin
from .models import LedgerAccount, Transaction, JournalEntry

class JournalEntryInline(admin.TabularInline):
    model = JournalEntry
    extra = 2  # Standard double-entry requirement

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('reference', 'posted', 'created_at')
    list_filter = ('posted', 'created_at')
    search_fields = ('reference', 'description')
    inlines = [JournalEntryInline]

@admin.register(LedgerAccount)
class LedgerAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'currency', 'balance', 'user')
    list_filter = ('type', 'currency')
    search_fields = ('name', 'user__email')

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ('transaction', 'account', 'type', 'amount', 'created_at')
    list_filter = ('type', 'created_at')
