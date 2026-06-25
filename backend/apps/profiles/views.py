from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import *
from .serializers import *
from apps.accounts.permissions import IsStudent,IsMentor

class StudentProfileView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsStudent
    ]

    def get(self, request):

        try:
            profile = request.user.student_profile

        except StudentProfile.DoesNotExist:

            return Response(
                {
                    "error": "Student profile not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StudentProfileSerializer(
            profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )
        
    def put(self, request):

        profile = request.user.student_profile

        serializer = StudentProfileSerializer(
            profile,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
        
        
class MentorProfileView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsMentor
    ]

    def get(self, request):

        profile = request.user.mentor_profile

        serializer = MentorProfileSerializer(
            profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request):

        profile = request.user.mentor_profile

        serializer = MentorProfileSerializer(
            profile,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )        