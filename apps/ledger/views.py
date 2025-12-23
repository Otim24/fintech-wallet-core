import logging
import json
from django.core.serializers.json import DjangoJSONEncoder
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.pagination import PageNumberPagination
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from .models import JournalEntry, IdempotencyKey
from .serializers import (
    TransactionCreateSerializer, 
    TransactionSerializer, 
    TrialBalanceSerializer,
    AccountStatementEntrySerializer
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
