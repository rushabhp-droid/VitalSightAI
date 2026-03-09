"""
FastAPI Routes for VitalSightAI

Handles blood report and prescription analysis endpoints.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
from typing import Optional
import logging
import json

from app.services.ocr_service import OCRService
from app.services.model_service import ModelService

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
ocr_service = OCRService()
model_service = ModelService()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "model_info": model_service.get_model_info()
    }


@router.post("/analyze/blood-report")
async def analyze_blood_report(
    file: UploadFile = File(...),
    patient_age: Optional[int] = Form(None),
    patient_gender: Optional[str] = Form(None),
    patient_conditions: Optional[str] = Form(None)
):
    """
    Analyze a blood test report (PDF or image).

    Returns detailed health insights including:
    - Parameter analysis
    - Abnormal findings
    - Health recommendations
    - Follow-up suggestions
    """
    try:
        # Read file content
        content = await file.read()

        # Extract text using OCR
        extracted_text, metadata = await ocr_service.extract_text(content, file.filename)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the uploaded file. Please ensure the file is readable."
            )

        # Prepare patient info
        patient_info = {}
        if patient_age:
            patient_info["age"] = patient_age
        if patient_gender:
            patient_info["gender"] = patient_gender
        if patient_conditions:
            patient_info["conditions"] = patient_conditions

        # Analyze with model
        analysis = model_service.analyze_blood_report(
            extracted_text,
            patient_info if patient_info else None
        )

        return JSONResponse(content={
            "success": True,
            "metadata": metadata,
            "analysis": analysis
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing blood report: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze/prescription")
async def analyze_prescription(
    file: UploadFile = File(...),
    patient_age: Optional[int] = Form(None),
    patient_gender: Optional[str] = Form(None),
    patient_conditions: Optional[str] = Form(None),
    current_medications: Optional[str] = Form(None),
    allergies: Optional[str] = Form(None)
):
    """
    Analyze a medical prescription (PDF or image).

    Returns detailed medicine analysis including:
    - Medicine details and purposes
    - Pros and cons of each medicine
    - Side effects and interactions
    - Recommendations and precautions
    """
    try:
        # Read file content
        content = await file.read()

        # Extract text using OCR
        extracted_text, metadata = await ocr_service.extract_text(content, file.filename)

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from the uploaded file. Please ensure the file is readable."
            )

        # Prepare patient info
        patient_info = {}
        if patient_age:
            patient_info["age"] = patient_age
        if patient_gender:
            patient_info["gender"] = patient_gender
        if patient_conditions:
            patient_info["conditions"] = patient_conditions
        if current_medications:
            patient_info["current_medications"] = current_medications
        if allergies:
            patient_info["allergies"] = allergies

        # Analyze with model
        analysis = model_service.analyze_prescription(
            extracted_text,
            patient_info if patient_info else None
        )

        return JSONResponse(content={
            "success": True,
            "metadata": metadata,
            "analysis": analysis
        })

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing prescription: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/analyze/medicine")
async def analyze_single_medicine(
    medicine_name: str = Form(...),
    dosage: Optional[str] = Form(None),
    patient_age: Optional[int] = Form(None),
    patient_gender: Optional[str] = Form(None),
    patient_conditions: Optional[str] = Form(None),
    current_medications: Optional[str] = Form(None),
    allergies: Optional[str] = Form(None)
):
    """
    Analyze a single medicine by name.

    Returns comprehensive medicine information:
    - Generic name and drug class
    - How it works
    - Pros and cons
    - Side effects
    - Interactions
    - Patient guidance
    """
    try:
        # Prepare patient info
        patient_info = {}
        if patient_age:
            patient_info["age"] = patient_age
        if patient_gender:
            patient_info["gender"] = patient_gender
        if patient_conditions:
            patient_info["conditions"] = patient_conditions
        if current_medications:
            patient_info["current_medications"] = current_medications
        if allergies:
            patient_info["allergies"] = allergies

        # Analyze with model
        analysis = model_service.analyze_medicine(
            medicine_name,
            dosage,
            patient_info if patient_info else None
        )

        return JSONResponse(content={
            "success": True,
            "analysis": analysis
        })

    except Exception as e:
        logger.error(f"Error analyzing medicine: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/ocr/extract")
async def extract_text_only(file: UploadFile = File(...)):
    """
    Extract text from a document without analysis.

    Useful for debugging or when you just want the raw text.
    """
    try:
        content = await file.read()
        extracted_text, metadata = await ocr_service.extract_text(content, file.filename)

        return JSONResponse(content={
            "success": True,
            "text": extracted_text,
            "metadata": metadata
        })

    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")