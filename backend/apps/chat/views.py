from django.shortcuts import render

# Create your views here.
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import]
from rest_framework.exceptions import PermissionDenied
# pyrefly: ignore [missing-import]
from rest_framework import status
from django.db.models import Q


from .models import ChatRoom, Message,GroupChat,GroupMessage
from .serializers import MessageSerializer,ChatRoomSerializer,GroupChatSerializer,GroupMessageSerializer


class ChatHistoryView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, room_id):

        room = ChatRoom.objects.get(id=room_id)

        if request.user not in [room.user1, room.user2]:
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

                Q(user1=request.user) |
                Q(user2=request.user)

            ).order_by("-updated_at")

        serializer = ChatRoomSerializer(
            rooms,
            many=True
        )

        return Response(serializer.data)
        

class MarkMessagesReadView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, room_id):

        room = ChatRoom.objects.get(id=room_id)

        if request.user not in [room.user1, room.user2]:
            return Response(
                {"detail": "Permission denied."},
                status=403
            )

        updated = Message.objects.filter(
            room=room,
            receiver=request.user,
            is_read=False
        ).update(is_read=True)

        return Response({
            "messages_marked_read": updated
        })

        
class GroupChatListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        if user.role == "admin":

            groups = GroupChat.objects.filter(
                Q(created_by=user) |
                Q(members__user=user)
            ).distinct()

        elif user.role == "mentor":

            groups = GroupChat.objects.filter(
                Q(created_by=user) |
                Q(members__user=user)
            ).distinct()

        else:   # student

            groups = GroupChat.objects.filter(
                members__user=user
            ).distinct()

        serializer = GroupChatSerializer(groups, many=True)

        return Response(serializer.data)



class GroupMessageListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, group_id):

        user = request.user

        try:

            group = GroupChat.objects.get(
                id=group_id
            )

        except GroupChat.DoesNotExist:

            return Response(
                {
                    "error": "Group not found."
                },
                status=404
            )

        if (
            user != group.created_by and
            not group.members.filter(user=user).exists()
        ):

            return Response(
                {
                    "error": "You are not a member of this group."
                },
                status=403
            )

        messages = GroupMessage.objects.filter(
            group=group
        ).order_by("created_at")

        serializer = GroupMessageSerializer(
            messages,
            many=True
        )

        return Response(serializer.data)


class CreateGroupView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        if user.role != "mentor":

            return Response(
                {
                    "error": "Only mentors can create groups."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = GroupChatSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(
                created_by=user
            )

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )        