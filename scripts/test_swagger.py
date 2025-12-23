import os
import sys
import django
from django.test import Client

# Add project root to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def run():
    print("--- Verifying Swagger Endpoint ---")
    c = Client()
    try:
        resp = c.get('/api/schema/')
        print(f"/api/schema/ Status: {resp.status_code}")
        if resp.status_code == 200:
            print("Schema downloaded successfully.")
            # print(resp.content[:100])
        else:
            print("Failed to access schema.")
            
        resp_ui = c.get('/api/schema/swagger-ui/')
        print(f"/api/schema/swagger-ui/ Status: {resp_ui.status_code}")
        if resp_ui.status_code == 200:
            print("Swagger UI loaded successfully.")
        else:
            print("Failed to access Swagger UI.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    run()
