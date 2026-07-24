from django.contrib import admin
from .models import Course,Subject,Chapter,Lesson,LessonProgress

@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('subject', 'title', 'code', 'difficulty', 'lessons_count')

@admin.register(Chapter)
class ChapterAdmin(admin.ModelAdmin):
    list_display = ('course', 'title', 'order')

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('chapter', 'title', 'order')

@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'lesson', 'is_completed','completed_at')
    
    




