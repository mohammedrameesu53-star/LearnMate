# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer

# Loaded once at module import — reused across all requests.
# all-MiniLM-L6-v2 is small, fast, free, and good enough for this use case.
_model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_text(text: str) -> list[float]:
    """Converts a single string into its embedding vector."""
    return _model.encode(text).tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """Batch version — more efficient when embedding multiple chunks at once."""
    return _model.encode(texts).tolist()


def chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    """
    Splits text into overlapping word-chunks.
    Overlap helps avoid losing context at chunk boundaries.
    """
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks