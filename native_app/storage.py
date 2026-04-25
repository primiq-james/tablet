from __future__ import annotations

import json
import sqlite3
from collections import defaultdict
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path

from native_app.config import NativeConfig
from native_app.indexer import index_library


class Storage:
    def __init__(self, config: NativeConfig) -> None:
        self.config = config
        self.config.ensure_directories()
        self.connection = sqlite3.connect(self.config.database_path)
        self.connection.row_factory = sqlite3.Row

    def initialize(self) -> None:
        self.connection.executescript(
            """
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS chats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                chat_id INTEGER NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                references_json TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL,
                FOREIGN KEY(chat_id) REFERENCES chats(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                path TEXT NOT NULL UNIQUE,
                extension TEXT NOT NULL,
                size_bytes INTEGER NOT NULL,
                modified_at TEXT NOT NULL,
                summary TEXT NOT NULL DEFAULT ''
            );

            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            """
        )
        self.connection.commit()
        self.reindex_documents()
        self._seed_defaults_if_needed()

    def _now(self) -> str:
        return datetime.now(UTC).isoformat()

    def _seed_defaults_if_needed(self) -> None:
        self._purge_seed_chats()

        self.set_setting("theme", "dark")
        self.set_setting("offline_mode", "true")
        self.set_setting("backend_status", "Local backend placeholder")
        self.set_setting("index_status", "Indexed from local library")

    def _purge_seed_chats(self) -> None:
        self.connection.execute(
            """
            DELETE FROM chats
            WHERE title IN ('Shelter Build Plan', 'North Arkansas Planting Notes', 'Power Bench Setup')
            """
        )
        self.connection.commit()

    def reindex_documents(self) -> None:
        documents = index_library(self.config.library_root)
        with self.connection:
            self.connection.execute("DELETE FROM documents")
            self.connection.executemany(
                """
                INSERT INTO documents (category, title, path, extension, size_bytes, modified_at, summary)
                VALUES (:category, :title, :path, :extension, :size_bytes, :modified_at, :summary)
                """,
                [asdict(document) for document in documents],
            )

    def list_chats(self, query: str = "") -> list[dict]:
        rows = self.connection.execute(
            """
            SELECT
                chats.id,
                chats.title,
                chats.updated_at,
                COALESCE(
                    (
                        SELECT content
                        FROM messages
                        WHERE messages.chat_id = chats.id
                        ORDER BY messages.created_at DESC
                        LIMIT 1
                    ),
                    ''
                ) AS preview
            FROM chats
            WHERE lower(title) LIKE ?
            ORDER BY updated_at DESC
            """,
            (f"%{query.lower()}%",),
        ).fetchall()
        return [dict(row) for row in rows]

    def create_chat(self, title: str = "New Chat") -> int:
        now = self._now()
        cursor = self.connection.execute(
            "INSERT INTO chats (title, created_at, updated_at) VALUES (?, ?, ?)",
            (title, now, now),
        )
        self.connection.commit()
        return int(cursor.lastrowid)

    def rename_chat(self, chat_id: int, title: str) -> None:
        now = self._now()
        self.connection.execute(
            "UPDATE chats SET title = ?, updated_at = ? WHERE id = ?",
            (title, now, chat_id),
        )
        self.connection.commit()

    def delete_chat(self, chat_id: int) -> None:
        self.connection.execute("DELETE FROM chats WHERE id = ?", (chat_id,))
        self.connection.commit()

    def add_message(self, chat_id: int, role: str, content: str, references: list[str] | None = None) -> int:
        now = self._now()
        cursor = self.connection.execute(
            """
            INSERT INTO messages (chat_id, role, content, references_json, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (chat_id, role, content, json.dumps(references or []), now),
        )
        self.connection.execute("UPDATE chats SET updated_at = ? WHERE id = ?", (now, chat_id))
        self.connection.commit()
        return int(cursor.lastrowid)

    def get_messages(self, chat_id: int) -> list[dict]:
        rows = self.connection.execute(
            """
            SELECT id, role, content, references_json, created_at
            FROM messages
            WHERE chat_id = ?
            ORDER BY created_at ASC
            """,
            (chat_id,),
        ).fetchall()
        messages = []
        for row in rows:
            item = dict(row)
            item["references"] = json.loads(item.pop("references_json"))
            messages.append(item)
        return messages

    def list_documents(self) -> list[dict]:
        rows = self.connection.execute(
            """
            SELECT id, category, title, path, extension, size_bytes, modified_at, summary
            FROM documents
            ORDER BY category ASC, title ASC
            """
        ).fetchall()
        return [dict(row) for row in rows]

    def documents_by_category(self) -> dict[str, list[dict]]:
        grouped: dict[str, list[dict]] = defaultdict(list)
        for document in self.list_documents():
            grouped[document["category"]].append(document)
        return dict(grouped)

    def search_documents(self, query: str, limit: int = 8) -> list[dict]:
        rows = self.connection.execute(
            """
            SELECT id, category, title, path, extension, size_bytes, modified_at, summary
            FROM documents
            WHERE lower(title) LIKE ?
               OR lower(category) LIKE ?
               OR lower(summary) LIKE ?
               OR lower(path) LIKE ?
            ORDER BY title ASC
            LIMIT ?
            """,
            tuple([f"%{query.lower()}%"] * 4 + [limit]),
        ).fetchall()
        return [dict(row) for row in rows]

    def get_document_by_path(self, path: str) -> dict | None:
        row = self.connection.execute(
            """
            SELECT id, category, title, path, extension, size_bytes, modified_at, summary
            FROM documents
            WHERE path = ?
            """,
            (path,),
        ).fetchone()
        return dict(row) if row else None

    def get_document_by_id(self, document_id: int) -> dict | None:
        row = self.connection.execute(
            """
            SELECT id, category, title, path, extension, size_bytes, modified_at, summary
            FROM documents
            WHERE id = ?
            """,
            (document_id,),
        ).fetchone()
        return dict(row) if row else None

    def get_setting(self, key: str, default: str = "") -> str:
        row = self.connection.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
        return row["value"] if row else default

    def set_setting(self, key: str, value: str) -> None:
        self.connection.execute(
            """
            INSERT INTO settings (key, value)
            VALUES (?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (key, value),
        )
        self.connection.commit()

    def all_settings(self) -> dict[str, str]:
        rows = self.connection.execute("SELECT key, value FROM settings ORDER BY key ASC").fetchall()
        return {row["key"]: row["value"] for row in rows}

    def close(self) -> None:
        self.connection.close()
