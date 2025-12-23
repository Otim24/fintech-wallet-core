import concurrent.futures
import time
import uuid
import sys
import os
import django
from decimal import Decimal

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.ledger.models import LedgerAccount, Transaction

User = get_user_model()

def stress_test():
    print("--- Starting Concurrency Stress Test ---")
    
    # 1. Setup User and Accounts
    email = "stress_tester@example.com"
    user, created = User.objects.get_or_create(email=email)
    if created:
        user.set_password("password123")
        user.save()
    
    # Use APIClient to simulate requests - this bypasses network overhead but hits the full view stack.
    # To truly test network + db locking, we would use `requests` against localhost:8000, 
    # but `APIClient` is sufficient to test `select_for_update` behavior since WSGI/ASGI handlers are concurrent in prod,
    # and here we use threads. However, APIClient isn't thread-safe usually because it might share state?
    # Actually, `APIClient` instantiates a new handler per request usually.
    # BUT, since we are running in a single process script, careful with DB connections.
    # Django closes db connection at end of request.
    # Ideally, we should use `requests` hitting the real server 'web' container.
    # But this script runs INSIDE the web container.
    # So we can hit `http://localhost:8000` assuming gunicorn/uvicorn is running on port 8000.
    # We are running via `docker-compose exec web ...`. Gunicorn is running on 8000.
    
    BASE_URL = "http://localhost:8000"
    
    # We need a proper token or session. 
    # Since we can't easily get a token via API (no endpoint), we will use APIClient for setup
    # and maybe try to use `requests` with a trick? 
    # Or just rely on the fact that `select_for_update` works at DB level regardless of client.
    # Problem: `APIClient` with threads might be tricky due to Django's test environment behavior (autocommit).
    
    # Let's try `APIClient` first, but create a new client instance per thread.
    
    # Wait, `stress_test` running as a management script might not work well with multi-threaded DB access 
    # if Django's connection handling isn't thread-local correct in this context. 
    # Django DB connections are thread-local.
    
    # Let's create accounts first.
    asset_acc, _ = LedgerAccount.objects.get_or_create(name="Stress Asset", type=LedgerAccount.Type.ASSET, user=user)
    income_acc, _ = LedgerAccount.objects.get_or_create(name="Stress Income", type=LedgerAccount.Type.INCOME, user=user)
    
    initial_balance = asset_acc.balance
    print(f"Initial Balance: {initial_balance}")
    
    NUM_REQUESTS = 50
    AMOUNT = Decimal('10.00')
    
    def post_transaction(index):
        # Each thread gets its own client/user context
        # Actually APIClient doesn't survive across threads well if it relies on test signals.
        # Let's use `requests` against the running server.
        # We need an Auth Token.
        # But we haven't built a Token endpoint yet!
        # Workaround: Use `APIClient` but protect it? OR assume `select_for_update` logic is sound and test it via Django ORM directly with threads?
        # The user asked for "API calls".
        
        # Let's use Django ORM `LedgerService.create_transaction` directly in threads?
        # NO, user said "post_transaction that sends a POST request".
        
        # Okay, we need to authenticate.
        # Since we don't have a login endpoint, we can't get a token for `requests`.
        # We MUST use `APIClient`.
        # Is APIClient thread safe?
        # It calls `Client.request` -> `WSGIHandler`.
        # The `WSGIHandler` runs the view.
        # The view accesses DB.
        # Django closes connection.
        # It should work if we verify connection management.
        
        local_client = APIClient()
        local_client.force_authenticate(user=user)
        
        payload = {
            "reference": f"STRESS-{uuid.uuid4()}", # Unique Ref
            "description": f"Stress {index}",
            "entries": [
                {"account_id": str(asset_acc.id), "amount": str(AMOUNT), "type": "DEBIT"},
                {"account_id": str(income_acc.id), "amount": str(AMOUNT), "type": "CREDIT"}
            ]
        }
        
        try:
            # We must close any existing connection in this thread before starting to ensure new one?
            # django.db.connections.close_all()
            resp = local_client.post('/api/ledger/transactions/', payload, format='json')
            return resp.status_code
        except Exception as e:
            return str(e)

    print(f"Launching {NUM_REQUESTS} parallel requests...")
    
    start_time = time.time()
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(post_transaction, i) for i in range(NUM_REQUESTS)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    duration = time.time() - start_time
    print(f"Finished in {duration:.2f} seconds.")
    
    # 3. Analyze Results
    success_count = results.count(201)
    fail_count = len(results) - success_count
    print(f"Success (201): {success_count}")
    print(f"Failures: {fail_count}")
    if fail_count > 0:
        print(f"Sample Failure Codes: {[r for r in results if r != 201][:5]}")

    # 4. Final Verdict
    asset_acc.refresh_from_db()
    final_balance = asset_acc.balance
    expected_balance = initial_balance + (Decimal(success_count) * AMOUNT)
    
    print(f"Initial: {initial_balance}")
    print(f"Expected: {expected_balance} (based on {success_count} successful posts)")
    print(f"Actual:   {final_balance}")
    
    if final_balance == expected_balance:
        print("SUCCESS: Concurrency Test Passed. Balances match exactly.")
    else:
        print(f"FAILURE: Balance Mismatch! Delta: {final_balance - expected_balance}")
        print("Possible 'Lost Update' anomaly detected.")

if __name__ == '__main__':
    stress_test()
