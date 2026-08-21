import os
import re
import tempfile
from django.conf import settings

# pyrefly: ignore [missing-import]
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
# pyrefly: ignore [missing-import]
import yt_dlp
# pyrefly: ignore [missing-import]
from faster_whisper import WhisperModel
# pyrefly: ignore [missing-import]
from groq import Groq
# pyrefly: ignore [missing-import]
from langdetect import detect, LangDetectException


# Load the whisper model once (module-level) so it isn't reloaded on every task run.
# "small" is a good balance of speed/accuracy for a self-hosted CPU setup.
# Use "base" if this is too slow on your server, or "medium" if you have a GPU.
_whisper_model = WhisperModel("small", device="cpu", compute_type="int8")

_groq_client = Groq(api_key=settings.GROQ_API_KEY)

# Minimum words-per-minute we'd expect from real spoken content.
# Below this, we treat captions as broken/sparse (matches the
# "1-2 words after a long gap" problem described).
MIN_WORDS_PER_MINUTE = 60


def extract_youtube_video_id(url: str) -> str | None:
    """Pulls the video ID out of watch/embed/short YouTube URL formats."""
    patterns = [
        r"(?:youtube\.com\/watch\?v=)([^&]+)",
        r"(?:youtu\.be\/)([^?]+)",
        r"(?:youtube\.com\/embed\/)([^?]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def get_video_duration_seconds(url: str) -> float:
    """Uses yt-dlp to fetch video metadata (no download) to get real duration."""
    ydl_opts = {"quiet": True, "skip_download": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return info.get("duration", 0) or 0


def try_fetch_youtube_captions(video_id: str, duration_seconds: float) -> str | None:
    """
    Attempts to fetch existing YouTube captions (any language).
    Returns the joined caption text if it passes a basic quality check,
    otherwise returns None so the caller falls back to Whisper.
    """
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        # Prefer manually created captions over auto-generated ones if available
        try:
            transcript = transcript_list.find_manually_created_transcript(
                [t.language_code for t in transcript_list]
            )
        except NoTranscriptFound:
            transcript = transcript_list.find_generated_transcript(
                [t.language_code for t in transcript_list]
            )

        entries = transcript.fetch()
        full_text = " ".join(entry["text"] for entry in entries).strip()

        if not full_text or duration_seconds <= 0:
            return None

        word_count = len(full_text.split())
        words_per_minute = word_count / (duration_seconds / 60)

        if words_per_minute < MIN_WORDS_PER_MINUTE:
            # Sparse/broken captions — treat as unusable, fall back to Whisper
            return None

        return full_text

    except (TranscriptsDisabled, NoTranscriptFound):
        return None
    except Exception:
        # Any unexpected captions-API failure — fall back to Whisper rather than crash
        return None


def download_audio(url: str) -> str:
    """Downloads just the audio track to a temp file, returns the file path."""
    tmp_dir = tempfile.mkdtemp()
    output_template = os.path.join(tmp_dir, "audio.%(ext)s")

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": output_template,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "192",
        }],
        "quiet": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    return os.path.join(tmp_dir, "audio.mp3")


def transcribe_with_whisper(audio_path: str) -> tuple[str, str]:
    """
    Runs faster-whisper on the audio file.
    Returns (transcript_text, detected_language_code) — e.g. ("...", "ml") or ("...", "en")
    Language is auto-detected, not forced, so it works for both your
    Malayalam and English videos without needing to know in advance.
    """
    segments, info = _whisper_model.transcribe(audio_path, task="transcribe")
    text = " ".join(segment.text for segment in segments).strip()
    return text, info.language


def translate_to_english_via_groq(text: str) -> str:
    """Sends non-English transcript text to Groq for translation to English."""
    response = _groq_client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional translator. Translate the given lesson "
                    "transcript into clear, natural English. Preserve technical terms "
                    "and meaning accurately. Return only the translated text, "
                    "no commentary."
                ),
            },
            {"role": "user", "content": text},
        ],
        temperature=0.2,
    )
    return response.choices[0].message.content.strip()


def get_lesson_transcript(video_url: str) -> dict:
    """
    Main entry point. Runs the full fallback chain and returns:
    {
        "original_transcript": str,   # transcript in whatever language was spoken
        "transcript": str,            # always English — used for RAG embeddings
        "detected_language": str,     # e.g. "en", "ml"
        "source": str,                # "captions" or "whisper"
    }
    Raises an exception if nothing could be produced (caller marks status "failed").
    """
    video_id = extract_youtube_video_id(video_url)
    if not video_id:
        raise ValueError("Could not extract a YouTube video ID from this URL.")

    duration = get_video_duration_seconds(video_url)

    # Step 1: try captions
    caption_text = try_fetch_youtube_captions(video_id, duration)

    if caption_text:
        text = caption_text
        source = "captions"
        try:
            detected_language = detect(text)
        except LangDetectException:
            detected_language = "unknown"
    else:
        # Step 2: fall back to Whisper
        audio_path = download_audio(video_url)
        try:
            text, detected_language = transcribe_with_whisper(audio_path)
            source = "whisper"
        finally:
            # Clean up temp audio file regardless of success/failure
            if os.path.exists(audio_path):
                os.remove(audio_path)

    if not text:
        raise ValueError("Transcription produced no usable text.")

    # Step 3: translate to English if needed
    if detected_language == "en":
        original_transcript = text
        english_transcript = text
    else:
        original_transcript = text
        english_transcript = translate_to_english_via_groq(text)

    return {
        "original_transcript": original_transcript,
        "transcript": english_transcript,
        "detected_language": detected_language,
        "source": source,
    }


def get_transcript_from_file(video_file_url: str) -> dict:
    """
    Transcribe an uploaded video (S3-hosted) directly with faster-whisper.
    No YouTube captions step since there's no YouTube video to check —
    goes straight to Whisper, same model instance as the YouTube path.
    """
    import requests

    tmp_dir = tempfile.mkdtemp()
    tmp_path = os.path.join(tmp_dir, "upload.mp4")

    response = requests.get(video_file_url, stream=True)
    response.raise_for_status()
    with open(tmp_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    try:
        text, detected_language = transcribe_with_whisper(tmp_path)

        if not text:
            raise ValueError("Transcription produced no usable text.")

        if detected_language == "en":
            original_transcript = text
            english_transcript = text
        else:
            original_transcript = text
            english_transcript = translate_to_english_via_groq(text)

        return {
            "original_transcript": original_transcript,
            "transcript": english_transcript,
            "detected_language": detected_language,
            "source": "whisper",
        }
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)