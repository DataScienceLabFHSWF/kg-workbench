from neo4j_graphrag.experimental.components.types import (
    Neo4jGraph,
    Neo4jNode,
    Neo4jRelationship,
    TextChunk,
    TextChunks,
)

from internal_extractor.kg_builder import map_graph, split_document_text


def test_map_graph_returns_app_contract():
    chunk = TextChunk(text="Pump P-101 feeds Tank T-1.", index=0, uid="chunk-1")
    graph = Neo4jGraph(
        nodes=[
            Neo4jNode(
                id="chunk-1:pump",
                label="Pump",
                properties={"name": "P-101", "serial": "A"},
            ),
            Neo4jNode(
                id="chunk-1:tank",
                label="Tank",
                properties={"name": "T-1"},
            ),
        ],
        relationships=[
            Neo4jRelationship(
                start_node_id="chunk-1:pump",
                end_node_id="chunk-1:tank",
                type="feeds",
                properties={"confidence": 0.9},
            )
        ],
    )

    result = map_graph(graph, TextChunks(chunks=[chunk]))

    assert result.sections[0].paragraphs[0].id == "chunk-1"
    assert result.entities[0].className == "Pump"
    assert [attr.attribute_name for attr in result.entities[0].attributes] == [
        "name",
        "serial",
    ]
    assert result.facts[0].relationName == "feeds"
    assert result.facts[0].evidence is not None
    assert result.facts[0].evidence.paragraphId == "chunk-1"


def test_map_graph_uses_entity_text_as_display_name():
    chunk = TextChunk(text="Alice works in Engineering.", index=0, uid="chunk-1")
    graph = Neo4jGraph(
        nodes=[
            Neo4jNode(
                id="chunk-1:0",
                label="Employee",
                properties={
                    "entity_text": "Alice Morgan",
                    "employee_id": "0",
                    "department": "Engineering",
                },
            )
        ],
        relationships=[],
    )

    result = map_graph(graph, TextChunks(chunks=[chunk]))

    assert result.entities[0].text == "Alice Morgan"
    assert [attr.attribute_name for attr in result.entities[0].attributes] == [
        "employee_id",
        "department",
    ]


def test_map_graph_preserves_display_named_ontology_attributes():
    chunk = TextChunk(
        text="Northwind Research GmbH was founded in 2020.",
        index=0,
        uid="chunk-1",
    )
    graph = Neo4jGraph(
        nodes=[
            Neo4jNode(
                id="chunk-1:organization",
                label="Organization",
                properties={
                    "entity_text": "Northwind Research GmbH",
                    "name": "Northwind Research GmbH",
                    "title": "Research organization",
                    "label": "Northwind",
                    "employeeId": "NW-001",
                },
            )
        ],
        relationships=[],
    )

    result = map_graph(graph, TextChunks(chunks=[chunk]))

    assert result.entities[0].text == "Northwind Research GmbH"
    assert result.entities[0].className == "Organization"
    assert [attr.attribute_name for attr in result.entities[0].attributes] == [
        "name",
        "title",
        "label",
        "employeeId",
    ]


def test_map_graph_uses_name_like_property_before_numeric_node_id():
    chunk = TextChunk(text="Alice works in Engineering.", index=0, uid="chunk-1")
    graph = Neo4jGraph(
        nodes=[
            Neo4jNode(
                id="chunk-1:0",
                label="Employee",
                properties={"employee_name": "Alice Morgan", "employee_id": "0"},
            )
        ],
        relationships=[],
    )

    result = map_graph(graph, TextChunks(chunks=[chunk]))

    assert result.entities[0].text == "Alice Morgan"


def test_map_graph_does_not_use_bare_numeric_node_id_as_display_name():
    chunk = TextChunk(text="Employee 0 works in Engineering.", index=0, uid="chunk-1")
    graph = Neo4jGraph(
        nodes=[
            Neo4jNode(
                id="chunk-1:0",
                label="Employee",
                properties={"employee_id": "0"},
            )
        ],
        relationships=[],
    )

    result = map_graph(graph, TextChunks(chunks=[chunk]))

    assert result.entities[0].text == "Employee 0"


def test_split_document_text_detects_sections_from_headings():
    sectioned_text = split_document_text(
        "1 Employees\n"
        "Alice works in Engineering.\n\n"
        "2 Assets\n"
        "Pump P-101 feeds Tank T-1."
    )

    result = map_graph(
        Neo4jGraph(nodes=[], relationships=[]),
        sectioned_text.chunks,
        sectioned_text.sections,
    )

    assert [section.title for section in result.sections] == [
        "1 Employees",
        "2 Assets",
    ]
    assert result.sections[0].paragraphs[0].content == "Alice works in Engineering."
    assert result.sections[1].paragraphs[0].content == "Pump P-101 feeds Tank T-1."


def test_map_graph_uses_lexical_chunk_relation_for_evidence_section():
    sectioned_text = split_document_text(
        "1 Employees\n"
        "Alice works in Engineering.\n\n"
        "2 Assets\n"
        "Pump P-101 feeds Tank T-1."
    )
    employee_chunk_id = sectioned_text.sections[0].chunk_ids[0]
    asset_chunk_id = sectioned_text.sections[1].chunk_ids[0]
    employee_node_id = f"{employee_chunk_id}:0"
    department_node_id = f"{employee_chunk_id}:1"

    graph = Neo4jGraph(
        nodes=[
            Neo4jNode(
                id=employee_node_id,
                label="Employee",
                properties={"entity_text": "Alice"},
            ),
            Neo4jNode(
                id=department_node_id,
                label="Department",
                properties={"entity_text": "Engineering"},
            ),
            Neo4jNode(
                id=employee_chunk_id,
                label="Chunk",
                properties={"text": "Alice works in Engineering."},
            ),
            Neo4jNode(
                id=asset_chunk_id,
                label="Chunk",
                properties={"text": "Pump P-101 feeds Tank T-1."},
            ),
        ],
        relationships=[
            Neo4jRelationship(
                start_node_id=employee_node_id,
                end_node_id=employee_chunk_id,
                type="FROM_CHUNK",
                properties={},
            ),
            Neo4jRelationship(
                start_node_id=department_node_id,
                end_node_id=employee_chunk_id,
                type="FROM_CHUNK",
                properties={},
            ),
            Neo4jRelationship(
                start_node_id=employee_node_id,
                end_node_id=department_node_id,
                type="worksIn",
                properties={"confidence": 0.9},
            ),
        ],
    )

    result = map_graph(graph, sectioned_text.chunks, sectioned_text.sections)

    assert [section.title for section in result.sections] == [
        "1 Employees",
        "2 Assets",
    ]
    assert result.facts[0].evidence is not None
    assert result.facts[0].evidence.paragraphId == employee_chunk_id
    assert result.facts[0].evidence.sectionTitle == "1 Employees"


def test_map_graph_uses_llm_section_title_when_headings_are_missing():
    sectioned_text = split_document_text(
        "Alice works in Engineering.\n\n"
        "Pump P-101 feeds Tank T-1."
    )
    first_chunk_id = sectioned_text.sections[0].chunk_ids[0]
    employee_node_id = f"{first_chunk_id}:0"
    department_node_id = f"{first_chunk_id}:1"

    graph = Neo4jGraph(
        nodes=[
            Neo4jNode(
                id=employee_node_id,
                label="Employee",
                properties={"entity_text": "Alice"},
            ),
            Neo4jNode(
                id=department_node_id,
                label="Department",
                properties={"entity_text": "Engineering"},
            ),
        ],
        relationships=[
            Neo4jRelationship(
                start_node_id=employee_node_id,
                end_node_id=first_chunk_id,
                type="FROM_CHUNK",
                properties={},
            ),
            Neo4jRelationship(
                start_node_id=employee_node_id,
                end_node_id=department_node_id,
                type="worksIn",
                properties={
                    "confidence": 0.9,
                    "section_title": "Employees",
                },
            ),
        ],
    )

    result = map_graph(graph, sectioned_text.chunks, sectioned_text.sections)

    assert result.sections[0].title == "Employees"
    assert result.facts[0].evidence is not None
    assert result.facts[0].evidence.sectionTitle == "Employees"
