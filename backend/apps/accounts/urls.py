from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView


urlpatterns = [
     # Registration
    path('register/', RegisterView.as_view()),
    
     # Email Verification
    path('send-otp/', SendOTPView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('resend-otp/', ResendOTPView.as_view()),
    
     # MFA Setup
    path('verify-mfa-setup/', VerifyMFASetupView.as_view()),
        
     # Login
    path('login/', LoginView.as_view()),
    path('verify-mfa/', VerifyMFAView.as_view()),
    
     # Reset Password
    path("forgot-password/",ForgotPasswordView.as_view()),
    path("reset-password/",ResetPasswordView.as_view()),
    

    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    
]