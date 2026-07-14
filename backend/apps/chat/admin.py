
from django.contrib import admin
from .models import ChatRoom, Message,GroupChat,GroupMember,GroupMessage
# # Register your models here.


admin.site.register(ChatRoom)
admin.site.register(Message)
admin.site.register(GroupChat)
admin.site.register(GroupMember)
admin.site.register(GroupMessage)