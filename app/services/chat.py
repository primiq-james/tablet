from pathlib import Path

from app.schemas import ChatResponse, Citation, RetrievalContextResponse
from app.services.llm import LLMServiceError, answer_with_ollama
from app.services.search import fetch_chunk_window, search_documents, search_ranked_chunks


def build_chat_response(db_path, message: str, limit: int) -> ChatResponse:
    results = search_documents(db_path, message, limit)

    if not results:
        return ChatResponse(
            message=(
                "I could not find matching local documents yet. Try scanning the library first "
                "or use more specific part names, circuit names, or equipment keywords."
            ),
            citations=[],
        )

    citation_lines = []
    citations = []

    for result in results:
        citation_lines.append(
            f"- {result.title} ({result.category}"
            + (f", page {result.page_number}" if result.page_number else "")
            + f") -> {result.path}"
        )
        citations.append(
            Citation(
                path=result.path,
                title=result.title,
                category=result.category,
                page_number=result.page_number,
            )
        )

    return ChatResponse(
        message=(
            "Here is the local material most relevant to your question:\n\n"
            + "\n".join(citation_lines)
            + "\n\n"
            + "The next step is to feed these retrieved snippets into the local LLM so the tablet "
            + "can answer from your SSD library instead of guessing."
        ),
        citations=citations,
    )


def build_retrieval_context(db_path: Path, message: str, limit: int, window: int) -> RetrievalContextResponse:
    results = search_ranked_chunks(db_path, message, limit)

    if not results:
        return RetrievalContextResponse(query=message, context="", citations=[])

    context_sections = []
    citations = []
    seen_documents: set[tuple[str, int | None, int | None]] = set()

    for result in results:
        key = (result.path, result.page_number, result.chunk_index)
        if key in seen_documents:
            continue
        seen_documents.add(key)
        expanded = fetch_chunk_window(
            db_path=db_path,
            document_path=result.path,
            page_number=result.page_number,
            chunk_index=result.chunk_index,
            window=window,
        ) or result.snippet
        location = f"page {result.page_number}" if result.page_number else "file"
        context_sections.append(
            f"[Source: {result.title} | {result.category} | {location}]\n{expanded}"
        )
        citations.append(
            Citation(
                path=result.path,
                title=result.title,
                category=result.category,
                page_number=result.page_number,
                chunk_index=result.chunk_index,
            )
        )

    return RetrievalContextResponse(
        query=message,
        context="\n\n".join(context_sections),
        citations=citations,
    )


def build_grounded_answer(
    db_path: Path,
    message: str,
    limit: int,
    window: int,
    ollama_base_url: str,
    ollama_model: str,
) -> ChatResponse:
    retrieval = build_retrieval_context(db_path=db_path, message=message, limit=limit, window=window)

    if not retrieval.citations or not retrieval.context:
        return ChatResponse(
            message=(
                "I could not find enough local material to answer that yet. "
                "Try scanning the library first or ask with specific parts, systems, crops, or document names."
            ),
            citations=[],
            grounded=False,
        )

    system_prompt = (
        "You are a local-first engineering and field-reference assistant. "
        "Answer only from the provided context. If the context is incomplete, say what is missing. "
        "Do not invent facts. Keep the answer practical and concise, and end with a short Sources section."
    )
    user_prompt = (
        f"Question:\n{message}\n\n"
        f"Context:\n{retrieval.context}\n\n"
        "Write a grounded answer using the context above."
    )

    try:
        answer = answer_with_ollama(
            base_url=ollama_base_url,
            model=ollama_model,
            system_prompt=system_prompt,
            user_prompt=user_prompt,
        )
    except LLMServiceError as exc:
        fallback_message = (
            "Local retrieval is ready, but the local LLM call failed.\n\n"
            f"Reason: {exc}\n\n"
            "Retrieved sources:\n"
            + "\n".join(
                f"- {citation.title} ({citation.category}"
                + (f", page {citation.page_number}" if citation.page_number else "")
                + ")"
                for citation in retrieval.citations
            )
        )
        return ChatResponse(message=fallback_message, citations=retrieval.citations, grounded=False)

    return ChatResponse(message=answer, citations=retrieval.citations, grounded=True)
