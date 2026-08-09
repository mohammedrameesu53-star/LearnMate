import os
# pyrefly: ignore [missing-import]
from groq import Groq
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

from .embeddings import embed_text
from .vectorstore import query_similar_chunks

load_dotenv()
_groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def answer_question(question: str, course_id: int) -> str:
    question_embedding = embed_text(question)
    relevant_chunks = query_similar_chunks(question_embedding, course_id=course_id, top_k=5)

    if not relevant_chunks:
        context_text = "No course material found for this question."
    else:
        context_text = "\n\n".join(relevant_chunks)

    system_prompt = (
        "You are a helpful tutor for an online course. Answer the student's "
        "question using ONLY the course material provided below. If the "
        "material doesn't contain the answer, say you don't have enough "
        "information from the course content, rather than guessing.\n\n"
        f"COURSE MATERIAL:\n{context_text}"
    )

    response = _groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question},
        ],
        temperature=0.3,
    )

    return response.choices[0].message.content.strip()