from pathlib import Path
from typing import Iterable

import fitz
from fastapi import HTTPException

from app.models import IndexedDocument


SUPPORTED_EXTENSIONS = {
    ".txt",
    ".md",
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}

PREVIEWABLE_IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}


def iter_library_files(library_root: Path) -> Iterable[Path]:
    for path in library_root.rglob("*"):
        if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS:
            yield path


def category_for_path(library_root: Path, path: Path) -> str:
    relative_parts = path.relative_to(library_root).parts
    return relative_parts[0] if relative_parts else "uncategorized"


def extract_snippet(path: Path, max_chars: int) -> str:
    suffix = path.suffix.lower()

    if suffix in {".txt", ".md"}:
        try:
            return path.read_text(encoding="utf-8", errors="ignore")[:max_chars].strip()
        except OSError:
            return ""

    if suffix == ".pdf":
        try:
            with fitz.open(path) as document:
                for page in document:
                    text = page.get_text("text").strip()
                    if text:
                        return text[:max_chars]
        except (RuntimeError, OSError):
            return f"PDF document: {path.stem}"
        return f"PDF document: {path.stem}"

    if suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        return f"Image asset: {path.stem}"

    return ""


def build_document(library_root: Path, path: Path, max_chars: int) -> IndexedDocument:
    return IndexedDocument(
        path=path,
        category=category_for_path(library_root, path),
        title=path.stem,
        extension=path.suffix.lower(),
        size_bytes=path.stat().st_size,
        snippet=extract_snippet(path, max_chars),
    )


def _chunk_text(text: str, max_chars: int) -> list[str]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []

    return [
        cleaned[index:index + max_chars].strip()
        for index in range(0, len(cleaned), max_chars)
        if cleaned[index:index + max_chars].strip()
    ]


def extract_chunks(path: Path, max_chars: int) -> list[dict]:
    suffix = path.suffix.lower()

    if suffix in {".txt", ".md"}:
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            return []

        return [
            {"page_number": 1, "chunk_index": index, "content": chunk}
            for index, chunk in enumerate(_chunk_text(content, max_chars), start=1)
        ]

    if suffix == ".pdf":
        try:
            with fitz.open(path) as document:
                chunks: list[dict] = []
                for page_number, page in enumerate(document, start=1):
                    text = page.get_text("text")
                    for chunk_index, chunk in enumerate(_chunk_text(text, max_chars), start=1):
                        chunks.append(
                            {
                                "page_number": page_number,
                                "chunk_index": chunk_index,
                                "content": chunk,
                            }
                        )
                return chunks
        except (RuntimeError, OSError):
            return []

    if suffix in {".png", ".jpg", ".jpeg", ".webp"}:
        return [
            {
                "page_number": None,
                "chunk_index": 1,
                "content": f"Image asset named {path.stem}",
            }
        ]

    return []


def resolve_library_path(library_root: Path, relative_path: str) -> Path:
    root = library_root.resolve()
    raw_candidate = Path(relative_path)

    if raw_candidate.is_absolute():
        candidate = raw_candidate.resolve()
    else:
        candidate = raw_candidate.resolve()
        if root not in candidate.parents and candidate != root:
            candidate = (library_root / relative_path).resolve()

    if root not in candidate.parents and candidate != root:
        raise HTTPException(status_code=400, detail="Invalid library path.")
    if not candidate.exists() or not candidate.is_file():
        raise HTTPException(status_code=404, detail="Library file not found.")
    return candidate
