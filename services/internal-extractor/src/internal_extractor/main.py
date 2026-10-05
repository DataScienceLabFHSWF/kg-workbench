from fastapi import BackgroundTasks, FastAPI, HTTPException

from .jobs import create_job, jobs, run_job
from .models import (
    ExtractionRequest,
    ExtractionResponse,
    ExtractionResultsResponse,
    ExtractionStatusResponse,
)

app = FastAPI(title="KG Workbench Internal Extractor")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/extract", response_model=ExtractionResponse)
async def extract(
    request: ExtractionRequest,
    background_tasks: BackgroundTasks,
) -> ExtractionResponse:
    if not request.modelName.strip():
        raise HTTPException(status_code=400, detail="A model name is required.")

    if request.provider != "ollama" and not request.apiKey:
        raise HTTPException(
            status_code=400,
            detail=f"{request.provider} fallback extraction requires an API key.",
        )

    job = create_job(request)
    background_tasks.add_task(run_job, job.run_id, request)
    return ExtractionResponse(runId=job.run_id)


@app.get("/api/extract/{run_id}/status", response_model=ExtractionStatusResponse)
async def status(run_id: str) -> ExtractionStatusResponse:
    job = jobs.get(run_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Unknown extraction run.")
    return ExtractionStatusResponse(
        runId=job.run_id,
        status=job.status,
        progress=job.progress,
        error=job.error,
    )


@app.get("/api/extract/{run_id}/results", response_model=ExtractionResultsResponse)
async def results(run_id: str) -> ExtractionResultsResponse:
    job = jobs.get(run_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Unknown extraction run.")
    if job.status == "failed":
        raise HTTPException(status_code=500, detail=job.error or "Extraction failed.")
    if job.status != "completed" or job.results is None:
        raise HTTPException(status_code=409, detail="Extraction is not complete.")
    return job.results
