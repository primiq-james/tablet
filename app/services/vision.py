from app.schemas import VisionResponse
from app.services.llm import LLMServiceError, analyze_image_with_ollama


def normalize_image_data(image_data: str) -> str:
    if "," in image_data and image_data.startswith("data:"):
        return image_data.split(",", 1)[1]
    return image_data


def identify_camera_frame(
    image_data: str,
    prompt: str,
    ollama_base_url: str,
    ollama_model: str,
) -> VisionResponse:
    normalized_image = normalize_image_data(image_data)
    system_prompt = (
        "You are a practical local vision assistant for a field tablet. "
        "Look at the image and identify the main item, component, device, tool, or object being shown. "
        "If it appears to be an electrical component, board, connector, housing item, farming item, or building material, say so clearly. "
        "If uncertain, give the most likely possibilities and say what visual cues led you there. "
        "Be concise and practical."
    )

    try:
        answer = analyze_image_with_ollama(
            base_url=ollama_base_url,
            model=ollama_model,
            system_prompt=system_prompt,
            user_prompt=prompt,
            image_base64=normalized_image,
        )
    except LLMServiceError as exc:
        return VisionResponse(
            message=(
                "Camera preview is working, but the local vision model call failed.\n\n"
                f"Reason: {exc}\n\n"
                "Start a compatible Ollama vision model and try again."
            ),
            model=ollama_model,
            grounded=False,
        )

    return VisionResponse(message=answer, model=ollama_model, grounded=True)
