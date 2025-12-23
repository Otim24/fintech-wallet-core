import logging
import json
from django.core.serializers.json import DjangoJSONEncoder
from rest_framework.views import APIView
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from .models import JournalEntry, IdempotencyKey, FinancialGoal, Contact, Transaction, LedgerAccount
from .serializers import (
    TransactionCreateSerializer, 
    TransactionSerializer, 
    TrialBalanceSerializer,
    AccountStatementEntrySerializer,
    FinancialGoalSerializer,
    ContactSerializer,
    LedgerAccountSerializer
)
from .services import LedgerService

logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class TransactionCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TransactionCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # We pass the validated data directly. 
                # The service expects a list of dicts with 'account_id', 'amount', 'type'.
                # The serializer provides 'entries' which matches this structure (from JournalEntryInputSerializer).
                
                idempotency_key = request.headers.get('Idempotency-Key')
                if idempotency_key:
                    try:
                         entry = IdempotencyKey.objects.get(key=idempotency_key)
                         return Response(entry.response_body, status=entry.response_status)
                    except IdempotencyKey.DoesNotExist:
                         pass

                txn = LedgerService.create_transaction(
                    user=request.user,
                    description=serializer.validated_data.get('description', ''),
                    entries_data=serializer.validated_data['entries'],
                    reference=serializer.validated_data.get('reference')
                )
                
                response_data = TransactionSerializer(txn).data
                status_code = status.HTTP_201_CREATED

                if idempotency_key:
                    try:
                        IdempotencyKey.objects.create(
                            key=idempotency_key,
                            response_body=json.loads(json.dumps(response_data, cls=DjangoJSONEncoder)),
                            response_status=status_code
                        )
                    except Exception as e_idem:
                        logger.error(f"Idempotency save failed: {e_idem}")

                return Response(
                    response_data,
                    status=status_code
                )

            except ValidationError as e:
                return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)
            except ObjectDoesNotExist as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                logger.error(f"Transaction creation failed: {str(e)}", exc_info=True)
                print(f"DEBUG ERROR: {e}")
                return Response(
                    {"error": "An internal error occurred processing the transaction."}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TrialBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            data = LedgerService.get_trial_balance(request.user)
            serializer = TrialBalanceSerializer(data)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Trial Balance Error: {str(e)}", exc_info=True)
            return Response(
                {"error": "Failed to generate trial balance."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AccountStatementView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AccountStatementEntrySerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        account_id = self.kwargs['pk']
        # Ensure user owns the account
        return JournalEntry.objects.filter(
            account__id=account_id,
            account__user=self.request.user
        ).select_related('transaction').order_by('-transaction__created_at')

class TransactionListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TransactionSerializer
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        # Return all transactions where the user is involved (via accounts)
        # This is a bit complex efficiently, but for now:
        return Transaction.objects.filter(entries__account__user=self.request.user).distinct().order_by('-created_at')

class LedgerAccountListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LedgerAccountSerializer
    pagination_class = None

    def get_queryset(self):
        return LedgerAccount.objects.filter(user=self.request.user)

class FinancialGoalViewSet(viewsets.ModelViewSet):
    serializer_class = FinancialGoalSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None 

    def get_queryset(self):
        return FinancialGoal.objects.filter(user=self.request.user).order_by('deadline')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SpendingAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        from django.db.models import Sum
        from django.db.models.functions import TruncDay
        from datetime import timedelta

        period = request.query_params.get('period', '12m')
        now = timezone.now()

        if period == '24h':
            start_date = now - timedelta(hours=24)
            prev_start = start_date - timedelta(hours=24)
        elif period == '7d':
            start_date = now - timedelta(days=7)
            prev_start = start_date - timedelta(days=7)
        elif period == '30d':
            start_date = now - timedelta(days=30)
            prev_start = start_date - timedelta(days=30)
        elif period == '12m':
            start_date = now - timedelta(days=365)
            # Compare with previous year
            prev_start = start_date - timedelta(days=365)
        else:
             # Default to 30d if invalid
            start_date = now - timedelta(days=30)
            prev_start = start_date - timedelta(days=30)

        # Base filter: User's accounts, DEBIT entries (money leaving)
        # Note: Internal transfers might be counted as spending depending on logic.
        # Ideally we exclude transfers to own accounts, but simplistically:
        queryset = JournalEntry.objects.filter(
            account__user=request.user,
            type=JournalEntry.EntryType.DEBIT,
            created_at__gte=start_date
        )

        total_spending = queryset.aggregate(total=Sum('amount'))['total'] or 0

        # Previous period for percentage
        prev_queryset = JournalEntry.objects.filter(
            account__user=request.user,
            type=JournalEntry.EntryType.DEBIT,
            created_at__gte=prev_start,
            created_at__lt=start_date
        )
        prev_total = prev_queryset.aggregate(total=Sum('amount'))['total'] or 0

        # Calculate percentage change
        if prev_total > 0:
            percentage_change = ((total_spending - prev_total) / prev_total) * 100
        elif total_spending > 0:
            percentage_change = 100 # 100% increase from 0
        else:
            percentage_change = 0

        # Chart Data (Daily aggregation)
        # For 24h, you might want hourly, but let's stick to simple daily buckets or raw list for now.
        # If period is 24h, maybe truncate by hour?
        # Let's simple TruncDay for > 24h and list for short.
        
        # Simplified: Group by TruncDay for all for chart consistency
        chart_data = (
            queryset
            .annotate(date=TruncDay('created_at'))
            .values('date')
            .annotate(amount=Sum('amount'))
            .order_by('date')
        )
        
        # Format chart data
        history = [
            {"date": item['date'].strftime('%Y-%m-%d'), "amount": float(item['amount'])}
            for item in chart_data
        ]

        return Response({
            "total": float(total_spending),
            "percentage_change": round(float(percentage_change), 1),
            "history": history
        })
