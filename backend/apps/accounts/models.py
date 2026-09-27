import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta



class User(AbstractUser):

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('mentor', 'Mentor'),
        ('student', 'Student'),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    email = models.EmailField(
        unique=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student' 
    )

    is_verified = models.BooleanField(
        default=False
    )

    mfa_enabled = models.BooleanField(
        default=False
    )
    
    mfa_secret = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    def __str__(self):
        return self.email
    
    
class OTP(models.Model):
    
    OTP_TYPES = (
        ('email_verification', 'Email Verification'),
        ('login', 'Login'),
        ('password_reset', 'Password Reset'),
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    code = models.CharField(
        max_length=6
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    is_used = models.BooleanField(
        default=False
    )
    
    otp_type = models.CharField(
        max_length=30,
        choices=OTP_TYPES,
        default='email_verification'
    )

    def __str__(self):
        return f"{self.user.email} - {self.code}"


class MentorInvite(models.Model):
    email = models.EmailField()
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    invited_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_invites'
    )
    is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=3)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

