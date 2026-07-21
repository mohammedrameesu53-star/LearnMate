# pyrefly: ignore [missing-import]
from rest_framework import serializers
from .models import Message,ChatRoom,GroupMember,GroupMessage,GroupChat
 

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

    user1 = serializers.SerializerMethodField()
    user2 = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = [
            "id",
            "user1",
            "user2",
            "last_message",
            "updated_at",
        ]

    def get_user1(self, obj):
        return {
            "id": str(obj.user1.id),
            "email": obj.user1.email,
            "role": obj.user1.role,
        }

    def get_user2(self, obj):
        return {
            "id": str(obj.user2.id),
            "email": obj.user2.email,
            "role": obj.user2.role,
        }

    def get_last_message(self, obj):

        last_message = obj.messages.order_by("-created_at").first()

        if last_message:
            return last_message.message

        return None


class GroupMemberSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = GroupMember
        fields = [
            "id",
            "user",
            "joined_at",
        ]

    def get_user(self, obj):
        return {
            "id": str(obj.user.id),
            "email": obj.user.email,
            "role": obj.user.role,
        }


class GroupMessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = GroupMessage
        fields = [
            "id",
            "group",
            "sender",
            "message",
            "created_at",
        ]

    def get_sender(self, obj):
        return {
            "id": str(obj.sender.id),
            "email": obj.sender.email,
            "role": obj.sender.role,
        }


class GroupChatSerializer(serializers.ModelSerializer):

    class Meta:
        model = GroupChat
        fields = "__all__"  
        read_only_fields = ["created_by"]      