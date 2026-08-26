from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Group, Word, StudyActivity, StudySession, WordProgress


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}


class GroupSerializer(serializers.ModelSerializer):
    word_count = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = ['id', 'name', 'description', 'word_count', 'created_at', 'updated_at']

    def get_word_count(self, obj):
        return obj.words.count()


class WordSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        source='groups', many=True, queryset=Group.objects.all(), write_only=True, required=False
    )
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Word
        fields = ['id', 'word', 'language', 'translation', 'pronunciation', 
                  'example_sentence', 'example_translation', 'groups', 'group_ids',
                  'progress', 'created_at', 'updated_at']

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                progress = obj.progress.get(user=request.user)
                return WordProgressSerializer(progress).data
            except WordProgress.DoesNotExist:
                return None
        return None

    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user
        word = Word.objects.create(**validated_data)
        word.groups.set(groups)
        return word


class StudyActivitySerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    words = WordSerializer(many=True, read_only=True)
    group_ids = serializers.PrimaryKeyRelatedField(
        source='groups', many=True, queryset=Group.objects.all(), write_only=True, required=False
    )
    word_ids = serializers.PrimaryKeyRelatedField(
        source='words', many=True, queryset=Word.objects.all(), write_only=True, required=False
    )

    class Meta:
        model = StudyActivity
        fields = ['id', 'name', 'activity_type', 'groups', 'words', 
                  'group_ids', 'word_ids', 'created_at', 'updated_at']

    def create(self, validated_data):
        groups = validated_data.pop('groups', [])
        words = validated_data.pop('words', [])
        activity = StudyActivity.objects.create(**validated_data)
        activity.groups.set(groups)
        activity.words.set(words)
        return activity


class StudySessionSerializer(serializers.ModelSerializer):
    activity = StudyActivitySerializer(read_only=True)
    activity_id = serializers.PrimaryKeyRelatedField(
        source='activity', queryset=StudyActivity.objects.all(), write_only=True
    )
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudySession
        fields = ['id', 'activity', 'activity_id', 'user', 'started_at', 'completed_at', 
                  'score', 'total_questions', 'correct_answers']


class WordProgressSerializer(serializers.ModelSerializer):
    word = WordSerializer(read_only=True)
    word_id = serializers.PrimaryKeyRelatedField(
        source='word', queryset=Word.objects.all(), write_only=True
    )

    class Meta:
        model = WordProgress
        fields = ['id', 'word', 'word_id', 'correct_count', 'wrong_count', 
                  'last_reviewed', 'next_review', 'mastery_level']
