from django.urls import path
from .views import StudentDashboardView, StudentAIChatView, StudentMessagesView, MentorDashboardView, AdminDashboardView

urlpatterns = [
    path("student/", StudentDashboardView.as_view()),
    path("student/ai-chat/", StudentAIChatView.as_view()),
    path("student/messages/", StudentMessagesView.as_view()),
    path("mentor/", MentorDashboardView.as_view()),
    path("admin/", AdminDashboardView.as_view()),
]