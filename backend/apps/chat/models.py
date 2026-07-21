from django.db import models
# pyrefly: ignore [missing-import]
from apps.accounts.models import User

# Create your models here.
class ChatRoom(models.Model):

    user1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chats_as_user1"
    )

    user2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chats_as_user2"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = ("user1", "user2")

    def __str__(self):
        return f"{self.user1.email} ↔ {self.user2.email}"

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

    GROUP_TYPES = [
        ("student_batch", "Student Batch"),
        ("mentor_group", "Mentor Group"),
    ]

    name = models.CharField(max_length=100)

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_groups"
    )

    group_type = models.CharField(
        max_length=20,
        choices=GROUP_TYPES,
        default="student_batch"
    )

    created_at = models.DateTimeField(auto_now_add=True) 

    def __str__(self):
        return f"{self.name}"

class GroupMember(models.Model):

    group = models.ForeignKey(
        GroupChat,
        on_delete=models.CASCADE,
        related_name="members"
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    joined_at = models.DateTimeField(auto_now_add=True)   

    class Meta:
        unique_together = ("group", "user")

    def __str__(self):
        return f"{self.user.email} → {self.group.name}"  


    
class GroupMessage(models.Model):

    group = models.ForeignKey(
        GroupChat,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True
    )        

    def __str__(self):
        return f"Messsage send by {self.sender.email}"  
    