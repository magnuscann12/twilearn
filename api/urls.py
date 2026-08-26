from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (GroupViewSet, WordViewSet, StudyActivityViewSet, 
                    StudySessionViewSet, WordProgressViewSet, register, login, logout, check_auth)

router = DefaultRouter()
router.register(r'groups', GroupViewSet)
router.register(r'words', WordViewSet)
router.register(r'study-activities', StudyActivityViewSet)
router.register(r'study-sessions', StudySessionViewSet)
router.register(r'word-progress', WordProgressViewSet, basename='wordprogress')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', register),
    path('login/', login),
    path('logout/', logout),
    path('check-auth/', check_auth),
]
