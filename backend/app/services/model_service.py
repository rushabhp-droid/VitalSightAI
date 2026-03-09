"""
Custom Medical AI Model Service

Handles loading, inference, and management of custom-trained medical models.
"""

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
from typing import Dict, Any, Optional, List
import json
import logging
from pathlib import Path

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class ModelService:
    """
    Service for managing and running custom medical AI models.

    Supports:
    - Loading fine-tuned models
    - Running inference for blood report analysis
    - Running inference for prescription analysis
    - Managing model versions
    """

    def __init__(self, model_path: Optional[str] = None):
        self.settings = get_settings()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None
        self.model_path = model_path or self._get_default_model_path()

        # Load model on initialization
        self._load_model()

    def _get_default_model_path(self) -> str:
        """Get the default model path."""
        base_path = Path(__file__).parent.parent.parent / "models"
        return str(base_path / "vitalsight-medical-v1")

    def _load_model(self):
        """Load the model and tokenizer."""
        try:
            logger.info(f"Loading model from {self.model_path}")

            # Check if custom model exists
            if Path(self.model_path).exists():
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_path)
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_path,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    device_map="auto" if self.device == "cuda" else None
                )
                logger.info("Custom model loaded successfully")
            else:
                # Use base model for inference (will be fine-tuned)
                base_model = "meta-llama/Llama-3.2-3B-Instruct"  # Or Mistral-7B
                logger.info(f"Loading base model: {base_model}")
                self.tokenizer = AutoTokenizer.from_pretrained(base_model)
                self.model = AutoModelForCausalLM.from_pretrained(
                    base_model,
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    device_map="auto" if self.device == "cuda" else None
                )
                logger.info("Base model loaded successfully")

            self.model.eval()

        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    def generate_response(
        self,
        prompt: str,
        max_tokens: int = 2048,
        temperature: float = 0.7,
        top_p: float = 0.9
    ) -> str:
        """
        Generate response from the model.

        Args:
            prompt: Input prompt
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            top_p: Top-p sampling

        Returns:
            Generated text response
        """
        inputs = self.tokenizer(prompt, return_tensors="pt")

        if self.device == "cuda":
            inputs = {k: v.cuda() for k, v in inputs.items()}

        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id
            )

        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Extract only the generated part (remove input prompt)
        if prompt in response:
            response = response[len(prompt):]

        return response.strip()

    def analyze_blood_report(
        self,
        extracted_text: str,
        patient_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze blood report using the custom model.

        Args:
            extracted_text: OCR-extracted text from blood report
            patient_info: Optional patient demographics

        Returns:
            Structured analysis results
        """
        prompt = self._build_blood_analysis_prompt(extracted_text, patient_info)
        response = self.generate_response(prompt)
        return self._parse_json_response(response)

    def analyze_prescription(
        self,
        extracted_text: str,
        patient_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze prescription using the custom model.

        Args:
            extracted_text: OCR-extracted text from prescription
            patient_info: Optional patient demographics

        Returns:
            Structured analysis results
        """
        prompt = self._build_prescription_analysis_prompt(extracted_text, patient_info)
        response = self.generate_response(prompt)
        return self._parse_json_response(response)

    def analyze_medicine(
        self,
        medicine_name: str,
        dosage: Optional[str] = None,
        patient_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Analyze a single medicine in detail.

        Args:
            medicine_name: Name of the medicine
            dosage: Optional dosage information
            patient_info: Optional patient demographics

        Returns:
            Detailed medicine analysis
        """
        prompt = self._build_medicine_analysis_prompt(medicine_name, dosage, patient_info)
        response = self.generate_response(prompt)
        return self._parse_json_response(response)

    def _build_blood_analysis_prompt(self, text: str, patient_info: Optional[Dict[str, Any]] = None) -> str:
        """Build prompt for blood report analysis."""
        patient_context = ""
        if patient_info:
            patient_context = f"\nPatient: Age {patient_info.get('age', 'unknown')}, {patient_info.get('gender', 'unknown')}"

        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a medical AI assistant specializing in blood test analysis. Analyze blood test reports and provide comprehensive health insights in JSON format. Always provide valid JSON.

<|eot_id|><|start_header_id|>user<|end_header_id|>
{patient_context}

Blood Test Report:
```
{text}
```

Analyze this blood test report and provide:
1. Summary of overall health status
2. Each parameter with value, unit, reference range, and status (Normal/High/Low/Critical)
3. Abnormal findings with possible causes and recommendations
4. Health insights including strengths and areas of concern
5. Lifestyle recommendations
6. Follow-up suggestions

Respond with valid JSON only.<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""

    def _build_prescription_analysis_prompt(self, text: str, patient_info: Optional[Dict[str, Any]] = None) -> str:
        """Build prompt for prescription analysis."""
        patient_context = ""
        if patient_info:
            patient_context = f"\nPatient: Age {patient_info.get('age', 'unknown')}, {patient_info.get('gender', 'unknown')}"

        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a medical AI assistant specializing in pharmaceutical analysis. Analyze prescriptions and provide detailed medicine information including pros, cons, interactions, and recommendations in JSON format. Always provide valid JSON.

<|eot_id|><|start_header_id|>user<|end_header_id|>
{patient_context}

Prescription:
```
{text}
```

Analyze this prescription and for each medicine provide:
1. Name, dosage, frequency, purpose
2. How it works
3. Pros and cons with severity levels
4. Side effects (common and serious)
5. Food and drug interactions
6. Precautions and recommendations

Respond with valid JSON only.<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""

    def _build_medicine_analysis_prompt(self, medicine_name: str, dosage: Optional[str],
                                         patient_info: Optional[Dict[str, Any]] = None) -> str:
        """Build prompt for single medicine analysis."""
        patient_context = ""
        if patient_info:
            patient_context = f"\nPatient: Age {patient_info.get('age', 'unknown')}, {patient_info.get('gender', 'unknown')}"

        dosage_text = f"\nDosage: {dosage}" if dosage else ""

        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a medical AI assistant specializing in pharmaceutical analysis. Provide comprehensive information about medicines in JSON format. Always provide valid JSON.

<|eot_id|><|start_header_id|>user<|end_header_id|>
{patient_context}

Medicine: {medicine_name}{dosage_text}

Provide detailed analysis including:
1. Generic name and drug class
2. Primary uses and how it works
3. Pros and cons with evidence levels
4. Side effects categorized by frequency
5. Contraindications and precautions
6. Drug and food interactions
7. Practical guidance for patients

Respond with valid JSON only.<|eot_id|><|start_header_id|>assistant<|end_header_id|>
"""

    def _parse_json_response(self, response: str) -> Dict[str, Any]:
        """Parse JSON response from model output."""
        try:
            # Try to extract JSON from the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            return {"error": "Could not parse response", "raw_response": response}
        except json.JSONDecodeError as e:
            return {
                "error": f"JSON parsing error: {str(e)}",
                "raw_response": response
            }

    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        return {
            "model_path": self.model_path,
            "device": self.device,
            "model_loaded": self.model is not None,
            "tokenizer_loaded": self.tokenizer is not None
        }