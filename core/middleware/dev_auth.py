from django.contrib.auth import get_user_model
from django.conf import settings

class DevAutoLoginMiddleware:
    """
    Middleware to automatically log in the first user in Development mode.
    This bypasses missing authentication infrastructure for UI testing.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if settings.DEBUG and not request.user.is_authenticated:
            # Check for header bypass or just force it
            User = get_user_model()
            # Exclude system user if possible, or just pick first
            user = User.objects.exclude(email='system@fintech.local').first()
            if not user:
                 user = User.objects.first()
            
            if user:
                request.user = user
        return self.get_response(request)
