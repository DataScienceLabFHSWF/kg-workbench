from dataclasses import dataclass
import logging

from .kg_builder import run_extraction
from .models import ExtractionRequest, ExtractionResultsResponse, JobStatus


@dataclass
class ExtractionJob:
    run_id: str
    status: JobStatus = "pending"
    progress: int | None = 0
    results: ExtractionResultsResponse | None = None
    error: str | None = None


jobs: dict[str, ExtractionJob] = {}
logger = logging.getLogger(__name__)


def create_job(request: ExtractionRequest) -> ExtractionJob:
    job = ExtractionJob(run_id=request.documentId)
    jobs[job.run_id] = job
    return job


async def run_job(run_id: str, request: ExtractionRequest) -> None:
    job = jobs[run_id]
    job.status = "running"
    job.progress = 10
    try:
        job.results = await run_extraction(request)
        job.status = "completed"
        job.progress = 100
    except Exception as exc:
        logger.exception("Extraction job %s failed", run_id)
        job.status = "failed"
        job.error = str(exc)
        job.progress = 100
