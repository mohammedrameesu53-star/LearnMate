# apps/courses/management/commands/reembed_course.py
from django.core.management.base import BaseCommand
# pyrefly: ignore [missing-import]
from apps.courses.models import Lesson
# pyrefly: ignore [missing-import]
from apps.courses.tasks import embed_lesson_transcript


class Command(BaseCommand):
    help = "Re-runs embedding (not transcription) for all lessons in a course that have a transcript."

    def add_arguments(self, parser):
        parser.add_argument("course_id", type=int)
        parser.add_argument(
            "--only-failed",
            action="store_true",
            help="Only re-embed lessons where embedding_status is 'failed' or 'pending'.",
        )

    def handle(self, *args, **options):
        course_id = options["course_id"]
        only_failed = options["only_failed"]

        lessons = Lesson.objects.filter(
            module__course_id=course_id,
            transcript_status="completed",
        )

        if only_failed:
            lessons = lessons.exclude(embedding_status="completed")

        count = 0
        for lesson in lessons:
            embed_lesson_transcript.delay(lesson.id)
            count += 1

        self.stdout.write(self.style.SUCCESS(f"Queued {count} lessons for re-embedding."))