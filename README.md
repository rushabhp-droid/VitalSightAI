# VitalSightAI

<div align="center">
  <img src="docs/logo.png" alt="VitalSightAI Logo" width="200">

  **AI-Powered Health Analysis Platform**

  [Quick Start](docs/QUICK_START.md) • [Documentation](docs/DOCUMENTATION.md) • [API Reference](docs/API_SPECIFICATION.md) • [Contributing](docs/CONTRIBUTING.md)
</div>

---

## Overview

VitalSightAI helps you understand your health better by analyzing:
- **Blood Reports**: Get detailed insights about your blood test results, including parameter analysis, abnormal findings, health recommendations, and dietary suggestions
- **Prescriptions**: Understand your medications - pros/cons, side effects, interactions, and personalized recommendations
- **Individual Medicines**: Search any medicine to get comprehensive information

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/yourusername/VitalSightAI.git
cd VitalSightAI

# Backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Access at http://localhost:3000

📖 **[Full Quick Start Guide](docs/QUICK_START.md)**

### Blood Report Analysis
- Upload PDF or image of blood test report
- OCR extraction of test values
- AI-powered analysis of each parameter
- Identification of abnormal values
- Health insights and recommendations
- Dietary suggestions based on results
- Follow-up recommendations

### Prescription Analysis
- Upload prescription image/PDF
- Extract medicine information
- Detailed pros and cons for each medicine
- Side effects (common and serious)
- Drug and food interactions
- Personalized recommendations

### Medicine Lookup
- Search any medicine by name
- Comprehensive drug information
- Benefits and drawbacks
- Safety information
- Patient reviews summary
- Doctor's perspective

## Architecture

```
VitalSightAI/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration
│   │   ├── services/       # OCR and Model services
│   │   └── training/       # Model training pipeline
│   ├── models/             # Fine-tuned models
│   └── training_data/      # Training datasets
│
└── frontend/               # Next.js frontend
    └── src/
        ├── app/            # App router pages
        ├── components/     # React components
        └── lib/            # API client
```

## Tech Stack

### Backend
- Python 3.10+
- FastAPI
- PyTorch
- Transformers (HuggingFace)
- Tesseract OCR
- PyPDF2 / pdf2image

### Frontend
- Next.js 14
- React 18
- TypeScript
- TailwindCSS

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Tesseract OCR

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your settings
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local
npm run dev
```

## Model Training

### Prepare Training Data
```bash
cd backend
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

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/analyze/blood-report` | POST | Analyze blood test report |
| `/api/v1/analyze/prescription` | POST | Analyze prescription |
| `/api/v1/analyze/medicine` | POST | Analyze single medicine |
| `/api/v1/health` | GET | Health check |

## Security & Privacy

- No data is stored permanently
- All processing happens in memory
- Documents are processed and discarded immediately
- No external API calls for analysis (uses local model)

## Disclaimer

This application is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## License

MIT License