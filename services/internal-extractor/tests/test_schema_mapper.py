import base64

from internal_extractor.models import ExtractionFile, ExtractionRequest, ExtractionSchema
from internal_extractor.schema_mapper import to_graph_schema


def test_to_graph_schema_allows_missing_descriptions():
    request = ExtractionRequest(
        documentId="run-1",
        ontologyId="ontology-1",
        modelName="llama3.1",
        provider="ollama",
        file=ExtractionFile(
            name="doc.txt",
            contentType="text/plain",
            base64=base64.b64encode(b"Alpha relates to Beta.").decode("ascii"),
        ),
        schema=ExtractionSchema(
            nodeTypes=[
                {
                    "label": "Thing",
                    "description": None,
                    "properties": [
                        {
                            "name": "name",
                            "type": "STRING",
                            "description": None,
                        }
                    ],
                }
            ],
            relationshipTypes=[{"label": "relatesTo", "description": None}],
            patterns=[("Thing", "relatesTo", "Thing")],
        ),
    )

    graph_schema = to_graph_schema(request)
    dumped = graph_schema.model_dump()

    assert dumped["node_types"][0]["description"] == "Ontology class Thing."
    assert dumped["node_types"][0]["properties"][1]["description"] == (
        "Ontology attribute name."
    )
    assert dumped["relationship_types"][0]["description"] == (
        "Ontology relation relatesTo."
    )
