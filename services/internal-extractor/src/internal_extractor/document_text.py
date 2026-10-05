import base64
import io

from pypdf import PdfReader

from .models import ExtractionFile


def extract_text(file: ExtractionFile) -> str:
    content = base64.b64decode(file.base64)
    lower_name = file.name.lower()
    content_type = file.contentType.lower()

    if content_type.startswith("text/") or lower_name.endswith(".txt"):
        return content.decode("utf-8", errors="replace")

    if content_type == "application/pdf" or lower_name.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(content))
        return "\n\n".join(page.extract_text() or "" for page in reader.pages)

    raise ValueError(f"Unsupported file type: {file.contentType or file.name}")
