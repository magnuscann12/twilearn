from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Group(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Word(models.Model):
    TWI = 'twi'
    ENGLISH = 'en'
    LANGUAGE_CHOICES = [
        (TWI, 'Twi'),
        (ENGLISH, 'English'),
    ]

    word = models.CharField(max_length=200)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)
    translation = models.CharField(max_length=200, blank=True)
    pronunciation = models.CharField(max_length=200, blank=True)
    example_sentence = models.TextField(blank=True)
    example_translation = models.TextField(blank=True)
    groups = models.ManyToManyField(Group, related_name='words', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['word']

    def __str__(self):
        return self.word


class StudyActivity(models.Model):
    FLASHCARDS = 'flashcards'
    QUIZ = 'quiz'
    MATCHING = 'matching'
    ACTIVITY_TYPE_CHOICES = [
        (FLASHCARDS, 'Flashcards'),
        (QUIZ, 'Quiz'),
        (MATCHING, 'Matching'),
    ]

    name = models.CharField(max_length=200)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPE_CHOICES)
    groups = models.ManyToManyField(Group, related_name='study_activities', blank=True)
    words = models.ManyToManyField(Word, related_name='study_activities', blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class StudySession(models.Model):
    activity = models.ForeignKey(StudyActivity, on_delete=models.CASCADE, related_name='sessions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.IntegerField(null=True, blank=True)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.activity.name} - {self.started_at.strftime('%Y-%m-%d %H:%M')}"


class WordProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='word_progress')
    word = models.ForeignKey(Word, on_delete=models.CASCADE, related_name='progress')
    correct_count = models.IntegerField(default=0)
    wrong_count = models.IntegerField(default=0)
    last_reviewed = models.DateTimeField(null=True, blank=True)
    next_review = models.DateTimeField(null=True, blank=True)
    mastery_level = models.IntegerField(default=0)  # 0-5 scale
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'word']
        ordering = ['-last_reviewed']

    def __str__(self):
        return f"{self.user.username} - {self.word.word} ({self.mastery_level})"
