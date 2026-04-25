import base64
import subprocess
from datetime import UTC, datetime
from pathlib import Path
from tempfile import NamedTemporaryFile

from app.schemas import SpeechSynthesisResponse, SpeechTranscriptionResponse


def transcribe_audio(
    audio_bytes: bytes,
    whisper_model_size: str,
) -> SpeechTranscriptionResponse:
    try:
        from faster_whisper import WhisperModel  # type: ignore
    except ImportError:
        return SpeechTranscriptionResponse(
            text="",
            engine=f"faster-whisper:{whisper_model_size}",
            success=False,
        )

    with NamedTemporaryFile(suffix=".webm", delete=True) as temp_file:
        temp_file.write(audio_bytes)
        temp_file.flush()
        model = WhisperModel(whisper_model_size, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(temp_file.name)
        text = " ".join(segment.text.strip() for segment in segments).strip()

    return SpeechTranscriptionResponse(
        text=text,
        engine=f"faster-whisper:{whisper_model_size}",
        success=bool(text),
    )


def synthesize_speech(
    text: str,
    piper_binary: str,
    piper_model_path: str,
    output_dir: Path,
) -> SpeechSynthesisResponse:
    if not piper_model_path:
        return SpeechSynthesisResponse(
            success=False,
            engine="piper",
            message="Piper model path is not configured.",
        )

    timestamp = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    output_path = output_dir / f"tts-{timestamp}.wav"

    try:
        subprocess.run(
            [
                piper_binary,
                "--model",
                piper_model_path,
                "--output_file",
                str(output_path),
            ],
            input=text.encode("utf-8"),
            check=True,
            capture_output=True,
        )
    except (OSError, subprocess.CalledProcessError) as exc:
        return SpeechSynthesisResponse(
            success=False,
            engine="piper",
            message=f"Piper synthesis failed: {exc}",
        )

    return SpeechSynthesisResponse(
        success=True,
        engine="piper",
        audio_url=f"/tts/{output_path.name}",
        message="Speech generated successfully.",
    )


def decode_audio_data(audio_data: str) -> bytes:
    if "," in audio_data and audio_data.startswith("data:"):
        audio_data = audio_data.split(",", 1)[1]
    return base64.b64decode(audio_data)
