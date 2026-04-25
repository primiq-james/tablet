from pathlib import Path
from typing import List
import re

from app.schemas import MediaResult, SearchResult
from app.services.indexer import get_connection

STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "do",
    "for",
    "how",
    "i",
    "in",
    "is",
    "me",
    "my",
    "of",
    "on",
    "or",
    "the",
    "to",
    "what",
    "when",
}


def _normalize_term(term: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "", term.lower())
    if cleaned.endswith("s") and len(cleaned) > 4:
        cleaned = cleaned[:-1]
    return cleaned


def _query_terms(query: str) -> list[str]:
    normalized_terms = []
    for term in query.split():
        normalized = _normalize_term(term)
        if not normalized or normalized in STOPWORDS:
            continue
        normalized_terms.append(normalized)
    return normalized_terms


def _coverage_score(result: SearchResult, terms: list[str]) -> tuple[int, int]:
    haystack = " ".join(
        [
            result.title.lower(),
            result.category.lower(),
            result.snippet.lower(),
        ]
    )
    coverage = 0
    title_hits = 0
    for term in terms:
        if term in haystack:
            coverage += 1
        if term in result.title.lower():
            title_hits += 1
    return coverage, title_hits


def upsert_documents(db_path: Path, documents: list, chunks_by_path: dict[str, list[dict]]) -> int:
    with get_connection(db_path) as connection:
        for document in documents:
            connection.execute(
                """
                INSERT INTO documents (path, category, title, extension, size_bytes, snippet)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT(path) DO UPDATE SET
                    category = excluded.category,
                    title = excluded.title,
                    extension = excluded.extension,
                    size_bytes = excluded.size_bytes,
                    snippet = excluded.snippet
                """,
                (
                    str(document.path),
                    document.category,
                    document.title,
                    document.extension,
                    document.size_bytes,
                    document.snippet,
                ),
            )
            connection.execute(
                "DELETE FROM chunks WHERE document_path = ?",
                (str(document.path),),
            )
            for chunk in chunks_by_path.get(str(document.path), []):
                connection.execute(
                    """
                    INSERT INTO chunks (document_path, page_number, chunk_index, content)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        str(document.path),
                        chunk["page_number"],
                        chunk["chunk_index"],
                        chunk["content"],
                    ),
                )
        connection.commit()
    return len(documents)


def _build_term_filters(query: str) -> tuple[str, str, list]:
    terms = _query_terms(query)
    if not terms:
        return "", "", []

    score_clauses = []
    where_clauses = []
    parameters: list = []
    phrase_wildcard = f"%{query.strip().lower()}%"

    score_clauses.extend(
        [
            "CASE WHEN lower(d.title) LIKE ? THEN 8 ELSE 0 END",
            "CASE WHEN lower(COALESCE(c.content, d.snippet)) LIKE ? THEN 6 ELSE 0 END",
        ]
    )
    parameters.extend([phrase_wildcard, phrase_wildcard])

    for term in terms:
        wildcard = f"%{term}%"
        score_clauses.append("CASE WHEN lower(d.title) LIKE ? THEN 5 ELSE 0 END")
        parameters.append(wildcard)
        score_clauses.append("CASE WHEN lower(d.category) LIKE ? THEN 3 ELSE 0 END")
        parameters.append(wildcard)
        score_clauses.append("CASE WHEN lower(COALESCE(c.content, d.snippet)) LIKE ? THEN 2 ELSE 0 END")
        parameters.append(wildcard)
        where_clauses.append(
            "(lower(d.title) LIKE ? OR lower(d.category) LIKE ? OR lower(COALESCE(c.content, d.snippet)) LIKE ?)"
        )
        parameters.extend([wildcard, wildcard, wildcard])

    return " + ".join(score_clauses), " OR ".join(where_clauses), parameters


def search_documents(db_path: Path, query: str, limit: int) -> List[SearchResult]:
    score_sql, where_sql, parameters = _build_term_filters(query)
    if not parameters:
        return []

    with get_connection(db_path) as connection:
        rows = connection.execute(
            f"""
            SELECT
                d.path,
                d.category,
                d.title,
                d.extension,
                c.page_number,
                c.chunk_index,
                COALESCE(c.content, d.snippet) AS snippet,
                ({score_sql}) AS score
            FROM documents d
            LEFT JOIN chunks c ON c.document_path = d.path
            WHERE {where_sql}
            ORDER BY score DESC, d.title ASC, c.page_number ASC, c.chunk_index ASC
            LIMIT ?
            """,
            (*parameters, limit),
        ).fetchall()

    results = [
        SearchResult(
            path=row["path"],
            category=row["category"],
            title=row["title"],
            extension=row["extension"],
            page_number=row["page_number"],
            chunk_index=row["chunk_index"],
            snippet=row["snippet"],
            score=row["score"],
        )
        for row in rows
    ]
    terms = _query_terms(query)
    results.sort(
        key=lambda result: (
            _coverage_score(result, terms)[0],
            _coverage_score(result, terms)[1],
            result.score,
            -len(result.snippet),
        ),
        reverse=True,
    )
    return results[:limit]


def search_ranked_chunks(db_path: Path, query: str, limit: int) -> List[SearchResult]:
    score_sql, where_sql, parameters = _build_term_filters(query)
    if not parameters:
        return []

    with get_connection(db_path) as connection:
        rows = connection.execute(
            f"""
            SELECT
                d.path,
                d.category,
                d.title,
                d.extension,
                c.page_number,
                c.chunk_index,
                c.content AS snippet,
                ({score_sql}) AS score
            FROM chunks c
            JOIN documents d ON d.path = c.document_path
            WHERE {where_sql}
            ORDER BY score DESC, d.title ASC, c.page_number ASC, c.chunk_index ASC
            LIMIT ?
            """,
            (*parameters, limit * 3),
        ).fetchall()

    candidates: list[SearchResult] = []

    for row in rows:
        candidates.append(
            SearchResult(
                path=row["path"],
                category=row["category"],
                title=row["title"],
                extension=row["extension"],
                page_number=row["page_number"],
                chunk_index=row["chunk_index"],
                snippet=row["snippet"],
                score=row["score"],
            )
        )

    terms = _query_terms(query)
    candidates.sort(
        key=lambda result: (
            _coverage_score(result, terms)[0],
            _coverage_score(result, terms)[1],
            result.score,
            -len(result.snippet),
        ),
        reverse=True,
    )

    seen: set[tuple[str, int | None, int | None]] = set()
    results: list[SearchResult] = []
    for candidate in candidates:
        key = (candidate.path, candidate.page_number, candidate.chunk_index)
        if key in seen:
            continue
        seen.add(key)
        results.append(candidate)
        if len(results) >= limit:
            break

    return results


def fetch_chunk_window(
    db_path: Path,
    document_path: str,
    page_number: int | None,
    chunk_index: int | None,
    window: int,
) -> str:
    if page_number is None or chunk_index is None:
        return ""

    with get_connection(db_path) as connection:
        rows = connection.execute(
            """
            SELECT content
            FROM chunks
            WHERE document_path = ?
              AND page_number = ?
              AND chunk_index BETWEEN ? AND ?
            ORDER BY chunk_index ASC
            """,
            (document_path, page_number, chunk_index - window, chunk_index + window),
        ).fetchall()

    return "\n".join(row["content"] for row in rows if row["content"]).strip()


def search_media_documents(db_path: Path, query: str, limit: int) -> List[MediaResult]:
    terms = _query_terms(query)
    if not terms:
        return []

    clauses = []
    parameters: list = []
    for term in terms:
        wildcard = f"%{term}%"
        clauses.append(
            """
            (
                lower(title) LIKE ?
                OR lower(category) LIKE ?
                OR lower(snippet) LIKE ?
                OR lower(path) LIKE ?
            )
            """
        )
        parameters.extend([wildcard, wildcard, wildcard, wildcard])

    with get_connection(db_path) as connection:
        rows = connection.execute(
            f"""
            SELECT
                path,
                category,
                title,
                extension,
                snippet,
                (
                    CASE WHEN extension IN ('.png', '.jpg', '.jpeg', '.webp') THEN 8 ELSE 0 END +
                    CASE WHEN lower(category) IN ('diagrams', 'photos', 'maps') THEN 6 ELSE 0 END +
                    CASE WHEN lower(title) LIKE ? THEN 5 ELSE 0 END +
                    CASE WHEN lower(path) LIKE ? THEN 4 ELSE 0 END +
                    CASE WHEN lower(snippet) LIKE ? THEN 3 ELSE 0 END
                ) AS score
            FROM documents
            WHERE ({' OR '.join(clauses)})
              AND (
                    extension IN ('.png', '.jpg', '.jpeg', '.webp', '.pdf')
                    OR lower(category) IN ('diagrams', 'photos', 'maps')
                  )
            ORDER BY score DESC, title ASC
            LIMIT ?
            """,
            (f"%{query.lower()}%", f"%{query.lower()}%", f"%{query.lower()}%", *parameters, limit * 12),
        ).fetchall()

    results = [
        MediaResult(
            path=row["path"],
            category=row["category"],
            title=row["title"],
            extension=row["extension"],
            snippet=row["snippet"],
            score=row["score"],
            previewable=row["extension"] in {".png", ".jpg", ".jpeg", ".webp"},
            file_url=f"/library/file?path={row['path']}",
        )
        for row in rows
    ]

    results.sort(
        key=lambda result: (
            sum(1 for term in terms if term in " ".join([result.title.lower(), result.path.lower(), result.snippet.lower()])),
            sum(1 for term in terms if term in result.title.lower()),
            result.score,
        ),
        reverse=True,
    )
    return results[:limit]
