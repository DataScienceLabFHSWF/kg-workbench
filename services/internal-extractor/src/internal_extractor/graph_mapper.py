import json
from typing import Any

from neo4j_graphrag.experimental.components.types import (
    Neo4jGraph,
    Neo4jRelationship,
    TextChunk,
    TextChunks,
)

from .models import (
    ExtractionEntityAttribute,
    ExtractionEntityResult,
    ExtractionEvidence,
    ExtractionFactResult,
    ExtractionResultsResponse,
    ParagraphResult,
    SectionResult,
)
from .text_sections import DEFAULT_SECTION_TITLE, DetectedSection

DISPLAY_PROPERTY_NAMES = ("entity_text", "name", "text", "title", "label")
SYNTHETIC_DISPLAY_PROPERTY_NAME = "entity_text"
LEXICAL_CHUNK_RELATION_TYPES = {"FROM_CHUNK"}
LLM_SECTION_TITLE_PROPERTY_NAMES = ("section_title", "sectionTitle", "source_section")


def stringify(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, (bool, int, float)):
        return str(value)
    return json.dumps(value, ensure_ascii=False)


def is_human_readable_identifier(value: str) -> bool:
    normalized = value.strip()
    if not normalized:
        return False
    return not normalized.isdigit()


def display_value(value: Any) -> str | None:
    text = stringify(value).strip()
    return text if is_human_readable_identifier(text) else None


def entity_text(node_id: str, label: str, properties: dict[str, Any]) -> str:
    for key in DISPLAY_PROPERTY_NAMES:
        value = properties.get(key)
        if value:
            text = display_value(value)
            if text:
                return text

    for key, value in properties.items():
        if "name" not in key.lower():
            continue
        text = display_value(value)
        if text:
            return text

    for key, value in properties.items():
        if key == SYNTHETIC_DISPLAY_PROPERTY_NAME:
            continue
        text = display_value(value)
        if text:
            return text

    fallback = node_id.split(":")[-1]
    if is_human_readable_identifier(fallback):
        return fallback
    return f"{label} {fallback}"


def paragraph_id_from_node_id(node_id: str) -> str | None:
    return node_id.split(":", 1)[0] if ":" in node_id else None


def chunk_id(chunk: TextChunk) -> str:
    return getattr(chunk, "uid", None) or getattr(chunk, "chunk_id")


def build_section_results(
    chunks: TextChunks, detected_sections: list[DetectedSection] | None
) -> tuple[list[SectionResult], dict[str, str]]:
    chunk_by_id = {chunk_id(chunk): chunk for chunk in chunks.chunks}
    section_title_by_chunk_id: dict[str, str] = {}

    if detected_sections:
        sections: list[SectionResult] = []
        for section in detected_sections:
            paragraphs = [
                ParagraphResult(id=paragraph_id, content=chunk_by_id[paragraph_id].text)
                for paragraph_id in section.chunk_ids
                if paragraph_id in chunk_by_id
            ]
            if not paragraphs:
                continue
            for paragraph in paragraphs:
                section_title_by_chunk_id[paragraph.id] = section.title
            sections.append(
                SectionResult(id=section.id, title=section.title, paragraphs=paragraphs)
            )
        if sections:
            return sections, section_title_by_chunk_id

    paragraphs = [
        ParagraphResult(id=chunk_id(chunk), content=chunk.text) for chunk in chunks.chunks
    ]
    section_title_by_chunk_id = {
        paragraph.id: DEFAULT_SECTION_TITLE for paragraph in paragraphs
    }
    return (
        [
            SectionResult(
                id="section-1",
                title=DEFAULT_SECTION_TITLE,
                paragraphs=paragraphs,
            )
        ],
        section_title_by_chunk_id,
    )


def build_llm_section_results(
    chunks: TextChunks, title_by_chunk_id: dict[str, str]
) -> list[SectionResult]:
    sections: list[SectionResult] = []
    current_title: str | None = None
    current_paragraphs: list[ParagraphResult] = []

    def flush_section() -> None:
        nonlocal current_title, current_paragraphs
        if current_title and current_paragraphs:
            sections.append(
                SectionResult(
                    id=f"section-{len(sections) + 1}",
                    title=current_title,
                    paragraphs=current_paragraphs,
                )
            )
        current_title = None
        current_paragraphs = []

    for chunk in chunks.chunks:
        paragraph_id = chunk_id(chunk)
        title = title_by_chunk_id.get(paragraph_id, DEFAULT_SECTION_TITLE)
        if current_title is not None and title != current_title:
            flush_section()
        current_title = title
        current_paragraphs.append(ParagraphResult(id=paragraph_id, content=chunk.text))

    flush_section()
    return sections


def map_graph(
    graph: Neo4jGraph,
    chunks: TextChunks,
    detected_sections: list[DetectedSection] | None = None,
) -> ExtractionResultsResponse:
    sections, section_title_by_chunk_id = build_section_results(
        chunks, detected_sections
    )
    chunk_ids = set(section_title_by_chunk_id)

    entity_chunk_id_by_node_id = {
        relationship.start_node_id: relationship.end_node_id
        for relationship in graph.relationships
        if relationship.type in LEXICAL_CHUNK_RELATION_TYPES
        and relationship.end_node_id in chunk_ids
    }

    def chunk_id_for_node(node_id: str) -> str | None:
        lexical_chunk_id = entity_chunk_id_by_node_id.get(node_id)
        if lexical_chunk_id:
            return lexical_chunk_id
        paragraph_id = paragraph_id_from_node_id(node_id)
        return paragraph_id if paragraph_id in chunk_ids else None

    def section_title_for_chunk(paragraph_id: str | None) -> str:
        if paragraph_id:
            return section_title_by_chunk_id.get(paragraph_id, DEFAULT_SECTION_TITLE)
        return DEFAULT_SECTION_TITLE

    def llm_section_title_for_relationship(
        relationship: Neo4jRelationship,
    ) -> str | None:
        for key in LLM_SECTION_TITLE_PROPERTY_NAMES:
            value = relationship.properties.get(key)
            if not value:
                continue
            title = display_value(value)
            if title:
                return title
        return None

    has_detected_section_titles = bool(
        detected_sections
        and any(section.title != DEFAULT_SECTION_TITLE for section in detected_sections)
    )
    llm_section_title_by_chunk_id: dict[str, str] = {}

    entity_nodes = {
        node.id: node
        for node in graph.nodes
        if node.label not in {"Document", "Chunk"} and node.properties is not None
    }

    entities = [
        ExtractionEntityResult(
            temp_id=node.id,
            text=entity_text(node.id, node.label, node.properties),
            className=node.label,
            attributes=[
                ExtractionEntityAttribute(attribute_name=key, value=stringify(value))
                for key, value in node.properties.items()
                if key != SYNTHETIC_DISPLAY_PROPERTY_NAME
            ],
        )
        for node in entity_nodes.values()
    ]

    facts: list[ExtractionFactResult] = []
    for relationship in graph.relationships:
        subject = entity_nodes.get(relationship.start_node_id)
        object_ = entity_nodes.get(relationship.end_node_id)
        if subject is None or object_ is None:
            continue

        subject_text = entity_text(subject.id, subject.label, subject.properties)
        object_text = entity_text(object_.id, object_.label, object_.properties)
        quote = stringify(
            relationship.properties.get(
                "evidence",
                relationship.properties.get(
                    "quote", f"{subject_text} {relationship.type} {object_text}"
                ),
            )
        )
        paragraph_id = chunk_id_for_node(subject.id) or chunk_id_for_node(object_.id)
        llm_section_title = llm_section_title_for_relationship(relationship)
        if (
            paragraph_id
            and llm_section_title
            and not has_detected_section_titles
            and section_title_for_chunk(paragraph_id) == DEFAULT_SECTION_TITLE
        ):
            llm_section_title_by_chunk_id[paragraph_id] = llm_section_title
        confidence_value = relationship.properties.get("confidence", 0.75)
        try:
            confidence = float(confidence_value)
        except (TypeError, ValueError):
            confidence = 0.75

        facts.append(
            ExtractionFactResult(
                subject_temp_id=subject.id,
                relation_text=relationship.type,
                object_temp_id=object_.id,
                subjectClassName=subject.label,
                objectClassName=object_.label,
                relationName=relationship.type,
                confidence=max(0, min(1, confidence)),
                evidence=ExtractionEvidence(
                    quote=quote,
                    sectionTitle=llm_section_title
                    or section_title_for_chunk(paragraph_id),
                    paragraphId=paragraph_id,
                ),
            )
        )

    if llm_section_title_by_chunk_id and not has_detected_section_titles:
        sections = build_llm_section_results(chunks, llm_section_title_by_chunk_id)

    return ExtractionResultsResponse(sections=sections, entities=entities, facts=facts)
