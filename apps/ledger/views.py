import logging
import json
from django.core.serializers.json import DjangoJSONEncoder
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import ValidationError as DRFValidationError
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from .models import JournalEntry, IdempotencyKey, FinancialGoal, Contact, Transaction, LedgerAccount, Card, Subscription
from .serializers import (
    TransactionCreateSerializer, 
    TransactionSerializer, 
    TrialBalanceSerializer,
    AccountStatementEntrySerializer,
    FinancialGoalSerializer,
    ContactSerializer,
    FinancialGoalSerializer,
    ContactSerializer,
    LedgerAccountSerializer,
    CardSerializer,
    SubscriptionSerializer
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

class TransactionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        return Transaction.objects.filter(entries__account__user=self.request.user).distinct().order_by('-created_at')

class LedgerAccountViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LedgerAccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return LedgerAccount.objects.filter(user=self.request.user)

class ContactViewSet(viewsets.ModelViewSet):
    serializer_class = ContactSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Contact.objects.filter(user=self.request.user).order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Card.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        import random
        # Automatically find the user's first account
        account = LedgerAccount.objects.filter(user=self.request.user).first()
        if not account:
            # Fallback if no account exists
            account = LedgerAccount.objects.create(
                user=self.request.user, 
                name="Main Checking", 
                type=LedgerAccount.Type.ASSET,
                balance=0
            )
        
        # Generate random details so the DB is happy
        generated_last_4 = str(random.randint(1000, 9999))
        card_type = serializer.validated_data.get('type', 'VIRTUAL')
        auto_name = "Ghost Card" if card_type == 'VIRTUAL' else "Physical Metal"

        serializer.save(
            user=self.request.user, 
            account=account, 
            last_4=generated_last_4,
            name=auto_name 
        )

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user).order_by('next_billing_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats(request):
    from django.db.models import Sum
    # Calculate simple total spending (Sum of all negative transactions)
    # Note: Using JournalEntry because Transaction doesn't have an amount field directly in this schema
    total_spending = JournalEntry.objects.filter(
        account__user=request.user, 
        type=JournalEntry.EntryType.DEBIT
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Mock graph data so the frontend doesn't crash
    chart_data = [
        {"month": "Jan", "amount": 1200},
        {"month": "Feb", "amount": 1900},
        {"month": "Mar", "amount": 300},
        {"month": "Apr", "amount": 500},
        {"month": "May", "amount": 200},
        {"month": "Jun", "amount": 3000},
    ]

    return Response({
        "total_spending": float(total_spending),
        "chart_data": chart_data,
        "period": request.GET.get('period', '12 months')
    })
