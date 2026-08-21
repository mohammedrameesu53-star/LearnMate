# pyrefly: ignore [missing-import]
from rest_framework import serializers

from .models import (
    Course,
    Module,
    Lesson,
    LessonResource,
    Enrollment,
    LessonProgress,
)

class CourseSerializer(serializers.ModelSerializer):

    class Meta:
        model = Course
        fields = "__all__"
        read_only_fields = ["mentor"]

class ModuleSerializer(serializers.ModelSerializer):

    class Meta:
        model = Module
        fields = "__all__"

class LessonSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lesson
        fields = "__all__"

    def validate(self, data):
        source_type = data.get("source_type", getattr(self.instance, "source_type", "youtube"))
        if source_type == "youtube" and not data.get("video_url") and not getattr(self.instance, "video_url", None):
            raise serializers.ValidationError("video_url is required when source_type is 'youtube'.")
        if source_type == "upload" and not data.get("video_file") and not getattr(self.instance, "video_file", None):
            raise serializers.ValidationError("video_file is required when source_type is 'upload'.")
        return data    

class LessonResourceSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonResource
        fields = "__all__"
        read_only_fields = ["lesson"]

class EnrollmentSerializer(serializers.ModelSerializer):

    course_title = serializers.CharField(
        source="course.title",
        read_only=True
    )

    thumbnail = serializers.ImageField(
        source="course.thumbnail",
        read_only=True
    )

    mentor = serializers.EmailField(
        source="course.mentor.email",
        read_only=True
    )

    class Meta:

        model = Enrollment

        fields = [
            "id",
            "course",
            "course_title",
            "thumbnail",
            "mentor",
            "enrolled_at",
        ]

class LessonProgressSerializer(serializers.ModelSerializer):

    class Meta:
        model = LessonProgress
        fields = "__all__"


class CourseStudentSerializer(serializers.ModelSerializer):

    student_id = serializers.UUIDField(
        source="student.id",
        read_only=True
    )

    student_name = serializers.SerializerMethodField()

    email = serializers.EmailField(
        source="student.email",
        read_only=True
    )

    progress = serializers.SerializerMethodField()

    completed = serializers.SerializerMethodField()

    class Meta:

        model = Enrollment

        fields = [
            "student_id",
            "student_name",
            "email",
            "enrolled_at",
            "progress",
            "completed",
        ]

    def get_student_name(self, obj):

        return (
            obj.student.get_full_name()
            or obj.student.username
            or obj.student.email
        )

    def get_progress(self, obj):

        total_lessons = Lesson.objects.filter(
            module__course=obj.course
        ).count()

        completed_lessons = LessonProgress.objects.filter(
            student=obj.student,
            lesson__module__course=obj.course,
            is_completed=True
        ).count()

        if total_lessons == 0:
            return 0

        return round(
            (completed_lessons / total_lessons) * 100,
            2
        )

    def get_completed(self, obj):

        return self.get_progress(obj) == 100



class CompletedLessonSerializer(serializers.ModelSerializer):

    completed_at = serializers.DateTimeField(read_only=True)

    lesson_id = serializers.IntegerField(
        source="lesson.id",
        read_only=True
    )

    lesson_title = serializers.CharField(
        source="lesson.title",
        read_only=True
    )

    class Meta:

        model = LessonProgress

        fields = [
            "lesson_id",
            "lesson_title",
            "completed_at",
        ]

        


