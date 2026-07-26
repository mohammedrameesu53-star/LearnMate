from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from .models import Course,Enrollment, LessonProgress
from django.utils import timezone
from datetime import timedelta

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



    return "Reminder task completed."        

