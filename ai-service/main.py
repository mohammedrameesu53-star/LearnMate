import os
from fastapi import FastAPI, Header, HTTPException, Depends
from pydantic import BaseModel
from dotenv import load_dotenv

from services.embeddings import embed_texts, chunk_text
from services.vectorstore import upsert_lesson_chunks, delete_lesson_chunks
from services.rag import answer_question

load_dotenv()

INTERNAL_API_SECRET = os.getenv("INTERNAL_API_SECRET")

app = FastAPI(title="LearnMate AI/RAG Service")


def verify_internal_secret(x_internal_secret: str = Header(...)):
    """
    Dependency that checks every protected request carries the correct
    shared secret in its headers. Only Django (which knows this secret)
    should ever be able to call these endpoints.
    """
    if not INTERNAL_API_SECRET or x_internal_secret != INTERNAL_API_SECRET:
        raise HTTPException(status_code=401, detail="Invalid or missing internal API secret.")


class EmbedRequest(BaseModel):
    lesson_id: int
    course_id: int
    transcript_text: str


class ChatRequest(BaseModel):
    question: str
    course_id: int


@app.post("/embed", dependencies=[Depends(verify_internal_secret)])
def embed_lesson(payload: EmbedRequest):
    chunks = chunk_text(payload.transcript_text)
    embeddings = embed_texts(chunks)
    upsert_lesson_chunks(payload.lesson_id, payload.course_id, chunks, embeddings)
    return {"status": "success", "chunks_stored": len(chunks)}


@app.delete("/lesson/{lesson_id}", dependencies=[Depends(verify_internal_secret)])
def delete_lesson_embeddings(lesson_id: int):
    delete_lesson_chunks(lesson_id)
    return {"status": "deleted", "lesson_id": lesson_id}


@app.post("/rag-chat", dependencies=[Depends(verify_internal_secret)])
def rag_chat(payload: ChatRequest):
    answer = answer_question(payload.question, payload.course_id)
    return {"answer": answer}


@app.get("/health")
def health_check():
    # No auth needed — this is just a public "is it alive" check,
    # doesn't touch any data.
    return {"status": "ok"}