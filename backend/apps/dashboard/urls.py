from django.urls import path

from .views import *

urlpatterns = [

    path(
        "student/",
        StudentDashboardView.as_view()
    ),

    path(
        "mentor/",
        MentorDashboardView.as_view()
    ),

    path(
        "admin/",
        AdminDashboardView.as_view()
    ),
]