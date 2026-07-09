from django.db import models
from apps.accounts.models import User

# Create your models here.
class ChatRoom(models.Model):

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="student_rooms"
    )

    mentor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="mentor_rooms"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = ("student", "mentor")

    def __str__(self):
        return f"{self.student.email} ↔ {self.mentor.email}"

class Message(models.Model):

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="sent_chat_messages"
    )

    receiver = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="received_chat_messages"
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.sender.email} → {self.receiver.email}"      


class GroupChat(models.Model):

    name = models.CharField(max_length=100)

    mentor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="group_chats"
    )

    created_at = models.DateTimeField(auto_now_add=True)          