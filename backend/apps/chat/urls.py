from django.urls import path
from .views import ChatHistoryView, ChatRoomListView, MarkMessagesReadView

urlpatterns = [
    path(
        "rooms/",
        ChatRoomListView.as_view(),
        name="chat-room-list",
    ),
    path(
        "rooms/<int:room_id>/messages/",
        ChatHistoryView.as_view(),
        name="chat-history",
    ),
    path(
        "rooms/<int:room_id>/read/",
        MarkMessagesReadView.as_view(),
        name="mark-messages-read",
    ),
]
