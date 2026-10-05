FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV UV_LINK_MODE=copy

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:0.12.7 /uv /uvx /bin/
COPY pyproject.toml uv.lock README.md LICENSE.txt ./
COPY src ./src

RUN uv sync --locked --no-dev

EXPOSE 8000

CMD ["uv", "run", "--frozen", "--no-dev", "uvicorn", "internal_extractor.main:app", "--host", "0.0.0.0", "--port", "8000"]
