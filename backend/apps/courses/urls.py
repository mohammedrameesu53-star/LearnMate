# pyrefly: ignore [missing-import]
from django.urls import path
from .views import CreateCourseView,MyCoursesView,CourseDetailView,UpdateCourseView,DeleteCourseView,CreateModuleView,ModuleListView,UpdateModuleView,DeleteModuleView,CreateLessonView,LessonListView,UpdateLessonView,DeleteLessonView,LessonResourceView,LessonResourceDetailView,PublishCourseAPIView,UnpublishCourseAPIView,PublishedCourseListView,StudentCourseDetailsAPIView,EnrollmentAPIView,MyCoursesAPIView,ModuleListAPIView,LessonListAPIView,LessonDetailsAPIView,MarkLessonCompleteAPIView,CourseProgressAPIView,ContinueLearningAPIView,CourseCompletionAPIView,MentorDashboardAPIView,CourseStudentsAPIView,StudentProgressDetailAPIView,CourseStatisticsAPIView,AdminCourseAnalyticsAPIView

urlpatterns=[
    # Mentor Course CRUD.
    # *************************************************

    # Course CRUD
    path(
        "create/",
        CreateCourseView.as_view(),
        name="create-course",
    ),
        path(
        "my-courses/",
        MyCoursesView.as_view(),
        name="my-courses",
    ),
        path(
        "<int:course_id>/",
        CourseDetailView.as_view(),
        name="course-detail",
    ),
        path(
        "<int:course_id>/update/",
        UpdateCourseView.as_view(),
        name="update-course",
    ),
        path(
        "<int:course_id>/delete/",
        DeleteCourseView.as_view(),
        name="delete-course",
    ),


    # Module CRUD
        path(
        "modules/create/",
        CreateModuleView.as_view(),
        name="create-module",
    ),
        path(
        "<int:course_id>/modules/",
        ModuleListView.as_view(),
        name="module-list",
    ),   
        path(
        "modules/<int:module_id>/update/",
        UpdateModuleView.as_view(),
        name="update-module",
    ), 
        path(
        "modules/<int:module_id>/delete/",
        DeleteModuleView.as_view(),
        name="delete-module",
    ),


    # Lesson CRUD
        path(
        "lessons/create/",
        CreateLessonView.as_view(),
        name="create-lesson",
    ),
        path(
        "modules/<int:module_id>/lessons/",
        LessonListView.as_view(),
        name="lesson-list",
    ),
        path(
        "lessons/<int:lesson_id>/update/",
        UpdateLessonView.as_view(),
        name="update-lesson",
    ),
        path(
        "lessons/<int:lesson_id>/delete/",
        DeleteLessonView.as_view(),
        name="delete-lesson",
    ),


    # Lesson Resources

    path(
        "lessons/<int:lesson_id>/resources/",     #API endpoint for mentor and student to view resousces
        LessonResourceView.as_view(),
        name="lesson-resources",
    ),

        path(
        "resources/<int:resource_id>/",
        LessonResourceDetailView.as_view(),
        name="lesson-resource-detail",
    ),

    # Publish & Unpublish
        path(
        "<int:course_id>/publish/",
        PublishCourseAPIView.as_view(),
        name="publish-course",
    ),

        path(
        "<int:course_id>/unpublish/",
        UnpublishCourseAPIView.as_view(),
        name="unpublish-course",
    ),



    # Student Learning Module
    # *************************************************
    path(
    "",
    PublishedCourseListView.as_view(),
    name="published-courses",
),
    path(
    "student/<int:course_id>/",
    StudentCourseDetailsAPIView.as_view(),
    name="student-course-details",
),
path(
    "student/<int:course_id>/enroll/",
    EnrollmentAPIView.as_view(),
    name="course-enrollment",
),
path(
    "student/my-courses/",
    MyCoursesAPIView.as_view(),
    name="student-my-courses",
),
path(
    "student/<int:course_id>/modules/",
    ModuleListAPIView.as_view(),
    name="student-course-modules",
),
path(
    "student/modules/<int:module_id>/lessons/",
    LessonListAPIView.as_view(),
    name="student-lesson-list",
),
path(
    "student/lessons/<int:lesson_id>/",
    LessonDetailsAPIView.as_view(),
    name="student-lesson-details",
),

path(
    "lessons/<int:lesson_id>/complete/",
    MarkLessonCompleteAPIView.as_view(),
    name="lesson-complete",
),
path(
    "student/courses/<int:course_id>/progress/",
    CourseProgressAPIView.as_view(),
    name="course-progress",
),
path(
    "student/courses/<int:course_id>/continue/",
    ContinueLearningAPIView.as_view(),
    name="continue-learning",
),
path(
    "student/courses/<int:course_id>/complete/",
    CourseCompletionAPIView.as_view(),
    name="course-completion",
),






path(
    "mentor/dashboard/",
    MentorDashboardAPIView.as_view(),
    name="mentor-dashboard",
),
path(
    "mentor/courses/<int:course_id>/students/",
    CourseStudentsAPIView.as_view(),
    name="mentor-course-students",
),
path(
    "mentor/courses/<int:course_id>/students/<uuid:student_id>/",
    StudentProgressDetailAPIView.as_view(),
    name="student-progress-detail",
),
path(
    "mentor/courses/<int:course_id>/statistics/",
    CourseStatisticsAPIView.as_view(),
    name="course-statistics",
),
path(
    "admin/dashboard/",
    AdminCourseAnalyticsAPIView.as_view(),
    name="admin-course-dashboard",
),

]




