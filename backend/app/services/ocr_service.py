"""
OCR Service for extracting text from medical documents.

Supports PDF and image formats (PNG, JPG, JPEG).
"""

import io
from typing import Optional, Tuple
from PIL import Image
import pytesseract
from pdf2image import convert_from_path
import PyPDF2

from app.core.config import get_settings


class OCRService:
    """Service for extracting text from medical documents."""

    def __init__(self):
        self.settings = get_settings()
        pytesseract.pytesseract.tesseract_cmd = self.settings.tesseract_cmd

    async def extract_text(self, file_content: bytes, filename: str) -> Tuple[str, dict]:
        """
        Extract text from a file (PDF or image).

        Args:
            file_content: Raw file bytes
            filename: Original filename (used to determine file type)

        Returns:
            Tuple of (extracted_text, metadata)
        """
        file_ext = filename.lower().split('.')[-1]

        if file_ext == 'pdf':
            return await self._extract_from_pdf(file_content)
        elif file_ext in ['png', 'jpg', 'jpeg', 'bmp', 'tiff']:
            return await self._extract_from_image(file_content)
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")

    async def _extract_from_pdf(self, file_content: bytes) -> Tuple[str, dict]:
        """Extract text from PDF file."""
        text_parts = []
        page_count = 0

        # Try direct text extraction first
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
            page_count = len(pdf_reader.pages)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    text_parts.append(page_text)
        except Exception:
            pass

        # If no text extracted or text is too short, use OCR
        extracted_text = "\n\n".join(text_parts)
        if len(extracted_text.strip()) < 50:
            # Convert PDF to images and OCR
            images = convert_from_bytes(file_content)
            page_count = len(images)
            text_parts = []
            for img in images:
                text = pytesseract.image_to_string(img)
                text_parts.append(text)
            extracted_text = "\n\n".join(text_parts)

        metadata = {
            "page_count": page_count,
            "method": "ocr" if len(extracted_text) > 50 else "direct",
            "character_count": len(extracted_text)
        }

        return extracted_text.strip(), metadata

    async def _extract_from_image(self, file_content: bytes) -> Tuple[str, dict]:
        """Extract text from image file."""
        image = Image.open(io.BytesIO(file_content))

        # Preprocess image for better OCR
        image = self._preprocess_image(image)

        # Extract text
        extracted_text = pytesseract.image_to_string(image)

        metadata = {
            "image_size": image.size,
            "method": "ocr",
            "character_count": len(extracted_text)
        }

        return extracted_text.strip(), metadata

    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image for better OCR results.

        Converts to grayscale and applies basic enhancements.
        """
        # Convert to grayscale
        if image.mode != 'L':
            image = image.convert('L')

        # Increase contrast (basic enhancement)
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.5)

        return image