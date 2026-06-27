from django.contrib import admin
from .models import Course, CourseEnrollment, StudentActivity, StudentStreak, Resource, Message, AIChatMessage

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'difficulty', 'lessons_count')

@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'progress', 'is_active')

@admin.register(StudentActivity)
class StudentActivityAdmin(admin.ModelAdmin):
    list_display = ('student', 'activity_name', 'category', 'status', 'timestamp', 'score')

@admin.register(StudentStreak)
class StudentStreakAdmin(admin.ModelAdmin):
    list_display = ('student', 'days')

@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'size', 'file_type', 'course')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver_name', 'text', 'timestamp', 'is_read')

@admin.register(AIChatMessage)
class AIChatMessageAdmin(admin.ModelAdmin):
    list_display = ('student', 'sender', 'text', 'timestamp')
