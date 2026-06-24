from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group

from apps.accounts.models import User

class Command(BaseCommand):


    def handle(self, *args, **kwargs):

        for user in User.objects.all():

            group, _ = Group.objects.get_or_create(
                name=user.role.capitalize()
            )

            user.groups.add(group)

        self.stdout.write(
            self.style.SUCCESS(
                "Existing users assigned to groups"
            )
        )

