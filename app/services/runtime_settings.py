import json
from pathlib import Path

from app.config import Settings
from app.schemas import SettingsResponse, SettingsUpdateRequest


DEFAULT_RUNTIME_SETTINGS = {
    "chat_model": "qwen2.5:1.5b",
    "vision_model": "qwen2.5vl:3b",
    "voice_output_enabled": False,
    "camera_auto_analyze": False,
}


def _read_json(path: Path) -> dict:
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def _write_json(path: Path, payload: dict) -> None:
    path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")


def load_runtime_settings(settings: Settings) -> dict:
    persisted = _read_json(settings.runtime_settings_path)
    merged = {
        **DEFAULT_RUNTIME_SETTINGS,
        "library_root": str(settings.library_root),
        "index_db_path": str(settings.index_db_path),
        "chat_model": settings.ollama_model,
        "vision_model": settings.ollama_vision_model,
        "whisper_model_size": settings.whisper_model_size,
        "piper_model_path": settings.piper_model_path,
        "piper_binary": settings.piper_binary,
        "camera_interval_seconds": settings.camera_analyze_interval_seconds,
        "default_chat_limit": settings.default_chat_limit,
        "retrieval_window": settings.retrieval_window,
        **persisted,
    }
    return merged


def get_settings_response(settings: Settings) -> SettingsResponse:
    merged = load_runtime_settings(settings)
    return SettingsResponse(**merged)


def update_runtime_settings(settings: Settings, payload: SettingsUpdateRequest) -> SettingsResponse:
    current = load_runtime_settings(settings)
    updates = payload.model_dump(exclude_none=True)
    current.update(updates)
    _write_json(settings.runtime_settings_path, current)
    return SettingsResponse(**current)
