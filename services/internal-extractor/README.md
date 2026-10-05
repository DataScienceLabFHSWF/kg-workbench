# Internal Extractor

Python FastAPI fallback extractor for KG Workbench.

## Purpose

- Mirrors the external extraction API shape used by the Next app.
- Runs Neo4j GraphRAG KG Builder components against uploaded document text.
- Returns the app's existing extraction result JSON so Next persists review data in Supabase.

## Local Development

```bash
uv sync --locked
uv run --locked uvicorn internal_extractor.main:app --reload --port 8010
```

Run these commands from `services/internal-extractor`. The app's local environment
uses `http://localhost:8010`; Docker still uses port `8000` inside the container.

Run tests with `uv run --locked pytest`. Upgrade the dependency lockfile with
`uv lock --upgrade`, then run `uv sync --locked` and the tests. Commit `uv.lock`
alongside dependency changes. Docker uses the same locked dependencies.

For Ollama, set `OLLAMA_BASE_URL` if it is not running on `http://localhost:11434`.
The concrete LLM model is sent by the workbench when the extraction is started.

## Environment

- `OLLAMA_BASE_URL`, default `http://localhost:11434`
- `KG_EXTRACTOR_MAX_TOKENS`, default `2000`
- `KG_EXTRACTOR_CHUNK_SIZE`, default `4000`
- `KG_EXTRACTOR_CHUNK_OVERLAP`, default `400`
