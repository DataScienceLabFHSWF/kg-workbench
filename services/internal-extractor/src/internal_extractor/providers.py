from neo4j_graphrag.llm import AnthropicLLM, OllamaLLM, OpenAILLM

from .config import settings
from .models import Provider


def create_llm(provider: Provider, model_name: str, api_key: str | None):
    if provider == "openai":
        if not api_key:
            raise ValueError("OpenAI fallback extraction requires an API key.")
        return OpenAILLM(
            model_name=model_name,
            api_key=api_key,
        )

    if provider == "anthropic":
        if not api_key:
            raise ValueError("Anthropic fallback extraction requires an API key.")
        return AnthropicLLM(
            model_name=model_name,
            model_params={"temperature": 0, "max_tokens": settings.max_tokens},
            api_key=api_key,
        )

    return OllamaLLM(
        model_name=model_name,
        model_params={"options": {"temperature": 0}},
        host=settings.ollama_base_url,
    )
