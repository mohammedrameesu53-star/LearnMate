from django.shortcuts import render

# Create your views here.
# pyrefly: ignore [missing-import]
from rest_framework.views import APIView
# pyrefly: ignore [missing-import]
from rest_framework.response import Response
# pyrefly: ignore [missing-import]
from rest_framework import status
# pyrefly: ignore [missing-import]
from rest_framework.permissions import IsAuthenticated

from .serializers import AIChatSerializer
from .services import AIService


class AIChatView(APIView):
    """
    AI Tutor Chat API

    POST /api/ai/chat/

    Request:
    {
        "message": "What is Python?"
    }

    Response:
    {
        "response": "Python is a programming language..."
    }
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AIChatSerializer(data=request.data)

        if serializer.is_valid():

            message = serializer.validated_data["message"]

            ai_service = AIService()

            try:
                ai_response = ai_service.generate_response(message)

                return Response(
                    {
                        "response": ai_response
                    },
                    status=status.HTTP_200_OK
                )

            except Exception as e:

                return Response(
                    {
                        "error": str(e)
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )