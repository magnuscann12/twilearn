from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Group, Word, StudyActivity, StudySession, WordProgress
from .serializers import (GroupSerializer, WordSerializer, 
                          StudyActivitySerializer, StudySessionSerializer,
                          WordProgressSerializer, UserSerializer)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class WordViewSet(viewsets.ModelViewSet):
    queryset = Word.objects.all()
    serializer_class = WordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Word.objects.all()
        group_id = self.request.query_params.get('group')
        language = self.request.query_params.get('language')
        
        if group_id:
            queryset = queryset.filter(groups__id=group_id)
        if language:
            queryset = queryset.filter(language=language)
        
        return queryset.distinct()


class StudyActivityViewSet(viewsets.ModelViewSet):
    queryset = StudyActivity.objects.all()
    serializer_class = StudyActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def start_session(self, request, pk=None):
        activity = self.get_object()
        session = StudySession.objects.create(activity=activity, user=request.user)
        serializer = StudySessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete_session(self, request, pk=None):
        activity = self.get_object()
        session_id = request.data.get('session_id')
        
        try:
            session = StudySession.objects.get(id=session_id, activity=activity)
            session.completed_at = session.completed_at or timezone.now()
            session.score = request.data.get('score')
            session.total_questions = request.data.get('total_questions', 0)
            session.correct_answers = request.data.get('correct_answers', 0)
            session.save()
            serializer = StudySessionSerializer(session)
            return Response(serializer.data)
        except StudySession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)


class StudySessionViewSet(viewsets.ModelViewSet):
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stats(self, request):
        queryset = StudySession.objects.filter(user=request.user)
        
        total_sessions = queryset.count()
        completed_sessions = queryset.filter(completed_at__isnull=False).count()
        avg_score = queryset.filter(score__isnull=False).aggregate(
            avg=models.Avg('score')
        )['avg']
        
        # Calculate streak
        from datetime import timedelta
        today = timezone.now().date()
        streak = 0
        if completed_sessions > 0:
            check_date = today
            while queryset.filter(started_at__date=check_date).exists():
                streak += 1
                check_date -= timedelta(days=1)
        
        return Response({
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'average_score': avg_score,
            'streak': streak
        })


class WordProgressViewSet(viewsets.ModelViewSet):
    serializer_class = WordProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WordProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(request.data.get('password'))
        user.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    from django.contrib.auth import authenticate
    
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user:
        from django.contrib.auth import login
        login(request, user)
        return Response({
            'user': UserSerializer(user).data,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    from django.contrib.auth import logout
    logout(request)
    return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_auth(request):
    return Response({
        'authenticated': request.user.is_authenticated,
        'user': UserSerializer(request.user).data if request.user.is_authenticated else None
    })
