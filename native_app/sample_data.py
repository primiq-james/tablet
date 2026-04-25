from __future__ import annotations

from collections import defaultdict


def build_seed_chats(documents: list[dict]) -> list[dict]:
    by_category: dict[str, list[dict]] = defaultdict(list)
    for document in documents:
        by_category[document["category"]].append(document)

    def refs(category: str, limit: int = 2) -> list[str]:
        return [item["path"] for item in by_category.get(category, [])[:limit]]

    return [
        {
            "title": "Shelter Build Plan",
            "messages": [
                {
                    "role": "user",
                    "content": "What local documents should I start with for converting a shipping container into a durable shelter?",
                    "references": [],
                },
                {
                    "role": "assistant",
                    "content": (
                        "Start with the structural and shelter references first, then layer in insulation and power. "
                        "I would begin with the FEMA safe-room material and the container permitting guide, then keep the power-system references nearby."
                    ),
                    "references": refs("manuals") + refs("datasheets", 1),
                },
            ],
        },
        {
            "title": "North Arkansas Planting Notes",
            "messages": [
                {
                    "role": "user",
                    "content": "When should I plant cucumbers and tomatoes in northern Arkansas?",
                    "references": [],
                },
                {
                    "role": "assistant",
                    "content": (
                        "Your local farming shelf already has the right references. The cucumber guide and Arkansas planting chart are the key ones. "
                        "Use the chart for seasonal windows and then confirm crop-specific notes in the individual vegetable sheets."
                    ),
                    "references": refs("farming"),
                },
            ],
        },
        {
            "title": "Power Bench Setup",
            "messages": [
                {
                    "role": "user",
                    "content": "Build me a small local bench reference for regulators, timers, and wiring diagrams.",
                    "references": [],
                },
                {
                    "role": "assistant",
                    "content": (
                        "Your circuitry shelf is strong already. Keep the LM7805 family sheet, NE555 sheet, and the NEETS wiring and power-supply modules pinned. "
                        "That gives you regulation, timing, and schematic-reading coverage in one place."
                    ),
                    "references": refs("datasheets") + refs("textbooks"),
                },
            ],
        },
    ]
