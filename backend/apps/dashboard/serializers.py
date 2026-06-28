from rest_framework import serializers
from apps.accounts.models import User

class RecentUserSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [
            "email",
            "role",
            "created_at"
        ]
