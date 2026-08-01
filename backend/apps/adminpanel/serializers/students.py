# pyrefly: ignore [missing-import]
from rest_framework import serializers
# pyrefly: ignore [missing-import]
from apps.accounts.models import User


class AdminStudentListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_verified",
            "mfa_enabled",
            "is_active",
            "created_at",
        ]


class AdminStudentDetailSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "role",
            "is_verified",
            "mfa_enabled",
            "is_active",
            "created_at",
            "updated_at",
        ]