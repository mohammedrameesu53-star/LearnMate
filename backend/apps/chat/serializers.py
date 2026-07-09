from rest_framework import serializers
from .models import Message,ChatRoom
 

class MessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.ReadOnlyField(source='sender.email')
    receiver_email = serializers.ReadOnlyField(source='receiver.email')

    class Meta:
        model = Message
        fields = [
            "id",
            "room",
            "sender",
            "sender_email",
            "receiver",
            "receiver_email",
            "message",
            "is_read",
            "created_at",
        ]

class ChatRoomSerializer(serializers.ModelSerializer):

    student = serializers.SerializerMethodField()
    mentor = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "student",
            "mentor",
            "last_message",
            "updated_at",
        ]

    def get_student(self, obj):
        return {
            "id": str(obj.student.id),
            "email": obj.student.email,
            "role": obj.student.role,
        }

    def get_mentor(self, obj):
        return {
            "id": str(obj.mentor.id),
            "email": obj.mentor.email,
            "role": obj.mentor.role,
        }

    def get_last_message(self, obj):

        last_message = obj.messages.order_by("-created_at").first()

        if last_message:
            return last_message.message

        return None