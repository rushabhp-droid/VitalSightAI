# VitalSightAI Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Backend Documentation](#backend-documentation)
5. [Frontend Documentation](#frontend-documentation)
6. [Model Training Guide](#model-training-guide)
7. [API Reference](#api-reference)
8. [Deployment Guide](#deployment-guide)
9. [Security & Privacy](#security--privacy)
10. [Troubleshooting](#troubleshooting)

---

## Overview

VitalSightAI is an AI-powered health analysis platform designed to help users understand their medical documents. It provides:

- **Blood Report Analysis**: Upload blood test reports and receive detailed health insights, parameter explanations, and lifestyle recommendations
- **Prescription Analysis**: Understand prescribed medications, their benefits, risks, interactions, and safety information
- **Medicine Lookup**: Search any medicine for comprehensive information including dosing, side effects, and patient guidance

### Key Features

| Feature | Description |
|---------|-------------|
| OCR Processing | Extracts text from PDF and image documents |
| Custom AI Model | Uses fine-tuned language models for analysis |
| Privacy-First | No data storage - all processing in memory |
| Multi-format Support | PDF, PNG, JPG, JPEG supported |
| Structured Output | JSON-formatted responses for easy integration |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │
│  │   Blood     │  │ Prescription│  │  Medicine   │                  │
│  │  Analyzer   │  │  Analyzer   │  │  Analyzer   │                  │
│  └─────────────┘  └─────────────┘  └─────────────┘                  │
│                           │                                          │
│                    REST API Calls                                   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Backend (FastAPI)                             │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                      API Layer                               │    │
│  │  /analyze/blood-report  │  /analyze/prescription  │  /...  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   Service Layer                              │    │
│  │  ┌─────────────┐  ┌─────────────────────────────────────┐  │    │
│  │  │ OCR Service │  │        Model Service                 │  │    │
│  │  │ (Tesseract) │  │  (PyTorch + Transformers)            │  │    │
│  │  └─────────────┘  └─────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                  Custom Medical Model                         │    │
│  │              (Fine-tuned Llama/Mistral)                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology |
|-----------|-------------|
| Frontend | Next.js 14, React 18, TypeScript, TailwindCSS |
| Backend | Python 3.10+, FastAPI, Uvicorn |
| AI/ML | PyTorch, HuggingFace Transformers |
| OCR | Tesseract, PyPDF2, pdf2image |
| Model | Llama 3.2 / Mistral 7B (fine-tuned) |

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- Tesseract OCR
- (Optional) NVIDIA GPU with CUDA for faster inference

### Quick Start

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/VitalSightAI.git
cd VitalSightAI
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with your settings
# (No API key needed - using local model)
```

#### 3. Install Tesseract
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

#### 4. Start Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 5. Frontend Setup (New Terminal)
```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start development server
npm run dev
```

#### 6. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## Backend Documentation

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes.py           # API endpoints
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py           # Configuration management
│   ├── services/
│   │   ├── __init__.py
│   │   ├── model_service.py    # Model inference service
│   │   └── ocr_service.py      # OCR processing service
│   └── training/
│       ├── __init__.py
│       ├── pipeline.py         # Model training pipeline
│       └── data_preparation.py # Training data utilities
├── models/                     # Fine-tuned models directory
├── training_data/              # Training datasets
├── requirements.txt
├── .env.example
└── README.md
```

### Configuration

Edit `backend/.env`:

```env
# App Configuration
APP_NAME=VitalSightAI
DEBUG=true
CORS_ORIGINS=["http://localhost:3000"]

# OCR Configuration
TESSERACT_CMD=/usr/bin/tesseract  # Path to Tesseract executable

# Model Configuration (optional)
MODEL_PATH=./models/vitalsight-medical-v1
```

### Services

#### OCRService

Handles document text extraction:

```python
from app.services.ocr_service import OCRService

ocr = OCRService()

# Extract text from PDF or image
text, metadata = await ocr.extract_text(file_content, filename)
```

Supported formats:
- PDF documents
- PNG images
- JPEG/JPG images
- BMP images
- TIFF images

#### ModelService

Manages AI model inference:

```python
from app.services.model_service import ModelService

model = ModelService()

# Analyze blood report
analysis = model.analyze_blood_report(extracted_text, patient_info)

# Analyze prescription
analysis = model.analyze_prescription(extracted_text, patient_info)

# Analyze single medicine
analysis = model.analyze_medicine(medicine_name, dosage, patient_info)
```

---

## Frontend Documentation

### Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/
│   │   ├── BloodReportAnalyzer.tsx
│   │   ├── PrescriptionAnalyzer.tsx
│   │   └── MedicineAnalyzer.tsx
│   └── lib/
│       └── api.ts             # API client
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

### Components

#### BloodReportAnalyzer

Analyzes blood test reports:

```tsx
import BloodReportAnalyzer from '@/components/BloodReportAnalyzer'

// Usage - renders complete blood report analysis interface
<BloodReportAnalyzer />
```

Features:
- File upload (drag & drop)
- Patient information input
- Parameter analysis display
- Abnormal findings highlighting
- Health insights
- Dietary recommendations
- Follow-up suggestions

#### PrescriptionAnalyzer

Analyzes medical prescriptions:

```tsx
import PrescriptionAnalyzer from '@/components/PrescriptionAnalyzer'

// Usage
<PrescriptionAnalyzer />
```

Features:
- Prescription upload
- Medicine extraction and analysis
- Pros/cons display
- Side effects warnings
- Drug interactions
- Food interactions

#### MedicineAnalyzer

Searches medicine information:

```tsx
import MedicineAnalyzer from '@/components/MedicineAnalyzer'

// Usage
<MedicineAnalyzer />
```

Features:
- Medicine name search
- Quick-select common medicines
- Comprehensive drug information
- Safety information
- Patient reviews
- Doctor recommendations

---

## Model Training Guide

### Training Data Format

Training data uses JSONL format with input-output pairs:

#### Blood Analysis Example

```json
{
  "input": "BLOOD REPORT TEXT HERE...",
  "output": "{\"summary\": {...}, \"parameters\": [...], ...}"
}
```

#### Prescription Analysis Example

```json
{
  "input": "PRESCRIPTION TEXT HERE...",
  "output": "{\"prescription_summary\": {...}, \"medicines\": [...], ...}"
}
```

#### Medicine Analysis Example

```json
{
  "medicine_name": "Metformin",
  "dosage": "500mg twice daily",
  "output": "{\"medicine\": {...}, \"overview\": {...}, ...}"
}
```

### Training Pipeline

#### 1. Prepare Training Data

Place your training data in `backend/training_data/`:
- `blood_analysis_train.jsonl`
- `prescription_analysis_train.jsonl`
- `medicine_analysis_train.jsonl`

#### 2. Run Training

```bash
cd backend

# Activate virtual environment
source venv/bin/activate

# Run training
python -m app.training.pipeline \
    --train_data training_data/blood_analysis_train.jsonl \
    --base_model meta-llama/Llama-3.2-3B-Instruct \
    --output_dir ./models/vitalsight-medical-v1 \
    --epochs 3 \
    --batch_size 4 \
    --learning_rate 2e-5 \
    --task_type blood_analysis
```

#### Training Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `--base_model` | meta-llama/Llama-3.2-3B-Instruct | Base model to fine-tune |
| `--train_data` | Required | Path to training data JSONL |
| `--val_data` | Optional | Path to validation data |
| `--output_dir` | ./models/vitalsight-medical-v1 | Output directory |
| `--epochs` | 3 | Number of training epochs |
| `--batch_size` | 4 | Batch size per device |
| `--learning_rate` | 2e-5 | Learning rate |
| `--task_type` | blood_analysis | Task type (blood_analysis/prescription_analysis/medicine_analysis) |

#### 3. Multi-Task Training

For training on multiple tasks, concatenate data or train sequentially:

```bash
# Create combined dataset
cat training_data/*.jsonl > training_data/combined_train.jsonl

# Train
python -m app.training.pipeline \
    --train_data training_data/combined_train.jsonl \
    --output_dir ./models/vitalsight-multi-v1 \
    --epochs 5
```

### GPU Requirements

| Model Size | Minimum VRAM | Recommended VRAM |
|------------|--------------|------------------|
| 3B parameters | 8 GB | 12 GB |
| 7B parameters | 16 GB | 24 GB |
| 13B parameters | 24 GB | 40 GB |

### Using LoRA for Efficient Training

For limited GPU memory, use LoRA (Low-Rank Adaptation):

```python
from peft import LoraConfig, get_peft_model

lora_config = LoraConfig(
    r=8,  # LoRA rank
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
)

model = get_peft_model(base_model, lora_config)
```

---

## API Reference

### Base URL

```
http://localhost:8000/api/v1
```

### Endpoints

#### POST /analyze/blood-report

Analyze a blood test report.

**Request:**
- Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | PDF or image file |
| patient_age | int | No | Patient age |
| patient_gender | string | No | Patient gender |
| patient_conditions | string | No | Known medical conditions |

**Response:**
```json
{
  "success": true,
  "metadata": {
    "page_count": 1,
    "method": "ocr",
    "character_count": 1234
  },
  "analysis": {
    "summary": {...},
    "parameters": [...],
    "abnormal_findings": [...],
    "health_insights": {...},
    "follow_up": {...}
  }
}
```

**Example:**
```bash
curl -X POST "http://localhost:8000/api/v1/analyze/blood-report" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@blood_report.pdf" \
  -F "patient_age=45" \
  -F "patient_gender=male"
```

---

#### POST /analyze/prescription

Analyze a medical prescription.

**Request:**
- Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | PDF or image file |
| patient_age | int | No | Patient age |
| patient_gender | string | No | Patient gender |
| patient_conditions | string | No | Known medical conditions |
| current_medications | string | No | Current medications |
| allergies | string | No | Known allergies |

**Response:**
```json
{
  "success": true,
  "metadata": {...},
  "analysis": {
    "prescription_summary": {...},
    "medicines": [...],
    "overall_assessment": {...},
    "recommendations": {...},
    "red_flags": {...}
  }
}
```

---

#### POST /analyze/medicine

Analyze a single medicine by name.

**Request:**
- Content-Type: `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medicine_name | string | Yes | Medicine name |
| dosage | string | No | Dosage information |
| patient_age | int | No | Patient age |
| patient_gender | string | No | Patient gender |
| patient_conditions | string | No | Known medical conditions |
| current_medications | string | No | Current medications |
| allergies | string | No | Known allergies |

**Response:**
```json
{
  "success": true,
  "analysis": {
    "medicine": {...},
    "overview": {...},
    "benefits_and_drawbacks": {...},
    "side_effects": {...},
    "safety_information": {...},
    "interactions": {...},
    "practical_guidance": {...}
  }
}
```

---

#### GET /health

Health check endpoint.

**Response:**
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

---

## Deployment Guide

### Docker Deployment

#### 1. Create Dockerfile (Backend)

```dockerfile
# backend/Dockerfile
FROM python:3.10-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Create Dockerfile (Frontend)

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
```

#### 3. Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models
    environment:
      - DEBUG=false
    deploy:
      resources:
        reservations:
          devices:
            - capabilities: [gpu]

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
    depends_on:
      - backend
```

#### 4. Run

```bash
docker-compose up -d
```

### Cloud Deployment

#### AWS

1. **Backend**: Deploy to AWS ECS or EC2 with GPU instances
2. **Frontend**: Deploy to AWS Amplify or S3 + CloudFront
3. **Model**: Store in S3, load at startup

#### Google Cloud

1. **Backend**: Deploy to Google Cloud Run or GKE
2. **Frontend**: Deploy to Firebase Hosting
3. **Model**: Store in Google Cloud Storage

#### Azure

1. **Backend**: Deploy to Azure Container Instances or AKS
2. **Frontend**: Deploy to Azure Static Web Apps
3. **Model**: Store in Azure Blob Storage

---

## Security & Privacy

### Data Handling

- **No Data Storage**: All uploaded files are processed in memory and immediately discarded
- **Session-Only**: Analysis results are returned to the client and not stored
- **No Logging**: File contents are never logged

### Best Practices

1. **HTTPS**: Always use HTTPS in production
2. **Rate Limiting**: Implement rate limiting to prevent abuse
3. **Input Validation**: All inputs are validated
4. **CORS**: Configure CORS for your specific domain
5. **Authentication**: Add authentication for production use

### Adding Authentication

```python
# Add to backend/app/api/routes.py
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    # Validate token
    if not validate_token(token):
        raise HTTPException(status_code=401, detail="Invalid token")
    return get_user_from_token(token)

# Add to endpoints
@router.post("/analyze/blood-report")
async def analyze_blood_report(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    ...
```

---

## Troubleshooting

### Common Issues

#### Model Not Loading

**Problem**: `RuntimeError: CUDA out of memory`

**Solution**:
- Use smaller model (3B instead of 7B)
- Reduce batch size
- Use quantization:

```python
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    load_in_8bit=True,  # 8-bit quantization
    device_map="auto"
)
```

#### OCR Not Working

**Problem**: `TesseractNotFoundError`

**Solution**:
- Install Tesseract: `sudo apt-get install tesseract-ocr`
- Set path in config: `TESSERACT_CMD=/usr/bin/tesseract`

#### PDF Processing Issues

**Problem**: `PDF extraction returns empty text`

**Solution**:
- Ensure `pdf2image` is installed
- Install poppler: `sudo apt-get install poppler-utils`
- Check if PDF is password protected

#### Frontend API Errors

**Problem**: CORS errors in browser

**Solution**:
- Update CORS in backend config:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "your-production-domain"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Logs

View backend logs:
```bash
# Development
uvicorn app.main:app --reload --log-level debug

# Production
journalctl -u vitalsight-backend -f
```

### Performance Optimization

1. **Model Quantization**: Use 8-bit or 4-bit quantization
2. **Batch Processing**: Process multiple requests in batches
3. **Caching**: Cache common medicine analyses
4. **GPU Utilization**: Monitor with `nvidia-smi`
5. **Async Processing**: Use background tasks for large files

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - See LICENSE file for details.