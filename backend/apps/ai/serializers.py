# pyrefly: ignore [missing-import]
from rest_framework import serializers

class AIChatSerializer(serializers.Serializer):
    message = serializers.CharField()
    course_id = serializers.IntegerField(required=False, allow_null=True)
    lesson_id = serializers.IntegerField(required=False, allow_null=True)
