# pyrefly: ignore [missing-import]
import chromadb

_client = chromadb.PersistentClient(path="./chroma_data")
_collection = _client.get_or_create_collection(name="lesson_transcripts")


def upsert_lesson_chunks(lesson_id: int, course_id: int, chunks: list[str], embeddings: list[list[float]]):
    """
    Stores each chunk's embedding, tagged with lesson_id/course_id metadata
    so retrieval can be scoped to a specific course or lesson later.
    """
    ids = [f"lesson-{lesson_id}-chunk-{i}" for i in range(len(chunks))]
    metadatas = [{"lesson_id": lesson_id, "course_id": course_id} for _ in chunks]

    _collection.upsert(
        ids=ids,
        embeddings=embeddings,
        documents=chunks,
        metadatas=metadatas,
    )


def query_similar_chunks(query_embedding: list[float], course_id: int, top_k: int = 5) -> list[str]:
    """
    Finds the chunks most relevant to the query, scoped to one course
    (so answers don't leak in content from unrelated courses).
    """
    results = _collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"course_id": course_id},
    )
    documents = results.get("documents", [[]])[0]
    return documents


def delete_lesson_chunks(lesson_id: int):
    """Removes all chunks for a lesson — useful if a lesson's video/transcript changes."""
    _collection.delete(where={"lesson_id": lesson_id})