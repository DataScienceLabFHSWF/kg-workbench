import base64

import pytest

from internal_extractor.jobs import create_job, jobs, run_job
from internal_extractor.models import ExtractionFile, ExtractionRequest, ExtractionSchema


def make_request(provider="ollama"):
    return ExtractionRequest(
        documentId="run-1",
        ontologyId="ontology-1",
        modelName="llama3.1",
        provider=provider,
        apiKey=None if provider == "ollama" else "test-key",
        file=ExtractionFile(
            name="doc.txt",
            contentType="text/plain",
            base64=base64.b64encode(b"Alpha relates to Beta.").decode("ascii"),
        ),
        schema=ExtractionSchema(
            nodeTypes=[
                {"label": "Thing", "properties": [{"name": "name", "type": "STRING"}]}
            ],
            relationshipTypes=[{"label": "relatesTo"}],
            patterns=[("Thing", "relatesTo", "Thing")],
        ),
    )


def test_create_job_defaults_to_pending():
    jobs.clear()
    job = create_job(make_request())

    assert job.run_id == "run-1"
    assert job.status == "pending"
    assert job.progress == 0


@pytest.mark.asyncio
async def test_run_job_marks_failed_when_extractor_fails(monkeypatch):
    jobs.clear()
    request = make_request()
    job = create_job(request)

    async def fail(_request):
        raise RuntimeError("boom")

    monkeypatch.setattr("internal_extractor.jobs.run_extraction", fail)
    await run_job(job.run_id, request)

    assert job.status == "failed"
    assert job.error == "boom"
    assert job.progress == 100
