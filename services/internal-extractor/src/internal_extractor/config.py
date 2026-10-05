import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    ollama_base_url: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    max_tokens: int = int(os.getenv("KG_EXTRACTOR_MAX_TOKENS", "2000"))
    chunk_size: int = int(os.getenv("KG_EXTRACTOR_CHUNK_SIZE", "4000"))
    chunk_overlap: int = int(os.getenv("KG_EXTRACTOR_CHUNK_OVERLAP", "400"))


settings = Settings()
