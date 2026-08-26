from django.urls import path
from django.views.generic import TemplateView
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

def health_check_frontend(request):
    try:
        return JsonResponse({
            'status': 'healthy',
            'frontend': 'working'
        })
    except Exception as e:
        logger.error(f"Frontend health check failed: {e}")
        return JsonResponse({
            'status': 'unhealthy',
            'error': str(e)
        }, status=500)

urlpatterns = [
    path('health/', health_check_frontend),
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
]
