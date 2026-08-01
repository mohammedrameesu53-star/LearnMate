# pyrefly: ignore
from rest_framework import serializers
# pyrefly: ignore
from apps.courses.models import (
    Course,
    Module,
    Lesson,
    LessonResource,
)

from .users import MentorSerializer

class AdminLessonResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonResource
        fields = "__all__"

class AdminLessonSerializer(serializers.ModelSerializer):

    resources = AdminLessonResourceSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Lesson
        fields = "__all__"        

class AdminModuleSerializer(serializers.ModelSerializer):

    lessons = AdminLessonSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Module
        fields = "__all__"        


class AdminCourseListSerializer(serializers.ModelSerializer):

    mentor = MentorSerializer(read_only=True)
    module_count = serializers.IntegerField(read_only=True)
    lesson_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Course

        fields = [
            "id",
            "thumbnail",
            "title",
            "mentor",
            "module_count",
            "lesson_count",
            "level",
            "status",
            "created_at",
        ]


class AdminCourseDetailSerializer(serializers.ModelSerializer):

    mentor = MentorSerializer(read_only=True)

    modules = AdminModuleSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Course
        fields = "__all__"