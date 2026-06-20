from django.urls import path
from .views import *
from rest_framework_simplejwt.views import TokenObtainPairView,TokenRefreshView


urlpatterns = [
    # (1)
    path('register/',RegisterView.as_view(),name="register"),
       
       
    #  Email Varification (Brevo)-registration
    # (2)
    path('send-otp/',SendOTPView.as_view()),
    # (3)
    path('verify-otp/',VerifyOTPView.as_view()),
    
    path('resend-otp/', ResendOTPView.as_view()),
    
    
    # Normal authentication
    # (4) 
    path('token/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    
    
    #  MFA (Multi-factor authentication) - (after enabling MFA)
    # (5)
    path('setup-mfa/', SetupMFAView.as_view()),
    # (6)
    path('verify-mfa-setup/', VerifyMFASetupView.as_view()),
    
    
    # Two factor authentication  
    # path('login-otp/',LoginView.as_view(),name='login-otp'), 
    # path('verify-login-otp/',VerifyLoginOTPView.as_view(),name='verify-login-otp'),
    
    # Reset Password
    path("forgot-password/",ForgotPasswordView.as_view()),
    path("reset-password/",ResetPasswordView.as_view()),
    
    
    # RBAC (Role based access control)
    path("admin/",AdminDashboardView.as_view()),
    path("mentor/",MentorDashboardView.as_view()),
    path("student/",StudentDashboardView.as_view()),


    
    path('token/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    
]