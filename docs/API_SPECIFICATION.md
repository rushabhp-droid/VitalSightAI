# VitalSightAI API Specification

Version: 1.0.0

## Overview

VitalSightAI provides a RESTful API for analyzing blood reports, prescriptions, and medicines.

### Base URL

```
http://localhost:8000/api/v1
```

### Authentication

Currently, the API does not require authentication for local development. For production deployments, implement appropriate authentication (API keys, JWT, OAuth).

### Content Types

- Request: `multipart/form-data` for file uploads, `application/json` for other endpoints
- Response: `application/json`

---

## Endpoints

### Health Check

Check API health and model status.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "model_info": {
    "model_path": "./models/vitalsight-medical-v1",
    "device": "cuda",
    "model_loaded": true,
    "tokenizer_loaded": true
  }
}
```

**Status Codes**:
- `200`: Success
- `503`: Service unavailable (model not loaded)

---

### Analyze Blood Report

Analyze a blood test report (PDF or image).

**Endpoint**: `POST /analyze/blood-report`

**Request**:

Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Blood report file (PDF, PNG, JPG, JPEG) |
| patient_age | integer | No | Patient age in years |
| patient_gender | string | No | Patient gender (`male`, `female`, `other`) |
| patient_conditions | string | No | Known medical conditions (comma-separated) |

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/analyze/blood-report" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@blood_report.pdf" \
  -F "patient_age=45" \
  -F "patient_gender=male" \
  -F "patient_conditions=diabetes,hypertension"
```

**Response**:
```json
{
  "success": true,
  "metadata": {
    "page_count": 1,
    "method": "ocr",
    "character_count": 1234
  },
  "analysis": {
    "summary": {
      "report_date": "2024-01-15",
      "lab_name": "City Diagnostic Lab",
      "overall_health_status": "Good",
      "summary_text": "All blood parameters are within normal range..."
    },
    "parameters": [
      {
        "name": "Hemoglobin",
        "value": "14.5",
        "unit": "g/dL",
        "reference_range": "13.0-17.5",
        "status": "Normal",
        "explanation": "Hemoglobin carries oxygen throughout the body...",
        "health_implications": "Normal hemoglobin suggests no anemia..."
      }
    ],
    "abnormal_findings": [
      {
        "parameter": "Total Cholesterol",
        "status": "High",
        "value": "220 mg/dL",
        "possible_causes": ["Poor diet", "Genetic predisposition", "Sedentary lifestyle"],
        "recommendations": ["Reduce saturated fat intake", "Increase fiber", "Regular exercise"],
        "related_conditions": ["Atherosclerosis", "Heart disease"]
      }
    ],
    "health_insights": {
      "strengths": ["Good kidney function", "Normal blood sugar"],
      "areas_of_concern": ["Elevated cholesterol"],
      "lifestyle_recommendations": [
        {
          "category": "Diet",
          "recommendation": "Follow Mediterranean diet",
          "reasoning": "Supports cardiovascular health"
        }
      ],
      "dietary_suggestions": {
        "foods_to_include": ["Leafy greens", "Fatty fish", "Nuts"],
        "foods_to_limit": ["Processed foods", "Saturated fats"],
        "supplements_to_consider": ["Omega-3", "Vitamin D"]
      }
    },
    "follow_up": {
      "tests_to_repeat": ["Lipid profile in 3 months"],
      "specialist_consultations": ["Cardiologist if cholesterol doesn't improve"],
      "monitoring_frequency": "Annual check-up recommended",
      "warning_signs": ["Chest pain", "Shortness of breath"]
    },
    "disclaimer": "This analysis is for informational purposes only..."
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (invalid file format, empty file)
- `500`: Server error (analysis failed)

---

### Analyze Prescription

Analyze a medical prescription (PDF or image).

**Endpoint**: `POST /analyze/prescription`

**Request**:

Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Prescription file (PDF, PNG, JPG, JPEG) |
| patient_age | integer | No | Patient age in years |
| patient_gender | string | No | Patient gender |
| patient_conditions | string | No | Known medical conditions |
| current_medications | string | No | Current medications |
| allergies | string | No | Known allergies |

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/analyze/prescription" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@prescription.jpg" \
  -F "patient_age=50" \
  -F "allergies=penicillin"
```

**Response**:
```json
{
  "success": true,
  "metadata": {
    "image_size": [1920, 1080],
    "method": "ocr",
    "character_count": 567
  },
  "analysis": {
    "prescription_summary": {
      "doctor_name": "Dr. John Smith",
      "clinic_name": "City Medical Center",
      "date": "2024-01-15",
      "diagnosis": "Hypertension",
      "total_medicines": 3
    },
    "medicines": [
      {
        "name": "Amlodipine 5mg",
        "dosage": "5mg",
        "frequency": "Once daily",
        "duration": "30 days",
        "category": "Calcium Channel Blocker",
        "purpose": "Treats high blood pressure",
        "how_it_works": "Relaxes blood vessels...",
        "pros": [
          {
            "benefit": "Effective blood pressure control",
            "explanation": "Works throughout the day"
          }
        ],
        "cons": [
          {
            "risk": "Ankle swelling",
            "severity": "Common",
            "mitigation": "Elevate legs when resting"
          }
        ],
        "common_side_effects": ["Ankle swelling", "Headache", "Dizziness"],
        "serious_side_effects": ["Severe dizziness", "Fainting", "Irregular heartbeat"],
        "precautions": ["Avoid grapefruit", "Stand up slowly"],
        "food_interactions": {
          "foods_to_avoid": ["Grapefruit"],
          "best_time_to_take": "Morning",
          "notes": "Can be taken with or without food"
        },
        "drug_interactions": ["Simvastatin", "Other blood pressure medications"],
        "storage": "Room temperature, away from moisture",
        "missed_dose": "Take as soon as remembered. Skip if near next dose.",
        "effectiveness_timeline": "Full effect in 1-2 weeks",
        "patient_rating": {
          "effectiveness": 4,
          "side_effects_level": "Low",
          "ease_of_use": 5
        }
      }
    ],
    "overall_assessment": {
      "treatment_appropriateness": "Appropriate for hypertension",
      "medicine_combination_safety": "Generally safe combination",
      "potential_interactions": [],
      "suggestions": [
        {
          "suggestion": "Monitor blood pressure daily",
          "reason": "Track medication effectiveness",
          "importance": "High"
        }
      ]
    },
    "recommendations": {
      "general_advice": ["Take medications at same time daily", "Monitor blood pressure"],
      "lifestyle_modifications": ["Reduce sodium intake", "Regular exercise"],
      "monitoring": ["Blood pressure", "Ankle swelling"],
      "follow_up": "4 weeks"
    },
    "red_flags": {
      "immediate_medical_attention": ["Chest pain", "Severe headache", "Difficulty breathing"],
      "when_to_stop_medicine": ["Severe allergic reaction", "Unusual swelling"]
    },
    "disclaimer": "This analysis is for informational purposes only..."
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request
- `500`: Server error

---

### Analyze Medicine

Get detailed information about a specific medicine.

**Endpoint**: `POST /analyze/medicine`

**Request**:

Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medicine_name | string | Yes | Medicine name |
| dosage | string | No | Dosage information |
| patient_age | integer | No | Patient age |
| patient_gender | string | No | Patient gender |
| patient_conditions | string | No | Known medical conditions |
| current_medications | string | No | Current medications |
| allergies | string | No | Known allergies |

**Example Request**:
```bash
curl -X POST "http://localhost:8000/api/v1/analyze/medicine" \
  -F "medicine_name=Metformin" \
  -F "dosage=500mg twice daily"
```

**Response**:
```json
{
  "success": true,
  "analysis": {
    "medicine": {
      "name": "Metformin",
      "generic_name": "Metformin Hydrochloride",
      "brand_names": ["Glucophage", "Glumetza", "Fortamet"],
      "drug_class": "Biguanide Antidiabetic Agent",
      "controlled_substance": "No"
    },
    "overview": {
      "primary_uses": ["Type 2 Diabetes Mellitus", "PCOS"],
      "how_it_works": "Reduces glucose production in liver...",
      "typical_dosage": "500mg twice daily, max 2550mg",
      "forms_available": ["Tablets", "Extended-release", "Oral solution"]
    },
    "benefits_and_drawbacks": {
      "pros": [
        {
          "benefit": "Effective blood sugar control",
          "explanation": "Lowers HbA1c by 1-2%",
          "evidence": "Strong"
        }
      ],
      "cons": [
        {
          "risk": "Gastrointestinal side effects",
          "severity": "Common",
          "likelihood": "20-30%",
          "mitigation": "Take with food, start low dose"
        }
      ]
    },
    "side_effects": {
      "common": ["Diarrhea", "Nausea", "Stomach upset"],
      "uncommon": ["Vitamin B12 deficiency"],
      "rare_but_serious": ["Lactic acidosis"]
    },
    "safety_information": {
      "contraindications": ["Severe kidney disease", "Liver disease"],
      "precautions": ["Monitor kidney function", "Stop before contrast procedures"],
      "pregnancy_category": "Category B",
      "breastfeeding": "Generally compatible",
      "age_restrictions": "Not for children under 10"
    },
    "interactions": {
      "drug_interactions": [
        {
          "drug": "Insulin",
          "effect": "Increased hypoglycemia risk",
          "severity": "Moderate",
          "action": "Monitor blood sugar"
        }
      ],
      "food_interactions": ["Take with meals"],
      "alcohol": "Avoid excessive alcohol",
      "supplement_interactions": ["Vitamin B12 may need supplementation"]
    },
    "practical_guidance": {
      "best_time_to_take": "With breakfast and dinner",
      "with_or_without_food": "Always with food",
      "storage": "Room temperature",
      "missed_dose": "Take as soon as remembered",
      "stopping": "Consult doctor before stopping"
    },
    "patient_reviews_summary": {
      "average_rating": "7.5/10",
      "common_positive_feedback": ["Effective", "Affordable", "Weight neutral"],
      "common_complaints": ["Stomach upset initially"],
      "satisfaction_rate": "75%"
    },
    "cost_and_availability": {
      "generic_available": "Yes",
      "average_cost_range": "$4-15/month",
      "insurance_coverage": "Widely covered"
    },
    "doctor_recommendation": {
      "when_to_consider": "First-line for Type 2 diabetes",
      "alternatives": ["Sulfonylureas", "DPP-4 inhibitors", "SGLT2 inhibitors"],
      "questions_to_ask_doctor": [
        "How often should I test blood sugar?",
        "What side effects should I watch for?"
      ]
    },
    "disclaimer": "This information is for educational purposes only..."
  }
}
```

**Status Codes**:
- `200`: Success
- `400`: Bad request (missing medicine_name)
- `500`: Server error

---

### OCR Extract Only

Extract text from a document without analysis.

**Endpoint**: `POST /ocr/extract`

**Request**:

Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Document file |

**Response**:
```json
{
  "success": true,
  "text": "Extracted text content...",
  "metadata": {
    "page_count": 1,
    "method": "ocr",
    "character_count": 1234
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message description"
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input or file format |
| 422 | Unprocessable Entity - Validation error |
| 500 | Internal Server Error - Analysis failed |
| 503 | Service Unavailable - Model not loaded |

### Error Examples

**Invalid File Format**:
```json
{
  "detail": "Unsupported file format: .docx. Supported formats: PDF, PNG, JPG, JPEG"
}
```

**Empty File**:
```json
{
  "detail": "Could not extract text from the uploaded file. Please ensure the file is readable."
}
```

**Analysis Failure**:
```json
{
  "detail": "Analysis failed: model inference error"
}
```

---

## Rate Limiting

For production deployments, implement rate limiting:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/analyze/blood-report")
@limiter.limit("10/minute")
async def analyze_blood_report(...):
    pass
```

---

## Webhooks (Future)

Planned webhook support for asynchronous processing:

```json
{
  "event": "analysis.completed",
  "data": {
    "analysis_id": "abc123",
    "type": "blood_report",
    "status": "completed",
    "result_url": "/results/abc123"
  }
}
```

---

## SDK Examples

### Python

```python
import requests

API_URL = "http://localhost:8000/api/v1"

def analyze_blood_report(file_path: str, patient_age: int = None):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {}
        if patient_age:
            data['patient_age'] = patient_age

        response = requests.post(
            f"{API_URL}/analyze/blood-report",
            files=files,
            data=data
        )

    return response.json()

# Usage
result = analyze_blood_report("blood_report.pdf", patient_age=45)
print(result['analysis']['summary'])
```

### JavaScript/TypeScript

```typescript
const API_URL = "http://localhost:8000/api/v1";

async function analyzeBloodReport(
  file: File,
  patientAge?: number
): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  if (patientAge) {
    formData.append('patient_age', patientAge.toString());
  }

  const response = await fetch(`${API_URL}/analyze/blood-report`, {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

// Usage
const input = document.querySelector('input[type="file"]') as HTMLInputElement;
const file = input.files?.[0];
if (file) {
  const result = await analyzeBloodReport(file, 45);
  console.log(result.analysis.summary);
}
```

### cURL

```bash
# Blood report analysis
curl -X POST "http://localhost:8000/api/v1/analyze/blood-report" \
  -F "file=@blood_report.pdf" \
  -F "patient_age=45"

# Prescription analysis
curl -X POST "http://localhost:8000/api/v1/analyze/prescription" \
  -F "file=@prescription.jpg"

# Medicine analysis
curl -X POST "http://localhost:8000/api/v1/analyze/medicine" \
  -F "medicine_name=Metformin" \
  -F "dosage=500mg twice daily"
```

---

## Versioning

The API uses URL versioning (e.g., `/api/v1/`). Breaking changes will result in a new version number.

Current version: `v1`