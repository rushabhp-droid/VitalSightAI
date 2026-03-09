"""
Prescription Analyzer Agent

Analyzes medical prescriptions and provides detailed information
about medicines including pros, cons, interactions, and recommendations.
"""

from anthropic import Anthropic
from typing import Dict, Any, Optional, List
import json

from app.core.config import get_settings


class PrescriptionAnalyzer:
    """
    AI Agent that analyzes medical prescriptions and provides
    detailed medicine information, pros/cons, and safety recommendations.
    """

    def __init__(self):
        self.settings = get_settings()
        self.client = Anthropic(api_key=self.settings.anthropic_api_key)
        self.model = "claude-sonnet-4-6-20250514"

    async def analyze(self, extracted_text: str, patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze prescription text and return structured medicine analysis.

        Args:
            extracted_text: OCR-extracted text from prescription
            patient_info: Optional patient info for personalized analysis

        Returns:
            Structured analysis with medicine details, pros/cons, and recommendations
        """
        prompt = self._build_analysis_prompt(extracted_text, patient_info)

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        response_text = message.content[0].text
        return self._parse_response(response_text)

    async def analyze_single_medicine(self, medicine_name: str, dosage: Optional[str] = None,
                                       patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze a single medicine in detail.

        Args:
            medicine_name: Name of the medicine
            dosage: Dosage information if available
            patient_info: Optional patient info for personalized analysis

        Returns:
            Detailed medicine analysis
        """
        prompt = self._build_single_medicine_prompt(medicine_name, dosage, patient_info)

        message = self.client.messages.create(
            model=self.model,
            max_tokens=4096,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        response_text = message.content[0].text
        return self._parse_response(response_text)

    def _build_analysis_prompt(self, text: str, patient_info: Optional[Dict[str, Any]] = None) -> str:
        """Build the analysis prompt for prescription analysis."""
        patient_context = ""
        if patient_info:
            patient_context = f"""
Patient Information:
- Age: {patient_info.get('age', 'Not specified')}
- Gender: {patient_info.get('gender', 'Not specified')}
- Known conditions: {patient_info.get('conditions', 'None specified')}
- Current medications: {patient_info.get('current_medications', 'None specified')}
- Allergies: {patient_info.get('allergies', 'None specified')}
"""

        return f"""You are a medical AI assistant specializing in pharmaceutical analysis. Analyze the following medical prescription and provide comprehensive information about each medicine.

{patient_context}

PRESCRIPTION TEXT:
```
{text}
```

Provide a detailed analysis in the following JSON format. Be thorough, accurate, and helpful. If information is not available, indicate "Not available".

IMPORTANT: Always respond with valid JSON only, no additional text before or after.

{{
    "prescription_summary": {{
        "doctor_name": "Doctor's name if found",
        "clinic_name": "Clinic/hospital name if found",
        "date": "Prescription date if found",
        "diagnosis": "Suspected diagnosis based on medicines if evident",
        "total_medicines": "Number of medicines prescribed"
    }},
    "medicines": [
        {{
            "name": "Medicine name (brand and generic if identifiable)",
            "dosage": "Prescribed dosage",
            "frequency": "How often to take",
            "duration": "Duration of treatment if specified",
            "category": "Drug category (e.g., Antibiotic, Painkiller, etc.)",
            "purpose": "What condition this medicine treats",
            "how_it_works": "Brief explanation of mechanism of action",
            "pros": [
                {{
                    "benefit": "Specific benefit",
                    "explanation": "Why this is beneficial"
                }}
            ],
            "cons": [
                {{
                    "risk": "Specific risk or side effect",
                    "severity": "Common/Rare/Serious",
                    "mitigation": "How to minimize this risk"
                }}
            ],
            "common_side_effects": ["List of common side effects"],
            "serious_side_effects": ["List of serious side effects requiring medical attention"],
            "precautions": ["Important precautions while taking this medicine"],
            "food_interactions": {{
                "foods_to_avoid": ["Foods that interact negatively"],
                "best_time_to_take": "When to take this medicine relative to meals",
                "notes": "Additional dietary notes"
            }},
            "drug_interactions": ["Potential interactions with other common drugs"],
            "storage": "How to store this medicine",
            "missed_dose": "What to do if a dose is missed",
            "effectiveness_timeline": "When to expect improvement",
            "patient_rating": {{
                "effectiveness": "Rating out of 5 based on typical patient feedback",
                "side_effects_level": "Low/Medium/High",
                "ease_of_use": "Rating out of 5"
            }}
        }}
    ],
    "overall_assessment": {{
        "treatment_appropriateness": "Assessment of whether the prescription is appropriate for common conditions",
        "medicine_combination_safety": "Assessment of safety of taking these medicines together",
        "potential_interactions": [
            {{
                "medicines": ["Medicine names that interact"],
                "interaction": "Description of the interaction",
                "severity": "Minor/Moderate/Major",
                "recommendation": "What to do about it"
            }}
        ],
        "suggestions": [
            {{
                "suggestion": "Specific suggestion about the prescription",
                "reason": "Why this suggestion is made",
                "importance": "High/Medium/Low"
            }}
        ]
    }},
    "recommendations": {{
        "general_advice": ["General advice for the patient"],
        "lifestyle_modifications": ["Lifestyle changes that may help the condition"],
        "monitoring": ["What symptoms to monitor while on these medications"],
        "follow_up": "When to follow up with the doctor"
    }},
    "red_flags": {{
        "immediate_medical_attention": ["Symptoms requiring immediate medical attention"],
        "when_to_stop_medicine": ["Signs indicating you should stop and consult doctor"]
    }},
    "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with your doctor or pharmacist before making any changes to your medication."
}}"""

    def _build_single_medicine_prompt(self, medicine_name: str, dosage: Optional[str],
                                       patient_info: Optional[Dict[str, Any]] = None) -> str:
        """Build prompt for single medicine analysis."""
        patient_context = ""
        if patient_info:
            patient_context = f"""

Patient Information:
- Age: {patient_info.get('age', 'Not specified')}
- Gender: {patient_info.get('gender', 'Not specified')}
- Known conditions: {patient_info.get('conditions', 'None specified')}
- Current medications: {patient_info.get('current_medications', 'None specified')}
- Allergies: {patient_info.get('allergies', 'None specified')}"""

        dosage_text = f"\nDosage: {dosage}" if dosage else ""

        return f"""You are a medical AI assistant specializing in pharmaceutical analysis. Provide comprehensive information about the following medicine.

Medicine: {medicine_name}{dosage_text}{patient_context}

Provide detailed analysis in JSON format:

{{
    "medicine": {{
        "name": "Full medicine name (brand and generic)",
        "generic_name": "Generic/chemical name",
        "brand_names": ["Common brand names"],
        "drug_class": "Drug category/class",
        "controlled_substance": "Yes/No and schedule if applicable"
    }},
    "overview": {{
        "primary_uses": ["What conditions this medicine is primarily used for"],
        "how_it_works": "Detailed mechanism of action",
        "typical_dosage": "Standard dosage ranges",
        "forms_available": ["Available forms - tablet, capsule, injection, etc."]
    }},
    "benefits_and_drawbacks": {{
        "pros": [
            {{
                "benefit": "Specific benefit",
                "explanation": "Why this is beneficial",
                "evidence": "Quality of evidence (Strong/Moderate/Limited)"
            }}
        ],
        "cons": [
            {{
                "risk": "Specific risk or drawback",
                "severity": "Common/Rare/Serious",
                "likelihood": "Percentage or description of likelihood",
                "mitigation": "How to minimize this risk"
            }}
        ]
    }},
    "side_effects": {{
        "common": ["Side effects affecting >1% of patients"],
        "uncommon": ["Side effects affecting 0.1-1% of patients"],
        "rare_but_serious": ["Serious side effects requiring immediate attention"]
    }},
    "safety_information": {{
        "contraindications": ["Who should NOT take this medicine"],
        "precautions": ["Important precautions"],
        "pregnancy_category": "Safety during pregnancy",
        "breastfeeding": "Safety during breastfeeding",
        "age_restrictions": "Age-related precautions"
    }},
    "interactions": {{
        "drug_interactions": [
            {{
                "drug": "Interacting drug name",
                "effect": "What happens",
                "severity": "Minor/Moderate/Major",
                "action": "What to do"
            }}
        ],
        "food_interactions": ["Foods to avoid or be cautious with"],
        "alcohol": "Alcohol interaction information",
        "supplement_interactions": ["Supplements that may interact"]
    }},
    "practical_guidance": {{
        "best_time_to_take": "Optimal timing",
        "with_or_without_food": "Food recommendations",
        "storage": "Storage requirements",
        "missed_dose": "What to do if dose is missed",
        "stopping": "How to safely stop taking this medicine"
    }},
    "patient_reviews_summary": {{
        "average_rating": "Typical rating out of 10",
        "common_positive_feedback": ["What patients commonly praise"],
        "common_complaints": ["Common patient concerns"],
        "satisfaction_rate": "Typical satisfaction percentage"
    }},
    "cost_and_availability": {{
        "generic_available": "Yes/No",
        "average_cost_range": "Typical cost range",
        "insurance_coverage": "Typical insurance coverage"
    }},
    "doctor_recommendation": {{
        "when_to_consider": "When this medicine is typically prescribed",
        "alternatives": ["Common alternative treatments"],
        "questions_to_ask_doctor": ["Important questions to discuss with healthcare provider"]
    }},
    "disclaimer": "This information is for educational purposes only and should not replace professional medical advice."
}}"""

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Claude's response into structured data."""
        try:
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            return {"error": "Could not parse response", "raw_response": response_text}
        except json.JSONDecodeError as e:
            return {
                "error": f"JSON parsing error: {str(e)}",
                "raw_response": response_text
            }