from django.contrib import admin
from .models import Course,Module,Lesson,LessonResource,Enrollment,LessonProgress
from .tasks import embed_lesson_transcript
# Register your models here.

admin.site.register(Course)
admin.site.register(Module)
admin.site.register(LessonResource)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)

@admin.action(description="Retry embedding for selected lessons")
def retry_embedding(modeladmin, request, queryset):
    count = 0
    for lesson in queryset:
        if lesson.transcript_status == "completed":
            embed_lesson_transcript.delay(lesson.id)
            count += 1
    modeladmin.message_user(request, f"Re-queued embedding for {count} lesson(s).")


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["title", "module", "transcript_status", "embedding_status"]
    list_filter = ["transcript_status", "embedding_status"]
    actions = [retry_embedding]