from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class NativeConfig:
    app_name: str = "Circuit Tablet Native"
    data_root: Path = Path("data/native")
    library_root: Path = Path("data/library")
    database_name: str = "tablet_native.db"

    @property
    def database_path(self) -> Path:
        return self.data_root / self.database_name

    def ensure_directories(self) -> None:
        self.data_root.mkdir(parents=True, exist_ok=True)
        self.library_root.mkdir(parents=True, exist_ok=True)
