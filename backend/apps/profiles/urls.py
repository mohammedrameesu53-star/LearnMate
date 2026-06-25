from django.urls import path
from .views import *

urlpatterns = [
    path("student/",StudentProfileView.as_view()),
    path("mentor/",MentorProfileView.as_view()),
]