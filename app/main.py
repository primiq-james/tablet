from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import quote

from fastapi import FastAPI, File, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.schemas import (
    CaptureAnalyzeRequest,
    CaptureCreateRequest,
    CaptureListResponse,
    CaptureRecord,
    ChatRequest,
    ChatResponse,
    HealthResponse,
    MediaSearchResponse,
    RouterDecisionResponse,
    RetrievalContextResponse,
    ScanResponse,
    SearchResponse,
    SettingsResponse,
    SettingsUpdateRequest,
    SpeechSynthesisRequest,
    SpeechSynthesisResponse,
    SpeechTranscriptionResponse,
    VisionRequest,
    VisionResponse,
)
from app.services.chat import build_chat_response, build_grounded_answer, build_retrieval_context
from app.services.captures import analyze_capture, create_capture, list_captures
from app.services.indexer import initialize_database
from app.services.library import build_document, extract_chunks, iter_library_files, resolve_library_path
from app.services.router import route_message
from app.services.runtime_settings import get_settings_response, load_runtime_settings, update_runtime_settings
from app.services.search import search_documents, search_media_documents, upsert_documents
from app.services.speech import decode_audio_data, synthesize_speech, transcribe_audio
from app.services.vision import identify_camera_frame


@asynccontextmanager
async def lifespan(_: FastAPI):
    settings = get_settings()
    initialize_database(settings.index_db_path)
    yield


app = FastAPI(title=get_settings().app_name, lifespan=lifespan)
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.mount("/captures", StaticFiles(directory="data/captures"), name="captures")
app.mount("/tts", StaticFiles(directory="data/tts"), name="tts")


@app.get("/", include_in_schema=False)
def root() -> FileResponse:
    return FileResponse("app/static/index.html")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        app=settings.app_name,
        environment=settings.app_env,
    )


@app.get("/settings", response_model=SettingsResponse)
def settings_get() -> SettingsResponse:
    return get_settings_response(get_settings())


@app.post("/settings", response_model=SettingsResponse)
def settings_update(payload: SettingsUpdateRequest) -> SettingsResponse:
    return update_runtime_settings(get_settings(), payload)


@app.post("/library/scan", response_model=ScanResponse)
def scan_library() -> ScanResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    library_root = Path(runtime["library_root"])
    library_root.mkdir(parents=True, exist_ok=True)
    documents = []
    chunks_by_path: dict[str, list[dict]] = {}

    for path in iter_library_files(library_root):
        document = build_document(library_root, path, settings.max_snippet_chars)
        documents.append(document)
        chunks_by_path[str(path)] = extract_chunks(path, settings.max_snippet_chars)

    indexed_count = upsert_documents(Path(runtime["index_db_path"]), documents, chunks_by_path)
    return ScanResponse(
        indexed_count=indexed_count,
        library_root=str(library_root),
    )


@app.get("/search", response_model=SearchResponse)
def search(query: str = Query(min_length=1), limit: int = Query(default=10, ge=1, le=50)) -> SearchResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    results = search_documents(Path(runtime["index_db_path"]), query, limit)
    return SearchResponse(query=query, total=len(results), results=results)


@app.get("/search/media", response_model=MediaSearchResponse)
def search_media(query: str = Query(min_length=1), limit: int = Query(default=12, ge=1, le=50)) -> MediaSearchResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    results = search_media_documents(Path(runtime["index_db_path"]), query, limit)
    for result in results:
        result.file_url = f"/library/file?path={quote(result.path)}"
    return MediaSearchResponse(query=query, total=len(results), results=results)


@app.get("/library/file", include_in_schema=False)
def library_file(path: str) -> FileResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    file_path = resolve_library_path(Path(runtime["library_root"]), path)
    return FileResponse(file_path)


@app.post("/chat/retrieve", response_model=ChatResponse)
def chat_retrieve(payload: ChatRequest) -> ChatResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    return build_chat_response(
        db_path=Path(runtime["index_db_path"]),
        message=payload.message,
        limit=payload.limit or runtime["default_chat_limit"],
    )


@app.post("/chat/context", response_model=RetrievalContextResponse)
def chat_context(payload: ChatRequest) -> RetrievalContextResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    return build_retrieval_context(
        db_path=Path(runtime["index_db_path"]),
        message=payload.message,
        limit=payload.limit or runtime["default_chat_limit"],
        window=runtime["retrieval_window"],
    )


@app.post("/chat/answer", response_model=ChatResponse)
def chat_answer(payload: ChatRequest) -> ChatResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    return build_grounded_answer(
        db_path=Path(runtime["index_db_path"]),
        message=payload.message,
        limit=payload.limit or runtime["default_chat_limit"],
        window=runtime["retrieval_window"],
        ollama_base_url=settings.ollama_base_url,
        ollama_model=runtime["chat_model"],
    )


@app.post("/vision/identify", response_model=VisionResponse)
def vision_identify(payload: VisionRequest) -> VisionResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    return identify_camera_frame(
        image_data=payload.image_data,
        prompt=payload.prompt,
        ollama_base_url=settings.ollama_base_url,
        ollama_model=runtime["vision_model"],
    )


@app.post("/router/route", response_model=RouterDecisionResponse)
def router_route(payload: ChatRequest) -> RouterDecisionResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    return route_message(payload.message, runtime["chat_model"], runtime["vision_model"])


@app.post("/speech/transcribe", response_model=SpeechTranscriptionResponse)
async def speech_transcribe(file: UploadFile = File(...)) -> SpeechTranscriptionResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    audio_bytes = await file.read()
    return transcribe_audio(audio_bytes=audio_bytes, whisper_model_size=runtime["whisper_model_size"])


@app.post("/speech/speak", response_model=SpeechSynthesisResponse)
def speech_speak(payload: SpeechSynthesisRequest) -> SpeechSynthesisResponse:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    return synthesize_speech(
        text=payload.text,
        piper_binary=runtime["piper_binary"],
        piper_model_path=runtime["piper_model_path"],
        output_dir=settings.tts_output_dir,
    )


@app.post("/camera/capture", response_model=CaptureRecord)
def camera_capture(payload: CaptureCreateRequest) -> CaptureRecord:
    settings = get_settings()
    return create_capture(settings.captures_dir, payload.image_data, payload.label)


@app.get("/camera/captures", response_model=CaptureListResponse)
def camera_captures() -> CaptureListResponse:
    settings = get_settings()
    return list_captures(settings.captures_dir)


@app.post("/camera/captures/analyze", response_model=CaptureRecord)
def camera_capture_analyze(payload: CaptureAnalyzeRequest) -> CaptureRecord:
    settings = get_settings()
    runtime = load_runtime_settings(settings)
    try:
        return analyze_capture(
            captures_dir=settings.captures_dir,
            capture_id=payload.capture_id,
            prompt=payload.prompt,
            ollama_base_url=settings.ollama_base_url,
            ollama_model=runtime["vision_model"],
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
