from django.shortcuts import render, get_object_or_404
# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import ChatRoom, Message
from .serializers import MessageSerializer, ChatRoomSerializer


class ChatHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):

        room = get_object_or_404(ChatRoom, id=room_id)

        if request.user not in [room.student, room.mentor]:
            raise PermissionDenied(
                "You are not allowed to access this chat."
            )

        messages = Message.objects.filter(
            room=room
        ).order_by("created_at")

        serializer = MessageSerializer(
            messages,
            many=True
        )

        return Response(serializer.data)


class ChatRoomListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        rooms = ChatRoom.objects.filter(
            student=request.user
        ) | ChatRoom.objects.filter(
            mentor=request.user
        )

        rooms = rooms.order_by("-updated_at")

        serializer = ChatRoomSerializer(
            rooms,
            many=True
        )

        return Response(serializer.data)


class MarkMessagesReadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, room_id):

        room = get_object_or_404(ChatRoom, id=room_id)

        if request.user not in [room.student, room.mentor]:
            raise PermissionDenied("You are not allowed to access this chat.")

        updated = Message.objects.filter(
            room=room,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({
            "messages_marked_read": updated
        })



