# pyrefly: ignore [missing-import]
from openai import OpenAI
from django.conf import settings

class AIService:

    def __init__(self):
        self.client = OpenAI(
            api_key=settings.GROQ_API_KEY,
            base_url="https://api.groq.com/openai/v1",
        )

    def generate_response(self, question):

        response = self.client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are LearnMate AI Tutor. "
                        "Explain concepts simply and clearly."
                    )
                },
                {
                    "role": "user",
                    "content": question
                }
            ]
        )

        return response.choices[0].message.content