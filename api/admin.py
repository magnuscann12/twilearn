from django.contrib import admin
from .models import Group, Word, StudyActivity, StudySession


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name', 'description']


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ['word', 'language', 'translation', 'created_at']
    list_filter = ['language', 'groups']
    search_fields = ['word', 'translation', 'example_sentence']
    filter_horizontal = ['groups']


@admin.register(StudyActivity)
class StudyActivityAdmin(admin.ModelAdmin):
    list_display = ['name', 'activity_type', 'created_at']
    list_filter = ['activity_type']
    search_fields = ['name']
    filter_horizontal = ['groups', 'words']


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['activity', 'started_at', 'completed_at', 'score']
    list_filter = ['activity', 'started_at']
    readonly_fields = ['started_at']
