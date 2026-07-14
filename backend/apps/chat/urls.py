from django.urls import path
from .views import ChatHistoryView, ChatRoomListView, MarkMessagesReadView, GroupChatListView,GroupMessageListView,CreateGroupView

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
    path(
        "groups/",
        GroupChatListView.as_view(),
        name="group-chat-list",
    ),

    path(
        "groups/<int:group_id>/messages/",
        GroupMessageListView.as_view(),
        name="group-message-list",
    ),

    path(
    "groups/create/",
    CreateGroupView.as_view(),
    name="create-group",
),
]
