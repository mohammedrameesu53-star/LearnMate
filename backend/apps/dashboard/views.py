from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response

from apps.accounts.permissions import (
    IsAdmin,
    IsMentor,
    IsStudent
)

class StudentDashboardView(APIView):

    permission_classes = [IsStudent]

    def get(self, request):

        return Response(
            {
                "name": request.user.username,
                "role": request.user.role,
                "message": "Student Dashboard"
            }
        )
        

class MentorDashboardView(APIView):

    permission_classes = [IsMentor]

    def get(self, request):

        return Response(
            {
                "name": request.user.username,
                "role": request.user.role,
                "message": "Mentor Dashboard"
            }
        )
        
class AdminDashboardView(APIView):

    permission_classes = [IsAdmin]

    def get(self, request):

        return Response(
            {
                "name": request.user.username,
                "role": request.user.role,
                "message": "Admin Dashboard"
            }
        )                