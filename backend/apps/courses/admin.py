from django.contrib import admin
from .models import Course,Module,Lesson,LessonResource,Enrollment,LessonProgress
# Register your models here.

admin.site.register(Course)
admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(LessonResource)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)
