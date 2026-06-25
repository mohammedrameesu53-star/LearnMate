from rest_framework import serializers
from .models import *

class StudentProfileSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = StudentProfile

        fields = [
            "bio",
            "grade",
            "learning_goal"
        ]
        
class MentorProfileSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = MentorProfile

        fields = [
            "specialization",
            "experience"
        ]        