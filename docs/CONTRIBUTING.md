# Contributing to VitalSightAI

Thank you for your interest in contributing to VitalSightAI! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Adding Training Data](#adding-training-data)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Expected Behavior

- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discriminatory language
- Trolling or insulting comments
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git
- Tesseract OCR
- (Optional) NVIDIA GPU with CUDA

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/VitalSightAI.git
cd VitalSightAI

# Add upstream remote
git remote add upstream https://github.com/original/VitalSightAI.git
```

---

## Development Setup

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Copy environment file
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# Run development server
npm run dev
```

### Pre-commit Hooks

Set up pre-commit hooks:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install
```

---

## How to Contribute

### Types of Contributions

1. **Bug Fixes**: Fix issues in existing code
2. **Features**: Add new functionality
3. **Documentation**: Improve or add documentation
4. **Training Data**: Add more training examples
5. **Testing**: Add or improve tests

### Finding Issues to Work On

- Check the [Issues](https://github.com/yourusername/VitalSightAI/issues) page
- Look for labels: `good first issue`, `help wanted`, `bug`, `enhancement`
- Comment on the issue to indicate you're working on it

---

## Coding Standards

### Python (Backend)

We follow PEP 8 with some modifications:

```python
# Use type hints
def analyze_report(self, text: str, patient_info: Optional[Dict] = None) -> Dict[str, Any]:
    """Analyze blood report and return structured insights.

    Args:
        text: OCR-extracted text from blood report
        patient_info: Optional patient demographics

    Returns:
        Structured analysis dictionary
    """
    pass

# Use docstrings for all functions and classes
# Use meaningful variable names
# Keep functions small and focused
# Use async for I/O operations
```

#### Code Style

```bash
# Format code
black app/

# Sort imports
isort app/

# Check style
flake8 app/

# Type checking
mypy app/
```

### TypeScript (Frontend)

```typescript
// Use TypeScript types
interface AnalysisResult {
  summary: Summary;
  parameters: Parameter[];
}

// Use functional components
const BloodReportAnalyzer: React.FC = () => {
  // Component code
};

// Use meaningful names
const handleFileUpload = async (file: File): Promise<void> => {
  // Function code
};

// Keep components small and focused
// Use custom hooks for reusable logic
```

#### Code Style

```bash
# Lint
npm run lint

# Fix linting issues
npm run lint:fix

# Type check
npm run type-check
```

---

## Testing Guidelines

### Backend Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_blood_analyzer.py

# Run specific test
pytest tests/test_blood_analyzer.py::test_analyze_report
```

#### Writing Tests

```python
import pytest
from app.services.model_service import ModelService

class TestModelService:
    """Tests for ModelService class."""

    @pytest.fixture
    def model_service(self):
        """Create ModelService instance for testing."""
        return ModelService()

    def test_analyze_blood_report_returns_dict(self, model_service):
        """Test that analyze_blood_report returns a dictionary."""
        result = model_service.analyze_blood_report("test text")
        assert isinstance(result, dict)
        assert "summary" in result

    def test_analyze_blood_report_with_patient_info(self, model_service):
        """Test analysis with patient information."""
        patient_info = {"age": 45, "gender": "male"}
        result = model_service.analyze_blood_report("test", patient_info)
        assert result is not None
```

### Frontend Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- BloodReportAnalyzer
```

#### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import BloodReportAnalyzer from '@/components/BloodReportAnalyzer';

describe('BloodReportAnalyzer', () => {
  it('renders upload area', () => {
    render(<BloodReportAnalyzer />);
    expect(screen.getByText(/upload blood report/i)).toBeInTheDocument();
  });

  it('displays file name after upload', async () => {
    // Test implementation
  });
});
```

---

## Pull Request Process

### Before Submitting

1. **Update from upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make changes and commit**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

4. **Run tests**
   ```bash
   # Backend
   cd backend && pytest

   # Frontend
   cd frontend && npm test
   ```

5. **Push to fork**
   ```bash
   git push origin feature/amazing-feature
   ```

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(analyzer): add support for new blood test parameters

fix(ocr): handle corrupted PDF files correctly

docs(readme): update installation instructions
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process

1. At least one approval required
2. All tests must pass
3. No merge conflicts
4. Documentation updated if needed

---

## Adding Training Data

### Format

Training data should be in JSONL format:

```json
{"input": "blood report text", "output": "structured JSON analysis"}
```

### Guidelines

1. **Accuracy**: Ensure medical information is accurate
2. **Variety**: Include diverse medical scenarios
3. **Completeness**: Include all expected output fields
4. **Privacy**: Remove all personally identifiable information

### Adding Data

```bash
# Navigate to training data directory
cd backend/training_data

# Create or append to training file
# blood_analysis_train.jsonl
# prescription_analysis_train.jsonl
# medicine_analysis_train.jsonl

# Validate JSONL format
python -c "import json; [json.loads(line) for line in open('blood_analysis_train.jsonl')]"
```

### Data Sources

- Public medical datasets
- Synthetic data generation
- Manual creation with medical accuracy verification

**Important**: Always verify medical accuracy with healthcare professionals.

---

## Reporting Issues

### Bug Reports

Use the bug report template:

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Screenshots
If applicable

## Environment
- OS: [e.g. Ubuntu 22.04]
- Python version: [e.g. 3.10]
- Node version: [e.g. 18.17]

## Additional Context
Any other context
```

### Feature Requests

Use the feature request template:

```markdown
## Is your feature request related to a problem?
Description of the problem

## Describe the solution you'd like
Description of the desired feature

## Describe alternatives you've considered
Alternative solutions

## Additional Context
Any other context or screenshots
```

---

## Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For security issues only

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions

Thank you for contributing to VitalSightAI! 🎉