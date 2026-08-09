# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from pydantic import BaseModel

from services.embeddings import embed_texts, chunk_text
from services.vectorstore import upsert_lesson_chunks
from services.rag import answer_question
from services.vectorstore import upsert_lesson_chunks, delete_lesson_chunks

app = FastAPI(title="LearnMate AI/RAG Service")


class EmbedRequest(BaseModel):
    lesson_id: int
    course_id: int
    transcript_text: str


class ChatRequest(BaseModel):
    question: str
    course_id: int


@app.post("/embed")
def embed_lesson(payload: EmbedRequest):
    chunks = chunk_text(payload.transcript_text)
    embeddings = embed_texts(chunks)
    upsert_lesson_chunks(payload.lesson_id, payload.course_id, chunks, embeddings)
    return {"status": "success", "chunks_stored": len(chunks)}


@app.post("/rag-chat")
def rag_chat(payload: ChatRequest):
    answer = answer_question(payload.question, payload.course_id)
    return {"answer": answer}


@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.delete("/lesson/{lesson_id}")
def delete_lesson_embeddings(lesson_id: int):
    delete_lesson_chunks(lesson_id)
    return {"status": "deleted", "lesson_id": lesson_id}    