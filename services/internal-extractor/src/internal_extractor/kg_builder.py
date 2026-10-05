from neo4j_graphrag.experimental.components.entity_relation_extractor import (
    LLMEntityRelationExtractor,
    OnError,
)

from .document_text import extract_text
from .graph_mapper import map_graph
from .models import ExtractionRequest, ExtractionResultsResponse
from .providers import create_llm
from .schema_mapper import to_graph_schema
from .text_sections import split_document_text, split_text

__all__ = [
    "map_graph",
    "run_extraction",
    "split_document_text",
    "split_text",
    "to_graph_schema",
]


async def run_extraction(request: ExtractionRequest) -> ExtractionResultsResponse:
    text = extract_text(request.file)
    sectioned_text = split_document_text(text)
    if not sectioned_text.chunks.chunks:
        return ExtractionResultsResponse(sections=[], entities=[], facts=[])

    llm = create_llm(request.provider, request.modelName, request.apiKey)
    try:
        extractor = LLMEntityRelationExtractor(
            llm=llm,
            create_lexical_graph=True,
            on_error=OnError.IGNORE,
            use_structured_output=request.provider == "openai",
        )
        graph = await extractor.run(
            chunks=sectioned_text.chunks,
            schema=to_graph_schema(request),
        )
        return map_graph(graph, sectioned_text.chunks, sectioned_text.sections)
    finally:
        close = getattr(llm, "aclose", None)
        if close is not None:
            await close()
