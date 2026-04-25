# Circuit Tablet v1

Circuit Tablet v1 is a local-first backend scaffold for a Raspberry Pi 5 tablet that searches an SSD-backed library of electrical textbooks, datasheets, diagrams, notes, and photos.

This first version focuses on:

- local library scanning
- file metadata tracking
- page-aware text extraction for PDFs
- chunk-aware retrieval ranking
- grounded local chat with citations
- a tablet-friendly local web UI
- image/diagram/map search with local file opening
- Pi-side speech hooks with `faster-whisper` and `Piper`
- camera preview plus local item recognition
- server-side capture saving and gallery browsing
- runtime settings and a simple semantic router

Future versions can add:

- local LLM inference with Qwen
- OCR for scanned PDFs and images
- embeddings and vector search
- camera capture and diagram inspection
- voice input and text-to-speech

## Project layout

```text
tablet/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── models.py
│   ├── schemas.py
│   └── services/
│       ├── chat.py
│       ├── indexer.py
│       ├── library.py
│       └── search.py
├── data/
│   ├── index/
│   └── library/
│       ├── datasheets/
│       ├── diagrams/
│       ├── manuals/
│       ├── notes/
│       ├── photos/
│       └── textbooks/
├── requirements.txt
└── .env.example
```

## What v1 does

1. Scans the local library folders on disk.
2. Extracts text from text files and PDFs.
3. Builds a lightweight SQLite index of files and page-aware text chunks.
4. Lets you search by query across filenames, tags, and extracted text.
5. Builds chunk-level retrieval context with nearby text windows.
6. Can call a local Ollama-served Qwen model for grounded answers with citations.
7. Can route requests between chat, vision, and media-oriented flows.
8. Supports Pi-side speech transcription with `faster-whisper` and speech output with `Piper`.
9. Saves server-side captures and lets you re-analyze them from a gallery.

## Quick start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Open the API docs at `http://127.0.0.1:8000/docs`.

## Local model setup

This project now supports grounded local answers through Ollama.

Example Pi setup:

```bash
ollama pull qwen2.5:1.5b
ollama pull qwen2.5vl:3b
ollama serve
```

Then set in `.env` if needed:

```env
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:1.5b
OLLAMA_VISION_MODEL=qwen2.5vl:3b
```

Useful endpoints:

- `GET /`: tablet UI
- `GET /settings`: current runtime settings
- `POST /settings`: update runtime settings from the UI
- `POST /chat/retrieve`: list best matching local sources
- `POST /chat/context`: inspect the grounded context sent to the model
- `POST /chat/answer`: get a grounded local-model answer
- `POST /router/route`: inspect the semantic route chosen for a request
- `GET /search/media`: search maps, diagrams, photos, and image-like assets
- `GET /library/file`: open a local library file through the app
- `POST /vision/identify`: analyze a captured camera frame with a local vision model
- `POST /speech/transcribe`: transcribe uploaded audio with `faster-whisper`
- `POST /speech/speak`: synthesize speech with `Piper`
- `POST /camera/capture`: save a camera frame to the server-side gallery
- `GET /camera/captures`: list saved captures
- `POST /camera/captures/analyze`: re-analyze a saved capture

## Camera recognition

The tablet UI now includes a live camera preview and frame analysis flow:

- browser camera preview using `getUserMedia`
- one-tap frame capture and analysis
- optional auto-analyze mode for repeatedly identifying what you are holding

The backend sends captured frames to a local Ollama vision model using the `images` field in `/api/chat`, which Ollama documents for vision-capable models. Official docs:

- [Ollama vision docs](https://docs.ollama.com/capabilities/vision)
- [Ollama chat API](https://docs.ollama.com/api/chat)

Example setup on the Pi:

```bash
ollama pull qwen2.5vl:3b
```

Then set:

```env
OLLAMA_VISION_MODEL=qwen2.5vl:3b
```

The camera UI can also save captures to a server-side gallery and re-run analysis on those saved images later.

## Voice support

The tablet UI now records audio in the browser and sends it to Pi-side speech services:

- microphone recording in the browser
- backend transcription with `faster-whisper`
- optional `Piper` playback through generated audio files

Example Pi-side speech settings:

```env
PIPER_BINARY=piper
PIPER_MODEL_PATH=/home/pi/models/piper/en_US-lessac-medium.onnx
WHISPER_MODEL_SIZE=base
```

If Pi-side speech is not configured yet, the UI still stays usable and returns clear fallback messages.

## Settings and router

The UI now includes a settings panel for:

- model selection
- library root path
- whisper and piper settings
- camera auto-analyze timing
- retrieval depth

There is also a simple semantic router that decides whether a request is best treated as:

- `chat`
- `vision`
- `media_search`

The router is intentionally lightweight in v1 so the core device features stay reliable first.

## Suggested SSD mount layout

Point `LIBRARY_ROOT` in `.env` at your SSD path. Example:

```env
LIBRARY_ROOT=/media/ssd/library
INDEX_DB_PATH=/media/ssd/index/library.db
```

Inside the library root:

```text
library/
├── textbooks/
├── datasheets/
├── manuals/
├── diagrams/
├── photos/
└── notes/
```

You do not need the SSD yet. The current default paths point at the local `data/library` folder so you can build and test now, then switch to the SSD later by editing `.env`.

## Current limitations

- PDF parsing is text-first in v1. Scanned PDFs still need OCR later.
- OCR is not enabled yet.
- Search is still lexical/SQLite-based, not embedding-based yet.
- The grounded answer path expects a local Ollama instance to be running.
- Media retrieval is metadata/text based for now, not CLIP-style visual similarity yet.
- Speech capture still begins in the browser, even though STT/TTS now run through Pi-side backend services.
- Camera recognition analyzes still frames from the browser preview and saved captures; it is not a full server-side MJPEG stream yet.

## Next planned additions

- add `nomic-embed-text` or `bge-small-en-v1.5` for semantic search
- add `Tesseract` for scanned PDFs and images
- add image/diagram retrieval

## Native App

This repository now also includes a real native Linux / Raspberry Pi desktop app built with `PySide6`.

Source:

- [native_app](/Users/jamesjohnson/Desktop/tablet/native_app)
- [requirements-native.txt](/Users/jamesjohnson/Desktop/tablet/requirements-native.txt)
- [desktop entry](/Users/jamesjohnson/Desktop/tablet/packaging/linux/circuit-tablet.desktop)

### Native features

- touch-friendly dark desktop shell
- left sidebar with chat history and document categories
- local SQLite persistence for chats, messages, and metadata
- seeded sample chats so the app looks complete on first launch
- document tree built from the local library folders
- document preview panel with file metadata and open-file actions
- chat composer with attach flow and quick actions
- settings dialog for local status and future system hooks

### Run locally

```bash
python3 -m venv .venv-native
source .venv-native/bin/activate
pip install -r requirements-native.txt
python -m native_app
```

### Raspberry Pi / Linux notes

- target a 64-bit Raspberry Pi OS or desktop Linux environment
- run the app fullscreen for tablet use
- if `pip` wheels for `PySide6` are unavailable on the Pi image, install the equivalent Qt/PySide packages from `apt` and then run `python -m native_app`
- the native app is local-first and does not depend on a browser tab

### Packaging direction

For a Pi deployment, package the native app as a normal desktop app:

1. install dependencies into a project venv
2. place the project under a stable path such as `/opt/circuit-tablet`

### Raspberry Pi autostart

For a tablet-style boot flow on Raspberry Pi OS Desktop, you can start the native app automatically on login.

The repository includes an autostart template:

- [packaging/linux/circuit-tablet-native-autostart.desktop](/Users/jamesjohnson/Desktop/tablet/packaging/linux/circuit-tablet-native-autostart.desktop)

If your Pi user is `blackgrid` and the project lives at `/home/blackgrid/tablet`, copy it into the desktop autostart folder:

```bash
mkdir -p /home/blackgrid/.config/autostart
cp /home/blackgrid/tablet/packaging/linux/circuit-tablet-native-autostart.desktop /home/blackgrid/.config/autostart/circuit-tablet-native.desktop
```

Then reboot or log out and back in.

The native app also includes two escape hatches for kiosk-like use:

- `Desktop`: exits fullscreen and minimizes the app so you can reach the normal Pi desktop
- `Home Folder`: opens the Pi home directory in the system file manager
3. copy [circuit-tablet.desktop](/Users/jamesjohnson/Desktop/tablet/packaging/linux/circuit-tablet.desktop) into `~/.local/share/applications/`
4. update the `Exec` and `Path` values if needed for your install location
