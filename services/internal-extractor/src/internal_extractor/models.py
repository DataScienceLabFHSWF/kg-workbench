from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Provider = Literal["openai", "anthropic", "ollama"]
JobStatus = Literal["pending", "running", "completed", "failed"]


class ExtractionFile(BaseModel):
    name: str
    contentType: str
    base64: str


class SchemaAttribute(BaseModel):
    name: str
    type: str
    description: str | None = None
    required: bool = False


class SchemaNode(BaseModel):
    label: str
    description: str | None = None
    properties: list[SchemaAttribute] = Field(default_factory=list)


class SchemaRelationship(BaseModel):
    label: str
    description: str | None = None


class ExtractionSchema(BaseModel):
    nodeTypes: list[SchemaNode]
    relationshipTypes: list[SchemaRelationship]
    patterns: list[tuple[str, str, str]]


class ExtractionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    documentId: str
    ontologyId: str
    modelName: str
    provider: Provider
    apiKey: str | None = None
    file: ExtractionFile
    extraction_schema: ExtractionSchema = Field(alias="schema")


class ExtractionResponse(BaseModel):
    runId: str


class ExtractionStatusResponse(BaseModel):
    runId: str
    status: JobStatus
    progress: int | None = None
    error: str | None = None


class ParagraphResult(BaseModel):
    id: str
    content: str


class SectionResult(BaseModel):
    id: str
    title: str
    paragraphs: list[ParagraphResult]


class ExtractionEntityAttribute(BaseModel):
    attribute_name: str
    value: str


class ExtractionEntityResult(BaseModel):
    temp_id: str
    text: str
    className: str
    attributes: list[ExtractionEntityAttribute]


class ExtractionEvidence(BaseModel):
    quote: str
    sectionTitle: str
    paragraphId: str | None
    pageFrom: int | None = None
    pageTo: int | None = None


class ExtractionFactResult(BaseModel):
    subject_temp_id: str
    relation_text: str
    object_temp_id: str
    subjectClassName: str
    objectClassName: str
    relationName: str
    confidence: float
    isCrossChapter: bool = False
    evidence: ExtractionEvidence | None = None


class ExtractionResultsResponse(BaseModel):
    sections: list[SectionResult]
    entities: list[ExtractionEntityResult]
    facts: list[ExtractionFactResult]
