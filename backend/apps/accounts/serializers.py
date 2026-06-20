from rest_framework import serializers
from .models import User


class   RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User

        fields = (
            'username',
            'email',
            'password',
            'role'
        )

    def create(self, validated_data):

        password = validated_data.pop('password')

        user = User(**validated_data)

        user.set_password(password)

        user.save()

        return user
    
    
    
#   Email Varification (Brevo)-registration
    
class SendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()
    
class VerifyOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6
    )    
    
    
# Two factor authentication  

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField()    
    
class VerifyLoginOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6
    )    
    
    
#  MFA (Multi-factor authentication)    

class VerifyMFASetupSerializer(
    serializers.Serializer
):

    code = serializers.CharField(
        max_length=6
    )
    
class VerifyMFASerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    code = serializers.CharField(
        max_length=6
    )    


# Reset Password

class ForgotPasswordSerializer(
    serializers.Serializer
):

    email = serializers.EmailField()
    
    
class ResetPasswordSerializer(
    serializers.Serializer
):

    email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6
    )

    new_password = serializers.CharField(
        min_length=8,
        write_only=True
    )    
    
   