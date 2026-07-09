from rest_framework import serializers
from .models import *

class StudentProfileSerializer(
    serializers.ModelSerializer
):
    id = serializers.ReadOnlyField(source='user.id')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = StudentProfile

        fields = [
            "id",
            "username",
            "email",
            "bio",
            "grade",
            "learning_goal"
        ]
        
class MentorProfileSerializer(
    serializers.ModelSerializer
):
    id = serializers.ReadOnlyField(source='user.id')
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = MentorProfile

        fields = [
            "id",
            "username",
            "email",
            "specialization",
            "experience"
        ]        