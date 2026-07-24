from django.db import models
# pyrefly: ignore [missing-import]
from apps.accounts.models import User
from django.contrib.auth import get_user_model
User = get_user_model()

class Subject(models.Model):
    """High-level category classification (e.g., Physics, Chemistry, Biology, Mathematics)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Course(models.Model):
    """Specific course mapped directly under an educational Subject field"""
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='courses', null=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    code = models.CharField(max_length=50, unique=True) # e.g., 'PHY-301'
    difficulty = models.CharField(max_length=50, default="Beginner")
    lessons_count = models.IntegerField(default=0) # Automatically updated dynamically

    def __str__(self):
        return f"[{self.code}] {self.title}"


class Chapter(models.Model):
    """Sequential operational modules inside a parent Course container"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='chapters')
    title = models.CharField(max_length=255)
    order = models.IntegerField(default=1) # Controls order of chapters (1, 2, 3...)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.code} - Ch.{self.order}: {self.title}"

class Lesson(models.Model):
    """The bite-sized material resource lines (lectures, video URLs, markdown pages)"""
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=255)
    content_text = models.TextField(blank=True)
    order = models.IntegerField(default=1) # Controls order inside the chapter

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Ch.{self.chapter.order} Lesson {self.order}: {self.title}"

class LessonProgress(models.Model):
    """The progress bridge logging exact time stamps when a student completes a lesson"""
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_progress_logs')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='completed_by_students')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'lesson')

    def __str__(self):
        return f"{self.student.email} completed {self.lesson.title}"


class CourseEnrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.email} - {self.course.title} ({self.progress}%)"

