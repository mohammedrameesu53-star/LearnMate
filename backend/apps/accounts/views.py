from    .views import APIView
from .serializers import *
from rest_framework.response import Response
from rest_framework import status 
from .utils import generate_otp
from .models import User, OTP
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .permissions import (IsAdmin,IsMentor,IsStudent)
import pyotp
import qrcode
import base64
from io import BytesIO
from rest_framework.permissions import IsAuthenticated



class RegisterView(APIView):
    def post(self,request):
        serializer = RegisterSerializer(data = request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "massage":"User Registered Successfully",
                "data":serializer.data
            },status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)  
            

# Email verification after registration

class SendOTPView(APIView):

    def post(self, request):

        serializer = SendOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data['email']

        user = User.objects.filter(
            email=email
        ).first()

        if not user:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        otp_code = generate_otp()

        OTP.objects.create(
            user=user,
            code=otp_code
        )

        send_mail(
            subject='LearnMate Verification',
            message=f'Your OTP is {otp_code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

        return Response(
            {
                'message': 'OTP sent successfully'
            },
            status=status.HTTP_200_OK
        )            
            
          
class VerifyOTPView(APIView):

    def post(self, request):

        serializer = VerifyOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data['email']

        otp = serializer.validated_data['otp']

        user = User.objects.filter(
            email=email
        ).first()

        if not user:
            return Response(
                {"message": "User not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        otp_obj = OTP.objects.filter(
            user=user,
            code=otp,
            is_used=False
        ).last()

        if not otp_obj:

            return Response(
                {
                    "message": "Invalid OTP"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_obj.is_used = True

        otp_obj.save()

        user.is_verified = True

        user.save()

        return Response(
            {
                "message": "Email verified successfully"
            }
        )            
        
        
# Two factor authentication  
        
class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = authenticate(
            email=email,
            password=password
        )

        if user is None:
            return Response(
                {
                    "message": "Invalid credentials"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_verified:
            return Response(
                {
                    "message": "Please verify your email first"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_code = generate_otp()

        OTP.objects.create(
            user=user,
            code=otp_code,
            otp_type="login"
        )

        send_mail(
            subject="LearnMate Login OTP",
            message=f"Your login OTP is {otp_code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False
        )

        return Response(
            {
                "message": "Login OTP sent successfully"
            },
            status=status.HTTP_200_OK
        )
        
class VerifyLoginOTPView(APIView):

    def post(self, request):

        serializer = VerifyLoginOTPSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:

            return Response(
                {
                    "message": "User not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        otp_obj = OTP.objects.filter(
            user=user,
            code=otp,
            otp_type="login",
            is_used=False
        ).last()

        if not otp_obj:

            return Response(
                {
                    "message": "Invalid OTP"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_obj.is_used = True
        otp_obj.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "email": user.email,
                "role": user.role
            },
            status=status.HTTP_200_OK
        )        
        
        
# Reset Password

class ForgotPasswordView(APIView):

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ]

        user = User.objects.filter(
            email=email
        ).first()

        if not user:

            return Response(
                {
                    "message":
                    "User not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        otp_code = generate_otp()

        OTP.objects.create(
            user=user,
            code=otp_code,
            otp_type="password_reset"
        )

        send_mail(
            subject="LearnMate Password Reset OTP",
            message=f"Your OTP is {otp_code}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False
        )

        return Response(
            {
                "message":
                "Reset OTP sent successfully"
            }
        ) 
        
class  ResetPasswordView(APIView):

    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ]

        otp = serializer.validated_data[
            "otp"
        ]

        new_password = serializer.validated_data[
            "new_password"
        ]

        user = User.objects.filter(
            email=email
        ).first()

        if not user:

            return Response(
                {
                    "message":
                    "User not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        otp_obj = OTP.objects.filter(
            user=user,
            code=otp,
            is_used=False
        ).last()

        if not otp_obj:

            return Response(
                {
                    "message":
                    "Invalid OTP"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(
            new_password
        )

        user.save()

        otp_obj.is_used = True

        otp_obj.save()

        return Response(
            {
                "message":
                "Password reset successful"
            }
        )        
        
        
        
# MFA (Multi-factor authentication) 

class SetupMFAView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user = request.user

        secret = pyotp.random_base32()

        user.mfa_secret = secret
        user.save()

        totp = pyotp.TOTP(secret)

        uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="LearnMate"
        )

        qr = qrcode.make(uri)

        buffer = BytesIO()

        qr.save(buffer, format="PNG")

        qr_base64 = base64.b64encode(
            buffer.getvalue()
        ).decode()

        return Response(
            {
                "message": "Scan this QR code",
                "qr_code": qr_base64
            },
            status=status.HTTP_200_OK
        )        
        
class VerifyMFASetupView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = VerifyMFASetupSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        code = serializer.validated_data["code"]

        totp = pyotp.TOTP(
            request.user.mfa_secret
        )

        if not totp.verify(code):

            return Response(
                {
                    "error": "Invalid code"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        request.user.mfa_enabled = True

        request.user.save()

        return Response(
            {
                "message": "MFA enabled successfully"
            }
        )        
            
        
# RBAC (Role based access control) 

class AdminDashboardView(APIView):
    
    permission_classes = [IsAdmin]

    def get(self,request):

        return Response(
            {
                "message":
                "Welcome Admin"
            }
        )
        
class MentorDashboardView(APIView):

    permission_classes = [IsMentor]

    def get(self,request):

        return Response(
            {
                "message":
                "Welcome Mentor"
            }
        )        
        
class StudentDashboardView(APIView):

    permission_classes = [IsStudent]

    def get(self,request):
        
        return Response(
            {
                "message":
                "Welcome Student"
            }
        )        