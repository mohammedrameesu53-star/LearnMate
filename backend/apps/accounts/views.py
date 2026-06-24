from rest_framework.views import APIView
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
from datetime import timedelta
from django.utils import timezone



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
            
        expiry_time = otp_obj.created_at + timedelta(minutes=5)
        if timezone.now() > expiry_time:
            return Response({"message": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)    

        otp_obj.is_used = True
        otp_obj.save()

        user.is_verified = True

        # Generate MFA Secret
        secret = pyotp.random_base32()

        user.mfa_secret = secret

        user.save()

        # Generate QR Code
        totp = pyotp.TOTP(secret)

        uri = totp.provisioning_uri(
            name=user.email,
            issuer_name="LearnMate"
        )

        qr = qrcode.make(uri)

        buffer = BytesIO()

        qr.save(
            buffer,
            format="PNG"
        )

        qr_base64 = base64.b64encode(
            buffer.getvalue()
        ).decode()

        return Response(
            {
                "message":
                "Email verified successfully. Scan QR code to setup MFA.",

                "qr_code":
                qr_base64
            },
            status=status.HTTP_200_OK
        )  
        
class ResendOTPView(APIView):
    
    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
            
        if user.is_verified:
            return Response({"message": "Email is already verified"}, status=status.HTTP_400_BAD_REQUEST)

        # Generate fresh OTP
        otp_code = generate_otp()
        OTP.objects.create(user=user, code=otp_code)

        send_mail(
            subject='LearnMate - Resend Verification Code',
            message=f'Your new verification OTP is {otp_code}. It will expire in 5 minutes.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        return Response({'message': 'A fresh OTP has been sent to your email.'}, status=status.HTTP_200_OK)        
                  
        
        
        
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
        
        
        
#  MFA (Multi-factor authentication) - (after enabling MFA)

class VerifyMFASetupView(APIView):

    def post(self, request):

        serializer = VerifyMFASetupSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ]

        code = serializer.validated_data[
            "code"
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
       
        
        totp = pyotp.TOTP(
            user.mfa_secret
        )
        
        print("SECRET:", user.mfa_secret)
        print("SERVER OTP:", totp.now())
        print("USER OTP:", code)
        

        if not totp.verify(code):

            return Response(
                {
                    "message":
                    "Invalid MFA code"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user.mfa_enabled = True

        user.save()

        return Response(
            {
                "message":
                "Registration completed successfully"
            },
            status=status.HTTP_200_OK
        )        
            


# later logins after enabling MFA

class LoginView(APIView):

    def post(self, request):

        serializer = LoginSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ]

        password = serializer.validated_data[
            "password"
        ]

        user = authenticate(
            email=email,
            password=password
        )
        
        if not user:

            return Response(
                {
                    "message":
                    "Invalid credentials"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        if not user.is_verified:

            return Response(
                {
                    "message":
                    "Email not verified"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.mfa_enabled:

            return Response(
                {
                    "message":
                    "MFA not configured"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "message":
                "Credentials verified",

                "email":
                user.email,

                "mfa_required":
                True
            }
        )
        
        
class VerifyMFAView(APIView):

    def post(self, request):

        serializer = VerifyMFASerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        email = serializer.validated_data[
            "email"
        ]

        code = serializer.validated_data[
            "code"
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

        totp = pyotp.TOTP(
            user.mfa_secret
        )

        if not totp.verify(code):

            return Response(
                {
                    "message":
                    "Invalid MFA code"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        refresh = RefreshToken.for_user(
            user
        )

        return Response(
    {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "role": user.role 
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
        