print("Routing Loaded")

from django.urls import re_path
from .consumers import ChatConsumer,GroupConsumer

websocket_urlpatterns = [
    re_path(
        r"ws/chat/(?P<room_id>\d+)/$",ChatConsumer.as_asgi(),
    ),
    re_path(
        r"ws/group/(?P<group_id>\d+)/$",GroupConsumer.as_asgi(),
    ),
]