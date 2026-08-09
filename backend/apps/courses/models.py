from django.db import models

# Create your models here.
# pyrefly: ignore [missing-import]
from apps.accounts.models import User


class Course(models.Model):

    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("published", "Published"),
        ("rejected", "Rejected"),
    ]

    title = models.CharField(max_length=255)

    description = models.TextField()

    thumbnail = models.ImageField(
        upload_to="course_thumbnails/",
        blank=True,
        null=True
    )

    mentor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="courses"
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES
    )

    duration = models.CharField(
        max_length=100
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title


class Module(models.Model):

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="modules"
    )

    title = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True
    )

    order = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):

    LESSON_TYPE_CHOICES = [
        ("video", "Video"),
        ("pdf", "PDF"),
        ("quiz", "Quiz"),
        ("assignment", "Assignment"),
    ]

    TRANSCRIPT_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    module = models.ForeignKey(
        Module,
        on_delete=models.CASCADE,
        related_name="lessons"
    )

    title = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True
    )

    lesson_type = models.CharField(
        max_length=20,
        choices=LESSON_TYPE_CHOICES,
        default="video"
    )

    video_url = models.URLField(
        blank=True,
        null=True
    )

    duration = models.CharField(
        max_length=50,
        blank=True
    )

    order = models.PositiveIntegerField()

    is_preview = models.BooleanField(
        default=False
    )

    transcript = models.TextField(
        blank=True,
        null=True
    )

    transcript_status = models.CharField(
        max_length=20,
        choices=TRANSCRIPT_STATUS_CHOICES,
        default="pending"
    )

    original_transcript = models.TextField(
        blank=True,
        null=True
    )  # raw transcript in the video's spoken language (e.g. Malayalam)
       # `transcript` (already added) now specifically holds the ENGLISH version used for embeddings/RAG

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title

class LessonResource(models.Model):

    RESOURCE_TYPE_CHOICES = [
        ("pdf", "PDF"),
        ("document", "Document"),
        ("image", "Image"),
        ("video", "Video"),
        ("link", "External Link"),
        ("zip", "ZIP File"),
        ("other", "Other"),
    ]

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="resources"
    )

    title = models.CharField(
        max_length=255
    )

    resource_type = models.CharField(
        max_length=20,
        choices=RESOURCE_TYPE_CHOICES,
        default="pdf"
    )

    file = models.FileField(
        upload_to="lesson_resources/",
        blank=True,
        null=True
    )

    external_url = models.URLField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title  


class Enrollment(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="enrollments"
    )

    enrolled_at = models.DateTimeField(
        auto_now_add=True
    )

    is_completed = models.BooleanField(
        default=False
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    class Meta:
        unique_together = ("student", "course")

    def __str__(self):
        return f"{self.student.email} → {self.course.title}"                     

class LessonProgress(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="lesson_progress"
    )

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="progress"
    )

    is_completed = models.BooleanField(
        default=False
    )

    completed_at = models.DateTimeField(
        blank=True,
        null=True
    )

    class Meta:
        unique_together = ("student", "lesson")

    def __str__(self):
        return f"{self.student.email} - {self.lesson.title}"