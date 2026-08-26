"""
URL configuration for twilearn project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

def health_check(request):
    try:
        return JsonResponse({
            'status': 'healthy',
            'debug': settings.DEBUG,
            'allowed_hosts': settings.ALLOWED_HOSTS,
        })
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)

urlpatterns = [
    path('health/', health_check),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', include('api.frontend_urls')),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
