from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


SUPPORTED_DOCUMENT_EXTENSIONS = {
    ".pdf",
    ".txt",
    ".md",
    ".svg",
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
}


@dataclass(slots=True)
class IndexedDocument:
    category: str
    title: str
    path: str
    extension: str
    size_bytes: int
    modified_at: str
    summary: str


def _category_for_file(library_root: Path, file_path: Path) -> str:
    parts = file_path.relative_to(library_root).parts
    return parts[0] if parts else "Uncategorized"


def _summary_for_file(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix in {".txt", ".md"}:
        try:
            return file_path.read_text(encoding="utf-8", errors="ignore")[:240].replace("\n", " ").strip()
        except OSError:
            return "Text document"
    if suffix == ".pdf":
        return "PDF reference document"
    if suffix in {".svg", ".png", ".jpg", ".jpeg", ".webp"}:
        return "Image or diagram asset"
    return "Local document"


def index_library(library_root: Path) -> list[IndexedDocument]:
    documents: list[IndexedDocument] = []
    if not library_root.exists():
        return documents

    for file_path in sorted(library_root.rglob("*")):
        if not file_path.is_file():
            continue
        if file_path.suffix.lower() not in SUPPORTED_DOCUMENT_EXTENSIONS:
            continue

        stat = file_path.stat()
        documents.append(
            IndexedDocument(
                category=_category_for_file(library_root, file_path),
                title=file_path.stem.replace("-", " ").replace("_", " ").title(),
                path=str(file_path.resolve()),
                extension=file_path.suffix.lower(),
                size_bytes=stat.st_size,
                modified_at=str(int(stat.st_mtime)),
                summary=_summary_for_file(file_path),
            )
        )

    return documents
