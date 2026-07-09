from asyncio import print_call_graph
from django.http import response
from channels.db import database_sync_to_async
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message,ChatRoom


class ChatConsumer(AsyncWebsocketConsumer):
    
    print("ChatConsumer file imported")

    async def connect(self):

        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]

        self.room_group_name = f"chat_{self.room_id}"

        if not await self.is_room_member():

            print("Unauthorized user.")

            await self.close()

            return

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_online",
                "user": self.scope["user"].email,
            }
        )

        print("WebSocket Connected")


    async def receive(self, text_data):

        data = json.loads(text_data)

        event_type = data.get("type")

        print(f"Event Type: {event_type}")

        if event_type == "message":

            message = data.get("message")

            print(f"Received Message: {message}")

            message_data = await self.save_message(
                self.scope["user"],
                message
            )

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat_message",
                    "message_data": message_data,
                }
            )

            print("Message broadcasted.")

        elif event_type == "typing":

            print(f"{self.scope['user'].email} is typing...")

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing_indicator",
                    "user": self.scope["user"].email,
                }
            )
     

    @database_sync_to_async
    def save_message( self,sender,message):

        room = ChatRoom.objects.get(
            id=self.room_id
        )

        if sender == room.student:

            receiver = room.mentor

        elif sender == room.mentor:

            receiver = room.student

        else:

            raise ValueError(
                "User is not a member of this chat room."
            )

        message_obj = Message.objects.create(
            room=room,
            sender=sender,
            receiver=receiver,
            message=message
        )        

        print("Message saved successfully.")   

        return {
                "id": message_obj.id,
                "room_id": room.id,
                "message": message_obj.message,
                "sender": {
                    "id": str(sender.id),
                    "email": sender.email,
                    "role": sender.role,
                },
                "receiver": {
                    "id": str(receiver.id),
                    "email": receiver.email,
                    "role": receiver.role,
                },
                "created_at": message_obj.created_at.isoformat(),
                "is_read": message_obj.is_read,
            } 


    @database_sync_to_async
    def is_room_member(self):

        room = ChatRoom.objects.get(
            id=self.room_id
        )

        user = self.scope["user"]

        return user == room.student or user == room.mentor            


    async def chat_message(self, event):

        message_data = event["message_data"]

        print(f"Broadcast Received: {message_data}")

        response = json.dumps({
            "message_data": message_data
        })
        print(response)

        await self.send(
            text_data=response
        )

    async def typing_indicator(self, event):

        print(f"Typing Event: {event['user']}")

        await self.send(
            text_data=json.dumps({
                "type": "typing",
                "user": event["user"],
            })
        )    


    async def user_online(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "user_online",
                "user": event["user"],
            })    
        )

        print(f"{event['user']} is online")    

    async def user_offline(self, event):

        await self.send(
            text_data=json.dumps({
                "type": "user_offline",
                "user": event["user"],
            })
        )

        print(f"{event['user']} went offline")        
    
    async def disconnect(self, close_code):

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_offline",
                "user": self.scope["user"].email,
            }
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

        print(f"Disconnected: {close_code}")



        
 