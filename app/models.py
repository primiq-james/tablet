from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class IndexedDocument:
    path: Path
    category: str
    title: str
    extension: str
    size_bytes: int
    snippet: str
