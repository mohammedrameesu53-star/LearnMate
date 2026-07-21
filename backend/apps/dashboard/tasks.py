# pyrefly: ignore [missing-import]
from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
# pyrefly: ignore [missing-import]
from apps.dashboard.models import CourseEnrollment, LessonProgress, Lesson,Course

User = get_user_model()

@shared_task
def check_student_progression_nudges():
    """
    Daily task checking for students who finished a lesson over 3 days ago, 
    but haven't started or completed the next sequential lesson in the course.
    """
    # Look back boundary: 3 days ago
    three_days_ago = timezone.now() - timedelta(days=3)
    active_enrollments = CourseEnrollment.objects.filter(is_active=True)
    
    for enrollment in active_enrollments:
        student = enrollment.student
        course = enrollment.course
        
        # 1. Fetch the last completed lesson progress record for this student inside this specific course
        last_completed_log = LessonProgress.objects.filter(
            student=student,
            lesson__chapter__course=course,
            is_completed=True
        ).order_by('-completed_at').first()
        
        # If they haven't completed any lessons yet, check enrollment age instead
        if not last_completed_log:
            continue
            
        # 2. Check if their latest completion log is older than 3 days
        if last_completed_log.completed_at < three_days_ago:
            current_lesson = last_completed_log.lesson
            
            # 3. Find if there is a next lesson inside this chapter, or the first lesson of the next chapter
            next_lesson = Lesson.objects.filter(
                chapter__course=course,
                chapter__order__gte=current_lesson.chapter.order,
                order__gt=current_lesson.order
            ).first()
            
            # Fallback check if the next lesson belongs to the next chapter sequence
            if not next_lesson:
                next_lesson = Lesson.objects.filter(
                    chapter__course=course,
                    chapter__order__gt=current_lesson.chapter.order
                ).first()
                
            if next_lesson:
                # 4. Check if the student has NOT completed this next lesson yet
                has_started_next = LessonProgress.objects.filter(
                    student=student,
                    lesson=next_lesson
                ).exists()
                
                if not has_started_next:
                    # Dispatch automated reminder email using your configured Brevo/SMTP system
                    send_mail(
                        subject="Don't Break Your Learning Streak on LearnMate! 🎯",
                        message=(
                            f"Hi {student.username},\n\n"
                            f"Great job finishing your last lesson in '{current_lesson.chapter.title}'! "
                            f"However, we noticed you haven't moved on to your next lesson: '{next_lesson.title}' yet.\n\n"
                            f"Don't lose momentum! Log back into your portal and continue your path today.\n\n"
                            f"Best regards,\nLearnMate Education Engine"
                        ),
                        from_email="no-reply@learnmate.com",
                        recipient_list=[student.email],
                        fail_silently=False,
                    )
    return "Progression check loops parsed successfully."

@shared_task
def send_course_completion_email(user_id, course_id):
    """Instant asynchronous task executed immediately when progress reaches 100%"""
    try:
        user = User.objects.get(id=user_id)
        course = Course.objects.get(id=course_id)
        
        send_mail(
            subject="Congratulations! You Passed Your Course! 🎓",
            message=f"Hi {user.username},\n\nFantastic work! You have successfully completed 100% of the material in {course.title}.\n\nYour Mentor and Admin records have been updated to log this milestone.\n\nKeep up the incredible dedication,\nLearnMate Team",
            from_email="no-reply@learnmate.com",
            recipient_list=[user.email],
            fail_silently=False,
        )
    except (User.DoesNotExist, Course.DoesNotExist):
        pass