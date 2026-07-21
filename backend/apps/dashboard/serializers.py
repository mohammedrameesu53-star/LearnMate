# pyrefly: ignore [missing-import]
from rest_framework import serializers
# pyrefly: ignore [missing-import]
from apps.accounts.models import User
from .models import Subject, Course, Chapter, Lesson, LessonProgress

class RecentUserSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [
            "email",
            "role",
            "created_at"
        ]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content_text', 'order']

class ChapterSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Chapter
        fields = ['id', 'title', 'order', 'lessons']

class CourseDetailSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'code', 'difficulty', 'subject_name', 'chapters']
