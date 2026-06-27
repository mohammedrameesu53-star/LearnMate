from rest_framework import serializers
from .models import *

class StudentProfileSerializer(
    serializers.ModelSerializer
):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = StudentProfile

        fields = [
            "username",
            "email",
            "bio",
            "grade",
            "learning_goal"
        ]
        
class MentorProfileSerializer(
    serializers.ModelSerializer
):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = MentorProfile

        fields = [
            "username",
            "email",
            "specialization",
            "experience"
        ]        