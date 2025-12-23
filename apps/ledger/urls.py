from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    TransactionCreateView, 
    TrialBalanceView, 
    AccountStatementView, 
    TransactionListView, 
    LedgerAccountListView,
    FinancialGoalViewSet,
    ContactViewSet,
    SpendingAnalyticsView
)

router = DefaultRouter()
router.register(r'goals', FinancialGoalViewSet, basename='financial-goal')
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('transactions/create/', TransactionCreateView.as_view(), name='create-transaction'),
    path('transactions/', TransactionListView.as_view(), name='transaction-list'),
    path('trial-balance/', TrialBalanceView.as_view(), name='trial-balance'),
    path('accounts/<uuid:pk>/statement/', AccountStatementView.as_view(), name='account-statement'),
    path('accounts/', LedgerAccountListView.as_view(), name='account-list'),
    path('analytics/spending/', SpendingAnalyticsView.as_view(), name='spending-analytics'),
] + router.urls
