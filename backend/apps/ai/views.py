import requests
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
from django.conf import settings



class AIChatView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = AIChatSerializer(data=request.data)

        if serializer.is_valid():

            message = serializer.validated_data["message"]
            course_id = serializer.validated_data.get("course_id")

            # If a course_id is provided, use the RAG pipeline so the
            # answer is grounded in that course's actual lesson content.
            if course_id:
                try:
                    ai_response = requests.post(
                        f"{settings.AI_SERVICE_URL}/rag-chat",
                        json={"question": message, "course_id": course_id},
                        timeout=30,
                    )
                    ai_response.raise_for_status()
                    answer = ai_response.json().get("answer", "")

                    return Response(
                        {"response": answer},
                        status=status.HTTP_200_OK
                    )

                except requests.RequestException as e:
                    return Response(
                        {"error": f"AI service unavailable: {str(e)}"},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE
                    )

            # No course_id provided — fall back to the original general
            # chatbot behavior, unchanged from before.
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

