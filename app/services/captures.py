import base64
import json
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from app.schemas import CaptureListResponse, CaptureRecord
from app.services.vision import identify_camera_frame


def _metadata_path(captures_dir: Path) -> Path:
    return captures_dir / "captures.json"


def _read_metadata(captures_dir: Path) -> list[dict]:
    path = _metadata_path(captures_dir)
    if not path.exists():
        return []
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return []


def _write_metadata(captures_dir: Path, payload: list[dict]) -> None:
    _metadata_path(captures_dir).write_text(json.dumps(payload, indent=2), encoding="utf-8")


def create_capture(captures_dir: Path, image_data: str, label: str | None = None) -> CaptureRecord:
    if "," in image_data and image_data.startswith("data:"):
        header, encoded = image_data.split(",", 1)
        extension = ".jpg" if "jpeg" in header or "jpg" in header else ".png"
    else:
        encoded = image_data
        extension = ".jpg"

    capture_id = uuid4().hex[:12]
    filename = f"capture-{capture_id}{extension}"
    path = captures_dir / filename
    path.write_bytes(base64.b64decode(encoded))

    record = {
        "id": capture_id,
        "filename": filename,
        "path": str(path),
        "created_at": datetime.now(UTC).isoformat(),
        "label": label,
        "analysis": None,
    }
    payload = _read_metadata(captures_dir)
    payload.insert(0, record)
    _write_metadata(captures_dir, payload)
    return CaptureRecord(**record, image_url=f"/captures/{filename}")


def list_captures(captures_dir: Path) -> CaptureListResponse:
    payload = _read_metadata(captures_dir)
    return CaptureListResponse(
        captures=[
            CaptureRecord(**item, image_url=f"/captures/{item['filename']}")
            for item in payload
        ]
    )


def analyze_capture(
    captures_dir: Path,
    capture_id: str,
    prompt: str,
    ollama_base_url: str,
    ollama_model: str,
) -> CaptureRecord:
    payload = _read_metadata(captures_dir)
    for item in payload:
        if item["id"] != capture_id:
            continue
        image_bytes = Path(item["path"]).read_bytes()
        image_data = base64.b64encode(image_bytes).decode("utf-8")
        response = identify_camera_frame(
            image_data=image_data,
            prompt=prompt,
            ollama_base_url=ollama_base_url,
            ollama_model=ollama_model,
        )
        item["analysis"] = response.message
        _write_metadata(captures_dir, payload)
        return CaptureRecord(**item, image_url=f"/captures/{item['filename']}")
    raise FileNotFoundError(f"Capture {capture_id} not found")
