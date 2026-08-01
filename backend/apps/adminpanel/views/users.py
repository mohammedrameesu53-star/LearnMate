from django.shortcuts import get_object_or_404

# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import]
from apps.accounts.models import User
# pyrefly: ignore [missing-import]
from apps.accounts.permissions import IsAdmin
# pyrefly: ignore [missing-import]
from apps.adminpanel.serializers.users import (
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserUpdateSerializer,
)

class AdminUserListAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = User.objects.all().order_by("-created_at")

        serializer = AdminUserListSerializer(users, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserAPIView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            serializer = AdminUserDetailSerializer(user)

            return Response(serializer.data)

        except User.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    def patch(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            serializer = AdminUserUpdateSerializer(
                user,
                data=request.data,
                partial=True
            )

            if serializer.is_valid():
                serializer.save()

                return Response(serializer.data)

            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        except User.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

    def delete(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)

            user.delete()

            return Response(
                {"message": "User deleted successfully"},
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )        