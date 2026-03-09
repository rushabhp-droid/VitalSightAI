# VitalSightAI - Quick Start Guide

Get up and running with VitalSightAI in under 10 minutes.

## Prerequisites Check

Before starting, ensure you have:

- [ ] Python 3.10 or higher
- [ ] Node.js 18 or higher
- [ ] Tesseract OCR
- [ ] Git
- [ ] (Optional) NVIDIA GPU with CUDA for faster inference

## Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/VitalSightAI.git
cd VitalSightAI
```

### Step 2: Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
```

### Step 3: Install Tesseract OCR

**Ubuntu/Debian:**
```bash
sudo apt-get update && sudo apt-get install tesseract-ocr
```

**macOS:**
```bash
brew install tesseract
```

**Windows:**
Download from https://github.com/UB-Mannheim/tesseract/wiki

### Step 4: Start Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Step 5: Frontend Setup (New Terminal)

```bash
cd frontend

# Install dependencies
npm install

# Set up environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Start development server
npm run dev
```

You should see:
```
▲ Next.js 14.x
- Local:        http://localhost:3000
```

### Step 6: Access Application

Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## Quick Usage

### Analyze Blood Report

1. Click on "Blood Report" tab
2. Upload a PDF or image of your blood test
3. (Optional) Enter patient information
4. Click "Analyze Report"
5. View detailed results

### Analyze Prescription

1. Click on "Prescription" tab
2. Upload a prescription image/PDF
3. (Optional) Enter patient information
4. Click "Analyze Prescription"
5. See medicine details and interactions

### Look Up Medicine

1. Click on "Medicine" tab
2. Type medicine name or select from quick picks
3. (Optional) Enter dosage
4. Click "Analyze Medicine"
5. Get comprehensive drug information

## Testing API Directly

### Using cURL

```bash
# Blood report analysis
curl -X POST "http://localhost:8000/api/v1/analyze/blood-report" \
  -F "file=@your_blood_report.pdf"

# Medicine analysis
curl -X POST "http://localhost:8000/api/v1/analyze/medicine" \
  -F "medicine_name=Paracetamol"
```

### Using Python

```python
import requests

url = "http://localhost:8000/api/v1/analyze/medicine"
files = {'file': open('blood_report.pdf', 'rb')}
data = {'patient_age': 45}

response = requests.post(url, files=files, data=data)
print(response.json())
```

## Training Your Own Model

### Step 1: Prepare Training Data

Place your training data in `backend/training_data/`:
- `blood_analysis_train.jsonl` - Blood report examples
- `prescription_analysis_train.jsonl` - Prescription examples
- `medicine_analysis_train.jsonl` - Medicine examples

### Step 2: Run Training

```bash
cd backend
source venv/bin/activate

python -m app.training.pipeline \
    --train_data training_data/blood_analysis_train.jsonl \
    --base_model meta-llama/Llama-3.2-3B-Instruct \
    --output_dir ./models/vitalsight-medical-v1 \
    --epochs 3
```

### Step 3: Use Your Model

Update `.env`:
```env
MODEL_PATH=./models/vitalsight-medical-v1
```

## Common Issues

### Issue: "Module not found" errors

**Solution**: Make sure virtual environment is activated:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

### Issue: "Tesseract not found"

**Solution**: Install Tesseract:
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract
```

### Issue: "CUDA out of memory"

**Solution**: Use smaller batch size or quantization:
```bash
python -m app.training.pipeline \
    --batch_size 1 \
    # or use CPU
```

### Issue: CORS errors in frontend

**Solution**: Ensure backend is running and CORS is configured:
```python
# In backend/.env
CORS_ORIGINS=["http://localhost:3000"]
```

## Next Steps

- 📖 Read the [full documentation](docs/DOCUMENTATION.md)
- 🔧 Check the [API specification](docs/API_SPECIFICATION.md)
- 🤝 Contribute with our [contributing guide](docs/CONTRIBUTING.md)

## Need Help?

- 📧 Open an issue on GitHub
- 📖 Check the troubleshooting section in [DOCUMENTATION.md](docs/DOCUMENTATION.md)