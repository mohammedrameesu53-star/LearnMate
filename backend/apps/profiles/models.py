from django.db import models

# Create your models here.
from django.db import models
from apps.accounts.models import User


class StudentProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile"
    )

    bio = models.TextField(blank=True)

    grade = models.CharField(
        max_length=50,
        blank=True
    )

    learning_goal = models.TextField(
        blank=True
    )

    def __str__(self):
        return self.user.email


class MentorProfile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="mentor_profile"
    )

    specialization = models.CharField(
        max_length=100,
        blank=True
    )

    experience = models.IntegerField(
        default=0
    )

    def __str__(self):
        return self.user.email