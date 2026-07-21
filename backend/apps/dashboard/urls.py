from django.urls import path
from .views import CourseDetailView, CompleteLessonView ,StudentDashboardView , MentorDashboardView, AdminDashboardView

urlpatterns = [
    path("student/", StudentDashboardView.as_view()),
    path("mentor/", MentorDashboardView.as_view()),
    path("admin/", AdminDashboardView.as_view()),
    path('courses/<int:course_id>/', CourseDetailView.as_view(), name='course-detail'),
    path('lessons/<int:lesson_id>/complete/', CompleteLessonView.as_view(), name='complete-lesson'),    
]