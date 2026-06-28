from django.db import models
from apps.accounts.models import User

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    code = models.CharField(max_length=50, unique=True)
    difficulty = models.CharField(max_length=50, default="Beginner")
    lessons_count = models.IntegerField(default=1)

    def __str__(self):
        return self.title

class CourseEnrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    progress = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('student', 'course')

    def __str__(self):
        return f"{self.student.email} - {self.course.title} ({self.progress}%)"

class StudentActivity(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="activities")
    activity_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100)  # Assignment, Lesson, Quiz
    status = models.CharField(max_length=50)     # COMPLETED, PENDING
    timestamp = models.CharField(max_length=100) # e.g. "2 hours ago", "Yesterday"
    score = models.CharField(max_length=50, default="-")

    def __str__(self):
        return f"{self.student.email} - {self.activity_name}"

class StudentStreak(models.Model):
    student = models.OneToOneField(User, on_delete=models.CASCADE, related_name="streak")
    days = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.student.email} - {self.days} Days"

class Resource(models.Model):
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=50)
    file_type = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Message(models.Model):
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    receiver_name = models.CharField(max_length=255)
    text = models.TextField()
    timestamp = models.CharField(max_length=100)
    is_read = models.BooleanField(default=False)
    initials = models.CharField(max_length=10, default="JV")

    def __str__(self):
        return f"To {self.receiver_name}: {self.text[:30]}"

class AIChatMessage(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="ai_chat_messages")
    sender = models.CharField(max_length=10)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender}: {self.text[:30]}"
