from app.schemas import RouterDecisionResponse


def route_message(message: str, chat_model: str, vision_model: str) -> RouterDecisionResponse:
    normalized = message.lower()

    if any(term in normalized for term in ("look at", "camera", "holding", "what is this", "identify this")):
        return RouterDecisionResponse(
            route="vision",
            reason="The request asks to inspect or identify a visible item.",
            target_model=vision_model,
            metadata={"mode": "image-understanding"},
        )

    if any(term in normalized for term in ("code", "python", "script", "function", "api", "debug")):
        return RouterDecisionResponse(
            route="chat",
            reason="The request is coding-oriented but still fits the local Qwen chat model.",
            target_model=chat_model,
            metadata={"domain": "coding"},
        )

    if any(term in normalized for term in ("map", "diagram", "photo", "image")):
        return RouterDecisionResponse(
            route="media_search",
            reason="The request is asking for media-like assets.",
            target_model=chat_model,
            metadata={"domain": "media"},
        )

    return RouterDecisionResponse(
        route="chat",
        reason="Default local knowledge route.",
        target_model=chat_model,
        metadata={"domain": "general"},
    )
