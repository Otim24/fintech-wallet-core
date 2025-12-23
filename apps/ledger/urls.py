from django.urls import path
from .views import (
    TransactionCreateView, 
    TrialBalanceView, 
    AccountStatementView, 
    TransactionListView, 
    LedgerAccountListView
)

urlpatterns = [
    path('transactions/create/', TransactionCreateView.as_view(), name='create-transaction'),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('trial-balance/', TrialBalanceView.as_view(), name='trial-balance'),
    path('accounts/<uuid:pk>/statement/', AccountStatementView.as_view(), name='account-statement'),
    path('accounts/', LedgerAccountListView.as_view(), name='account-list'),
]
