# VitalSightAI Backend

AI-powered blood report and prescription analysis system.

## Setup

### 1. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Install Tesseract (for OCR)
- **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
- **macOS**: `brew install tesseract`
- **Windows**: Download from https://github.com/UB-Mannheim/tesseract/wiki

### 4. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Run the Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Model Training

### Prepare Training Data
```bash
python -m app.training.data_preparation
```

### Train Custom Model
```bash
python -m app.training.pipeline \
    --train_data training_data/blood_analysis_train.jsonl \
    --base_model meta-llama/Llama-3.2-3B-Instruct \
    --output_dir ./models/vitalsight-medical-v1 \
    --epochs 3
```

### Use Pre-trained Model
The system will automatically download and use the base model if no custom model is found.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analyze/blood-report` | POST | Analyze blood test report |
| `/api/v1/analyze/prescription` | POST | Analyze medical prescription |
| `/api/v1/analyze/medicine` | POST | Analyze single medicine |
| `/api/v1/ocr/extract` | POST | Extract text from document |

## Project Structure
```
backend/
├── app/
│   ├── api/
│   │   └── routes.py          # API endpoints
│   ├── core/
│   │   └── config.py          # Configuration
│   ├── services/
│   │   ├── model_service.py   # Model management
│   │   └── ocr_service.py     # OCR processing
│   ├── training/
│   │   ├── pipeline.py        # Training pipeline
│   │   └── data_preparation.py # Data utilities
│   └── main.py                # Application entry
├── models/                    # Fine-tuned models
├── training_data/             # Training datasets
└── requirements.txt
```