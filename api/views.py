from django.utils import timezone
from django.db import models
from django.contrib.auth.models import User
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
import logging
from .models import Group, Word, StudyActivity, StudySession, WordProgress
from .serializers import (GroupSerializer, WordSerializer,
                          StudyActivitySerializer, StudySessionSerializer,
                          WordProgressSerializer, UserSerializer)

logger = logging.getLogger(__name__)


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in GroupViewSet.list: {e}")
            return Response({'error': 'Failed to fetch groups'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WordViewSet(viewsets.ModelViewSet):
    queryset = Word.objects.all()
    serializer_class = WordSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        try:
            queryset = Word.objects.all()
            group_id = self.request.query_params.get('group')
            language = self.request.query_params.get('language')

            if group_id:
                queryset = queryset.filter(groups__id=group_id)
            if language:
                queryset = queryset.filter(language=language)

            return queryset.distinct()
        except Exception as e:
            logger.error(f"Error in WordViewSet.get_queryset: {e}")
            return Word.objects.none()

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in WordViewSet.list: {e}")
            return Response({'error': 'Failed to fetch words'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudyActivityViewSet(viewsets.ModelViewSet):
    queryset = StudyActivity.objects.all()
    serializer_class = StudyActivitySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in StudyActivityViewSet.list: {e}")
            return Response({'error': 'Failed to fetch activities'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def start_session(self, request, pk=None):
        try:
            activity = self.get_object()
            session = StudySession.objects.create(activity=activity, user=request.user)
            serializer = StudySessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error in start_session: {e}")
            return Response({'error': 'Failed to start session'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete_session(self, request, pk=None):
        try:
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
        except Exception as e:
            logger.error(f"Error in complete_session: {e}")
            return Response({'error': 'Failed to complete session'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StudySessionViewSet(viewsets.ModelViewSet):
    queryset = StudySession.objects.all()
    serializer_class = StudySessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            return StudySession.objects.filter(user=self.request.user)
        except Exception as e:
            logger.error(f"Error in StudySessionViewSet.get_queryset: {e}")
            return StudySession.objects.none()

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            logger.error(f"Error in StudySessionViewSet.perform_create: {e}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in StudySessionViewSet.list: {e}")
            return Response({'error': 'Failed to fetch sessions'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stats(self, request):
        try:
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
        except Exception as e:
            logger.error(f"Error in StudySessionViewSet.stats: {e}")
            return Response({'error': 'Failed to fetch statistics'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard(self, request):
        try:
            sessions = self.get_queryset()
            completed_sessions = sessions.filter(completed_at__isnull=False)
            total_sessions = sessions.count()
            total_words = Word.objects.count()
            studied_words = WordProgress.objects.filter(user=request.user).count()
            average_mastery = WordProgress.objects.filter(user=request.user).aggregate(
                average=models.Avg('mastery_level')
            )['average'] or 0

            last_session = sessions.first()
            session_data = {
                'id': last_session.id if last_session else 0,
                'activity': last_session.activity.name if last_session else 'No sessions',
                'group': last_session.activity.groups.first().name if last_session and last_session.activity.groups.exists() else 'All',
                'date': last_session.started_at if last_session else 'N/A',
                'correct': last_session.correct_answers if last_session else 0,
                'wrong': (last_session.total_questions - last_session.correct_answers) if last_session else 0,
            }

            average_score = completed_sessions.filter(score__isnull=False).aggregate(
                average=models.Avg('score')
            )['average'] or 0

            from datetime import timedelta
            today = timezone.now().date()
            streak = 0
            check_date = today
            while completed_sessions.filter(completed_at__date=check_date).exists():
                streak += 1
                check_date -= timedelta(days=1)

            return Response({
                'last_session': session_data,
                'progress': {
                    'studied': studied_words,
                    'total': total_words,
                    'mastery': round((float(average_mastery) / 5) * 100),
                },
                'quick_stats': {
                    'success_rate': round(float(average_score)),
                    'total_sessions': total_sessions,
                    'active_groups': Group.objects.count(),
                    'streak': streak,
                },
            })
        except Exception as e:
            logger.error(f"Error in StudySessionViewSet.dashboard: {e}")
            return Response({'error': 'Failed to fetch dashboard data'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WordProgressViewSet(viewsets.ModelViewSet):
    serializer_class = WordProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            return WordProgress.objects.filter(user=self.request.user)
        except Exception as e:
            logger.error(f"Error in WordProgressViewSet.get_queryset: {e}")
            return WordProgress.objects.none()

    def perform_create(self, serializer):
        try:
            serializer.save(user=self.request.user)
        except Exception as e:
            logger.error(f"Error in WordProgressViewSet.perform_create: {e}")
            raise

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error in WordProgressViewSet.list: {e}")
            return Response({'error': 'Failed to fetch word progress'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def record(self, request):
        word_id = request.data.get('word_id')
        is_correct = request.data.get('correct')
        if word_id is None or not isinstance(is_correct, bool):
            return Response({'error': 'word_id and boolean correct are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            progress, _ = WordProgress.objects.get_or_create(user=request.user, word_id=word_id)
            if is_correct:
                progress.correct_count += 1
            else:
                progress.wrong_count += 1
            progress.last_reviewed = timezone.now()
            progress.mastery_level = max(0, min(5, progress.correct_count // 2 - progress.wrong_count))
            progress.save()
            return Response({
                'id': progress.id,
                'word_id': progress.word_id,
                'correct_count': progress.correct_count,
                'wrong_count': progress.wrong_count,
                'mastery_level': progress.mastery_level,
            })
        except Word.DoesNotExist:
            return Response({'error': 'Word not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error in WordProgressViewSet.record: {e}")
            return Response({'error': 'Failed to record word progress'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    try:
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.set_password(request.data.get('password'))
            user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Error in register: {e}")
        return Response({'error': 'Registration failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    try:
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
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return Response({'error': 'Login failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        from django.contrib.auth import logout
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f"Error in logout: {e}")
        return Response({'error': 'Logout failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_auth(request):
    try:
        return Response({
            'authenticated': request.user.is_authenticated,
            'user': UserSerializer(request.user).data if request.user.is_authenticated else None
        })
    except Exception as e:
        logger.error(f"Error in check_auth: {e}")
        return Response({
            'authenticated': False,
            'user': None
        })
