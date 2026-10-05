from typing import Any

from neo4j_graphrag.experimental.components.schema import GraphSchema

from .models import ExtractionRequest, SchemaAttribute


def description_or_fallback(value: str | None, fallback: str) -> str:
    return value or fallback


def to_graph_schema(request: ExtractionRequest) -> GraphSchema:
    node_types = []
    for node in request.extraction_schema.nodeTypes:
        properties = list(node.properties)
        if not any(prop.name == "entity_text" for prop in properties):
            properties.insert(
                0,
                SchemaAttribute(
                    name="entity_text",
                    type="STRING",
                    description=(
                        "Short human-readable name for this entity, such as "
                        "the employee name, company name, product name, or "
                        "other natural display label from the document."
                    ),
                ),
            )

        node_type: dict[str, Any] = {
            "label": node.label,
            "description": description_or_fallback(
                node.description, f"Ontology class {node.label}."
            ),
        }
        if properties:
            node_type["properties"] = [
                {
                    "name": prop.name,
                    "type": prop.type,
                    "description": description_or_fallback(
                        prop.description, f"Ontology attribute {prop.name}."
                    ),
                }
                for prop in properties
            ]
        node_types.append(node_type)

    return GraphSchema.model_validate(
        {
            "node_types": node_types,
            "relationship_types": [
                {
                    "label": rel.label,
                    "description": description_or_fallback(
                        rel.description, f"Ontology relation {rel.label}."
                    ),
                    "properties": [
                        {
                            "name": "evidence",
                            "type": "STRING",
                            "description": "Short source quote supporting the relation.",
                        },
                        {
                            "name": "section_title",
                            "type": "STRING",
                            "description": (
                                "Exact source heading when visible. If no heading is "
                                "visible, use a short human-readable topic label "
                                "for the local passage."
                            ),
                        },
                    ],
                }
                for rel in request.extraction_schema.relationshipTypes
            ],
            "patterns": request.extraction_schema.patterns,
            "additional_node_types": False,
        }
    )
