from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LedgerAccountViewSet, TransactionViewSet, 
    CardViewSet, SubscriptionViewSet, 
    FinancialGoalViewSet, ContactViewSet,
    dashboard_stats  # <-- Import this
)

router = DefaultRouter()
router.register(r'accounts', LedgerAccountViewSet, basename='account')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'cards', CardViewSet, basename='card')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'goals', FinancialGoalViewSet, basename='goal')
router.register(r'contacts', ContactViewSet, basename='contact')

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/data/', dashboard_stats, name='dashboard-stats'), # <-- Add this line
]
