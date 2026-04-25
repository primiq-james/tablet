import httpx


class LLMServiceError(RuntimeError):
    pass


def answer_with_ollama(base_url: str, model: str, system_prompt: str, user_prompt: str) -> str:
    try:
        response = httpx.post(
            f"{base_url.rstrip('/')}/api/chat",
            json={
                "model": model,
                "stream": False,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            },
            timeout=60.0,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise LLMServiceError(f"Could not reach Ollama at {base_url}: {exc}") from exc

    payload = response.json()
    message = payload.get("message", {}).get("content", "").strip()
    if not message:
        raise LLMServiceError("Ollama returned an empty response.")
    return message


def analyze_image_with_ollama(
    base_url: str,
    model: str,
    system_prompt: str,
    user_prompt: str,
    image_base64: str,
) -> str:
    try:
        response = httpx.post(
            f"{base_url.rstrip('/')}/api/chat",
            json={
                "model": model,
                "stream": False,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": user_prompt,
                        "images": [image_base64],
                    },
                ],
            },
            timeout=90.0,
        )
        response.raise_for_status()
    except httpx.HTTPError as exc:
        raise LLMServiceError(f"Could not reach Ollama at {base_url}: {exc}") from exc

    payload = response.json()
    message = payload.get("message", {}).get("content", "").strip()
    if not message:
        raise LLMServiceError("Ollama vision model returned an empty response.")
    return message
