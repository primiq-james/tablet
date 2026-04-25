from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Circuit Tablet API"
    app_env: str = "development"
    app_host: str = "127.0.0.1"
    app_port: int = 8000
    library_root: Path = Path("data/library")
    index_db_path: Path = Path("data/index/library.db")
    max_snippet_chars: int = 1200
    max_results: int = 10
    retrieval_window: int = 1
    default_chat_limit: int = 6
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "qwen2.5:1.5b"
    ollama_vision_model: str = "qwen2.5vl:3b"
    runtime_settings_path: Path = Path("data/index/runtime_settings.json")
    captures_dir: Path = Path("data/captures")
    tts_output_dir: Path = Path("data/tts")
    piper_binary: str = "piper"
    piper_model_path: str = ""
    whisper_model_size: str = "base"
    camera_analyze_interval_seconds: int = 4

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.library_root.mkdir(parents=True, exist_ok=True)
    settings.index_db_path.parent.mkdir(parents=True, exist_ok=True)
    settings.runtime_settings_path.parent.mkdir(parents=True, exist_ok=True)
    settings.captures_dir.mkdir(parents=True, exist_ok=True)
    settings.tts_output_dir.mkdir(parents=True, exist_ok=True)
    return settings
