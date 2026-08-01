from django.urls import path
# pyrefly: ignore [missing-import]
from apps.adminpanel.views.dashboard import AdminDashboardView
# pyrefly: ignore [missing-import]
from apps.adminpanel.views.users import AdminUserListAPIView,AdminUserAPIView
# pyrefly: ignore [missing-import]
from .views.courses import (AdminCourseListAPIView,
                            AdminCourseDetailAPIView,
                            AdminCoursePublishAPIView,
                            AdminCourseUnpublishAPIView,
                            AdminCourseDeleteAPIView,
                            AdminPendingCourseListAPIView,
                            AdminPublishedCourseListAPIView,
                            AdminCourseStatisticsAPIView)

from .views.reports import AdminReportsAPIView
from .views.mentors import (AdminMentorListAPIView,
                            AdminMentorDetailAPIView,
                            AdminMentorStatusAPIView,
                            AdminMentorDeleteAPIView)

from .views.students import (AdminStudentListAPIView,
                            AdminStudentDetailAPIView,
                            AdminStudentStatusAPIView,
                            AdminStudentDeleteAPIView)                            

urlpatterns = [

    path("admin/", AdminDashboardView.as_view()),

    path("users/",AdminUserListAPIView.as_view()),
    path("users/<uuid:user_id>/",AdminUserAPIView.as_view()),

    path("courses/",AdminCourseListAPIView.as_view(),name="admin-course-list"),
    path("courses/<int:course_id>/",AdminCourseDetailAPIView.as_view(),),
    path("courses/<int:course_id>/publish/",AdminCoursePublishAPIView.as_view(),),
    path("courses/<int:course_id>/unpublish/",AdminCourseUnpublishAPIView.as_view(),),
    path("courses/<int:course_id>/delete/",AdminCourseDeleteAPIView.as_view(),name="admin-delete-course",),
    path("courses/pending/",AdminPendingCourseListAPIView.as_view(),name="admin-pending-course-list",),
    path("courses/published/",AdminPublishedCourseListAPIView.as_view(),name="admin-published-courses",),
    path("courses/statistics/",AdminCourseStatisticsAPIView.as_view(),name="admin-course-statistics",),

    path("reports/",AdminReportsAPIView.as_view(),name="admin-reports"),

    path("mentors/",AdminMentorListAPIView.as_view(),),
    path("mentors/<uuid:mentor_id>/",AdminMentorDetailAPIView.as_view(),),
    path("mentors/<uuid:mentor_id>/update/",AdminMentorStatusAPIView.as_view(),),
    path("mentors/<uuid:mentor_id>/delete/",AdminMentorDeleteAPIView.as_view(),),

    path("students/",AdminStudentListAPIView.as_view(),),
    path("students/<uuid:student_id>/",AdminStudentDetailAPIView.as_view(),),
    path("students/<uuid:student_id>/status/",AdminStudentStatusAPIView.as_view(),),
    path("students/<uuid:student_id>/delete/",AdminStudentDeleteAPIView.as_view(),),

]
