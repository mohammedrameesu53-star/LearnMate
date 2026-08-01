from django.shortcuts import render
# pyrefly: ignore [missing-import] 
from rest_framework.views import APIView
# pyrefly: ignore [missing-import] 
from apps.accounts.models import User
# pyrefly: ignore [missing-import] 
from apps.adminpanel.serializers.users import RecentUserSerializer
# pyrefly: ignore [missing-import] 
from rest_framework.response import Response
# pyrefly: ignore [missing-import] 
from apps.accounts.permissions import IsAdmin

# Create your views here.

class AdminDashboardView(APIView):
        permission_classes = [IsAdmin]

        def get(self, request):
            total_users = User.objects.count()
            total_students = User.objects.filter(role="student").count()
            total_mentors = User.objects.filter(role="mentor").count()
            total_admins = User.objects.filter(role="admin").count()
            verified_users = User.objects.filter(is_verified=True).count()
            unverified_users = User.objects.filter(is_verified=False).count()
            mfa_enabled_users = User.objects.filter(mfa_enabled=True).count()
            recent_users = User.objects.order_by("-created_at")[:5]
            serializer = RecentUserSerializer(recent_users,many=True)

            return Response({

        "statistics": {

            "total_users": total_users,

            "total_students": total_students,

            "total_mentors": total_mentors,

            "total_admins": total_admins,

            "verified_users": verified_users,

            "unverified_users": unverified_users,

            "mfa_enabled_users": mfa_enabled_users,

        },

        "recent_users": serializer.data

    })