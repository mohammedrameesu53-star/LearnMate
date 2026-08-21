from django.db.models import Q
# pyrefly: ignore [missing-import] 
from rest_framework.views import APIView
# pyrefly: ignore [missing-import] 
from rest_framework.response import Response
# pyrefly: ignore [missing-import] 
from rest_framework import status
# pyrefly: ignore [missing-import] 
from rest_framework.permissions import IsAuthenticated
# pyrefly: ignore [missing-import] 
from apps.accounts.permissions import IsAdmin
# pyrefly: ignore [missing-import] 
from apps.accounts.models import User
# pyrefly: ignore [missing-import] 
from apps.adminpanel.serializers.mentors import (
    AdminMentorListSerializer,
    AdminMentorDetailSerializer,
)

class AdminMentorListAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):

        search = request.GET.get("search")

        mentors = User.objects.filter(
            role="mentor"
        ).order_by("-created_at")

        if search:
            mentors = mentors.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search)
            )

        serializer = AdminMentorListSerializer(
            mentors,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class AdminMentorDetailAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, mentor_id):

        try:
            mentor = User.objects.get(
                id=mentor_id,
                role="mentor"
            )

            serializer = AdminMentorDetailSerializer(
                mentor
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Mentor not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

class AdminMentorStatusAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def patch(self, request, mentor_id):

        try:
            mentor = User.objects.get(
                id=mentor_id,
                role="mentor"
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Mentor not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        mentor.is_active = not mentor.is_active
        mentor.save(update_fields=["is_active"])

        return Response(
            {
                "message": (
                    "Mentor activated successfully."
                    if mentor.is_active
                    else "Mentor suspended successfully."
                ),
                "is_active": mentor.is_active
            },
            status=status.HTTP_200_OK
        )


class AdminMentorDeleteAPIView(APIView):

    permission_classes = [IsAuthenticated, IsAdmin]

    def delete(self, request, mentor_id):

        try:
            mentor = User.objects.get(
                id=mentor_id,
                role="mentor"
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "Mentor not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        mentor.delete()

        return Response(
            {
                "message": "Mentor deleted successfully."
            },
            status=status.HTTP_204_NO_CONTENT
        )        

# apps.adminpanel.views.py 