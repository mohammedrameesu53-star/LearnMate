# apps/courses/management/commands/backfill_embeddings.py
from django.core.management.base import BaseCommand
# pyrefly: ignore [missing-import]
from apps.courses.models import Lesson
# pyrefly: ignore [missing-import]
from apps.courses.tasks import generate_lesson_transcript


class Command(BaseCommand):
    help = "Queues transcript generation + embedding for all lessons in a given course."

    def add_arguments(self, parser):
        parser.add_argument("course_id", type=int, help="ID of the course to process")

    def handle(self, *args, **options):
        course_id = options["course_id"]
        lessons = Lesson.objects.filter(
            module__course_id=course_id,
            video_url__isnull=False,
        ).exclude(video_url="")

        count = 0
        for lesson in lessons:
            generate_lesson_transcript.delay(lesson.id)
            count += 1

        self.stdout.write(
            self.style.SUCCESS(f"Queued {count} lessons for transcription/embedding.")
        )