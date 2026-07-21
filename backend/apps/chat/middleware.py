# pyrefly: ignore [missing-import]
from channels.middleware import BaseMiddleware
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.tokens import AccessToken
# pyrefly: ignore [missing-import]
from rest_framework_simplejwt.exceptions import TokenError
# pyrefly: ignore [missing-import]
from apps.accounts.models import User


from channels.db import database_sync_to_async

class JWTAuthMiddleware(BaseMiddleware):

    async def __call__(self, scope, receive, send):

        print("JWT Middleware Executed........")

        query_string = scope["query_string"].decode()

        print("Query String:", query_string)

        try:

            token = query_string.split("token=")[1]

            validated_token = AccessToken(token)

            print("Token is valid")

            user_id = validated_token["user_id"]

            print("User ID:", user_id)

            user = await self.get_user(user_id)

            scope["user"] = user

            print("Authenticated User:", user.email)

        except Exception as e:
            print("Invalid Token")
            print(e)

        

        return await super().__call__(
            scope,
            receive,
            send
        )
    
    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)