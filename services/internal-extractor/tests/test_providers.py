import pytest

from internal_extractor.providers import create_llm


def test_openai_requires_api_key():
    with pytest.raises(ValueError, match="OpenAI"):
        create_llm("openai", "gpt-5", None)


def test_anthropic_requires_api_key():
    with pytest.raises(ValueError, match="Anthropic"):
        create_llm("anthropic", "claude-3-5-sonnet-latest", None)


def test_openai_uses_requested_model(monkeypatch):
    captured = {}

    class FakeOpenAILLM:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    monkeypatch.setattr("internal_extractor.providers.OpenAILLM", FakeOpenAILLM)

    create_llm("openai", "gpt-custom", "test-key")

    assert captured["model_name"] == "gpt-custom"


def test_anthropic_uses_requested_model(monkeypatch):
    captured = {}

    class FakeAnthropicLLM:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    monkeypatch.setattr(
        "internal_extractor.providers.AnthropicLLM", FakeAnthropicLLM
    )

    create_llm("anthropic", "claude-custom", "test-key")

    assert captured["model_name"] == "claude-custom"


def test_ollama_uses_requested_model(monkeypatch):
    captured = {}

    class FakeOllamaLLM:
        def __init__(self, **kwargs):
            captured.update(kwargs)

    monkeypatch.setattr("internal_extractor.providers.OllamaLLM", FakeOllamaLLM)

    create_llm("ollama", "local-custom", None)

    assert captured["model_name"] == "local-custom"
