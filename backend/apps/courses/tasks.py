# pyrefly: ignore [missing-import]
from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from .models import Course,Enrollment, LessonProgress,Lesson
# pyrefly: ignore [missing-import]
from apps.courses.services.transcription import get_lesson_transcript,get_transcript_from_file
from django.utils import timezone
from datetime import timedelta
import requests
# pyrefly: ignore [missing-import]
from django.conf import settings


User = get_user_model()


@shared_task
def send_course_completion_email(user_id, course_id):

    try:
        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)

        send_mail(
            subject="🎉 Congratulations on Completing Your Course!",
            message=(
                f"Hi {user.first_name or user.email},\n\n"
                f"Congratulations! You have successfully completed "
                f"'{course.title}'.\n\n"
                f"Keep learning and keep growing!\n\n"
                f"— LearnMate Team"
            ),
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )

        return "Email Sent"

    except Exception as e:
        return str(e)


@shared_task
def send_inactivity_reminders():
    
    print("=" * 50)
    print("Checking inactive students...")
    print("=" * 50)

    three_days_ago = timezone.now() - timedelta(days=3)
    
    print("Threshold:", three_days_ago)

    enrollments = Enrollment.objects.filter(
        is_active=True,
        is_completed=False
    )
    
    print("Enrollments:", enrollments.count())

    reminders_sent = 0

    for enrollment in enrollments:

        student = enrollment.student
        course = enrollment.course
        
        print("---------------------------")
        print("Student:", student.email)

        # Find latest completed lesson
        last_progress = LessonProgress.objects.filter(
            student=student,
            lesson__module__course=course,
            is_completed=True
        ).order_by("-completed_at").first()

        # Determine last activity
        if last_progress:
            last_activity = last_progress.completed_at
            print("Last completed lesson:", last_progress.lesson.title)
        else:
            last_activity = enrollment.enrolled_at
            print("No lesson completed yet.")
            
        print("Last activity:", last_activity)    

        # Skip active students
        if last_activity > three_days_ago:
            print("Student is ACTIVE")
            continue
        
        print("Sending reminder...")

        # Send reminder email
        send_mail(
            subject="Continue your LearnMate course 📚",
            message=(
                f"Hi {student.first_name or student.username},\n\n"
                f"We noticed that you haven't continued learning in "
                f"'{course.title}' for the last few days.\n\n"
                "Continue your learning journey and keep your streak alive!\n\n"
                "Log in to LearnMate and continue where you left off.\n\n"
                "Best Regards,\n"
                "LearnMate Team"
            ),
            from_email=None,
            recipient_list=[student.email],
            fail_silently=False,
        )

        reminders_sent += 1
        
        print("Reminder Sent")

    return f"{reminders_sent} reminder(s) sent successfully."


@shared_task
def generate_lesson_transcript(lesson_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)
    except Lesson.DoesNotExist:
        return

    has_youtube = bool(lesson.video_url)
    has_upload = lesson.source_type == "upload" and bool(lesson.video_file)

    if not has_youtube and not has_upload:
        lesson.transcript_status = "failed"
        lesson.save(update_fields=["transcript_status"])
        return

    lesson.transcript_status = "processing"
    lesson.save(update_fields=["transcript_status"])

    try:
        if has_upload:
            result = get_transcript_from_file(lesson.video_file.url)
        else:
            result = get_lesson_transcript(lesson.video_url)

        lesson.original_transcript = result["original_transcript"]
        lesson.transcript = result["transcript"]
        lesson.transcript_status = "completed"
        lesson.save(update_fields=[
            "original_transcript", "transcript", "transcript_status"
        ])

        # Automatically trigger embedding now that we have a transcript
        embed_lesson_transcript.delay(lesson.id)

    except Exception as e:
        lesson.transcript_status = "failed"
        lesson.save(update_fields=["transcript_status"])
        # Log this properly in production (e.g. via Celery's logger or Sentry)
        print(f"Transcription failed for lesson {lesson_id}: {e}")


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def embed_lesson_transcript(self, lesson_id):
    try:
        lesson = Lesson.objects.select_related("module__course").get(id=lesson_id)
    except Lesson.DoesNotExist:
        return

    if not lesson.transcript:
        return

    course_id = lesson.module.course.id

    headers = {"X-Internal-Secret": settings.AI_SERVICE_SECRET}

    # Clear any existing chunks for this lesson first — ensures a clean
    # slate before re-embedding, so no orphaned chunks linger from a
    # previous, longer video if this one produces fewer chunks.
    requests.delete(
        f"{settings.AI_SERVICE_URL}/lesson/{lesson_id}",
        headers=headers,
        timeout=30,
    )

    try:
        response = requests.post(
            f"{settings.AI_SERVICE_URL}/embed",
            json={
                "lesson_id": lesson.id,
                "course_id": course_id,
                "transcript_text": lesson.transcript,
            },
            headers=headers,
            timeout=60,
        )
        response.raise_for_status()

        lesson.embedding_status = "completed"
        lesson.save(update_fields=["embedding_status"])
        print(f"Embedded lesson {lesson_id}: {response.json()}")

    except requests.RequestException as e:
        print(f"Embedding failed for lesson {lesson_id}: {e} — retry {self.request.retries}/3")
        lesson.embedding_status = "failed"
        lesson.save(update_fields=["embedding_status"])

        # Automatically retry (handles FastAPI not being ready yet, brief network issues)
        raise self.retry(exc=e)

        
@shared_task
def retry_stuck_embeddings():
    """
    Safety net: finds lessons whose transcript completed but embedding
    never finished (stuck pending, or failed), and automatically
    re-queues them. Runs on a schedule via Celery Beat.
    """
    cutoff = timezone.now() - timedelta(minutes=10)

    stuck_lessons = Lesson.objects.filter(
        transcript_status="completed",
    ).exclude(
        embedding_status="completed"
    ).filter(
        updated_at__lt=cutoff
    )

    count = 0
    for lesson in stuck_lessons:
        embed_lesson_transcript.delay(lesson.id)
        count += 1

    if count:
        print(f"retry_stuck_embeddings: re-queued {count} stuck lesson(s)")

