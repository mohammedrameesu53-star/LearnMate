from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.accounts.models import User
from .models import StudentProfile, MentorProfile


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
    
    print("SIGNAL EXECUTED")
    
    if created:
        
        print(instance.email)
        print(instance.role)

        if instance.role == "student":

            StudentProfile.objects.create(
                user=instance
            )

        elif instance.role == "mentor":

            MentorProfile.objects.create(
                user=instance
            )