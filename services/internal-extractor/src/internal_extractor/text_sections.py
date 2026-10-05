import re
from dataclasses import dataclass, field

from neo4j_graphrag.experimental.components.types import (
    TextChunk,
    TextChunks,
)

from .config import settings

DEFAULT_SECTION_TITLE = "Extracted document"


@dataclass
class DetectedSection:
    id: str
    title: str
    blocks: list[str] = field(default_factory=list)
    chunk_ids: list[str] = field(default_factory=list)


@dataclass
class SectionedText:
    chunks: TextChunks
    sections: list[DetectedSection]


def next_non_empty_line(lines: list[str], start: int) -> str | None:
    for line in lines[start:]:
        stripped = line.strip()
        if stripped:
            return stripped
    return None


def is_title_case_heading(line: str) -> bool:
    words = re.findall(r"[A-Za-z][A-Za-z0-9/-]*", line)
    if not words or len(words) > 8:
        return False
    title_like_words = sum(1 for word in words if word[0].isupper())
    return title_like_words / len(words) >= 0.6


def is_heading_line(line: str, next_line: str | None) -> bool:
    stripped = line.strip()
    if len(stripped) < 3 or len(stripped) > 120:
        return False
    if next_line is None:
        return False
    if stripped.endswith((".", ",", ";")):
        return False
    if re.match(r"^\d+(?:\.\d+)*\.?\s+\S", stripped):
        return True
    if stripped.endswith(":") and len(stripped.split()) <= 12:
        return True
    letters = [char for char in stripped if char.isalpha()]
    if len(letters) >= 3:
        uppercase_ratio = sum(1 for char in letters if char.isupper()) / len(letters)
        if uppercase_ratio >= 0.75 and len(stripped.split()) <= 12:
            return True
    return is_title_case_heading(stripped)


def detect_sections(text: str) -> list[DetectedSection]:
    lines = text.splitlines()
    sections: list[DetectedSection] = []
    current = DetectedSection(id="section-1", title=DEFAULT_SECTION_TITLE)
    current_block: list[str] = []

    def flush_block() -> None:
        nonlocal current_block
        if current_block:
            current.blocks.append(" ".join(current_block).strip())
            current_block = []

    def flush_section() -> None:
        nonlocal current
        flush_block()
        if current.blocks:
            sections.append(current)
        current = DetectedSection(
            id=f"section-{len(sections) + 2}",
            title=DEFAULT_SECTION_TITLE,
        )

    for index, raw_line in enumerate(lines):
        line = raw_line.strip()
        if not line:
            flush_block()
            continue

        if is_heading_line(line, next_non_empty_line(lines, index + 1)):
            flush_section()
            current.title = line.rstrip(":").strip()
            continue

        current_block.append(line)

    flush_section()
    return sections


def chunk_section(section: DetectedSection, start_index: int) -> list[TextChunk]:
    chunks: list[TextChunk] = []
    section_chunk_index = 0

    for block in section.blocks:
        normalized = block.strip()
        if not normalized:
            continue
        start = 0
        while start < len(normalized):
            end = min(start + settings.chunk_size, len(normalized))
            chunk_text = normalized[start:end].strip()
            if chunk_text:
                chunk_id = f"{section.id}-chunk-{section_chunk_index + 1}"
                chunks.append(
                    TextChunk(
                        text=chunk_text,
                        index=start_index + len(chunks),
                        uid=chunk_id,
                    )
                )
                section.chunk_ids.append(chunk_id)
                section_chunk_index += 1
            if end >= len(normalized):
                break
            start = max(end - settings.chunk_overlap, start + 1)

    return chunks


def split_document_text(text: str) -> SectionedText:
    sections = detect_sections(text)
    chunks: list[TextChunk] = []
    for section in sections:
        chunks.extend(chunk_section(section, len(chunks)))
    return SectionedText(chunks=TextChunks(chunks=chunks), sections=sections)


def split_text(text: str) -> TextChunks:
    return split_document_text(text).chunks
