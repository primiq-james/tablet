from typing import Any, List

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    app: str
    environment: str


class ScanResponse(BaseModel):
    indexed_count: int
    library_root: str


class SearchResult(BaseModel):
    path: str
    category: str
    title: str
    extension: str
    page_number: int | None = None
    chunk_index: int | None = None
    snippet: str
    score: int


class SearchResponse(BaseModel):
    query: str
    total: int
    results: List[SearchResult]


class MediaResult(BaseModel):
    path: str
    category: str
    title: str
    extension: str
    snippet: str
    score: int
    previewable: bool
    file_url: str


class MediaSearchResponse(BaseModel):
    query: str
    total: int
    results: List[MediaResult]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    limit: int = Field(default=5, ge=1, le=20)


class Citation(BaseModel):
    path: str
    title: str
    category: str
    page_number: int | None = None
    chunk_index: int | None = None


class ChatResponse(BaseModel):
    message: str
    citations: List[Citation]
    grounded: bool = False


class RetrievalContextResponse(BaseModel):
    query: str
    context: str
    citations: List[Citation]


class VisionRequest(BaseModel):
    image_data: str = Field(min_length=1)
    prompt: str = Field(
        default="Identify the main item I am holding and describe what it appears to be used for."
    )


class VisionResponse(BaseModel):
    message: str
    model: str
    grounded: bool = False


class SettingsResponse(BaseModel):
    library_root: str
    index_db_path: str
    chat_model: str
    vision_model: str
    whisper_model_size: str
    piper_model_path: str
    piper_binary: str
    voice_output_enabled: bool
    camera_auto_analyze: bool
    camera_interval_seconds: int
    default_chat_limit: int
    retrieval_window: int


class SettingsUpdateRequest(BaseModel):
    library_root: str | None = None
    chat_model: str | None = None
    vision_model: str | None = None
    whisper_model_size: str | None = None
    piper_model_path: str | None = None
    piper_binary: str | None = None
    voice_output_enabled: bool | None = None
    camera_auto_analyze: bool | None = None
    camera_interval_seconds: int | None = Field(default=None, ge=1, le=30)
    default_chat_limit: int | None = Field(default=None, ge=1, le=20)
    retrieval_window: int | None = Field(default=None, ge=0, le=5)


class SpeechTranscriptionResponse(BaseModel):
    text: str
    engine: str
    success: bool


class SpeechSynthesisRequest(BaseModel):
    text: str = Field(min_length=1)


class SpeechSynthesisResponse(BaseModel):
    success: bool
    engine: str
    audio_url: str | None = None
    message: str


class CaptureCreateRequest(BaseModel):
    image_data: str = Field(min_length=1)
    label: str | None = None


class CaptureRecord(BaseModel):
    id: str
    filename: str
    path: str
    created_at: str
    label: str | None = None
    analysis: str | None = None
    image_url: str


class CaptureListResponse(BaseModel):
    captures: List[CaptureRecord]


class CaptureAnalyzeRequest(BaseModel):
    capture_id: str
    prompt: str = Field(default="Identify the main item in this capture and explain what it appears to be.")


class RouterDecisionResponse(BaseModel):
    route: str
    reason: str
    target_model: str
    metadata: dict[str, Any] = Field(default_factory=dict)
