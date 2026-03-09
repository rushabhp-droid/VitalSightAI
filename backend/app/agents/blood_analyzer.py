"""
Blood Report Analyzer Agent

Analyzes blood test reports and provides detailed health insights
using Claude AI.
"""

from anthropic import Anthropic
from typing import Dict, Any, Optional
import json

from app.core.config import get_settings


class BloodReportAnalyzer:
    """
    AI Agent that analyzes blood test reports and provides
    comprehensive health insights, anomaly detection, and recommendations.
    """

    def __init__(self):
        self.settings = get_settings()
        self.client = Anthropic(api_key=self.settings.anthropic_api_key)
        self.model = "claude-sonnet-4-6-20250514"

    async def analyze(self, extracted_text: str, patient_info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Analyze blood report text and return structured health insights.

        Args:
            extracted_text: OCR-extracted text from blood report
            patient_info: Optional patient demographics (age, gender, etc.)

        Returns:
            Structured analysis with health insights, anomalies, and recommendations
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

    def _build_analysis_prompt(self, text: str, patient_info: Optional[Dict[str, Any]] = None) -> str:
        """Build the analysis prompt for Claude."""
        patient_context = ""
        if patient_info:
            patient_context = f"""
Patient Information:
- Age: {patient_info.get('age', 'Not specified')}
- Gender: {patient_info.get('gender', 'Not specified')}
- Known conditions: {patient_info.get('conditions', 'None specified')}
"""

        return f"""You are a medical AI assistant specializing in blood test analysis. Analyze the following blood test report and provide comprehensive health insights.

{patient_context}

BLOOD TEST REPORT:
```
{text}
```

Provide a detailed analysis in the following JSON format. Be thorough but clear. If a value is not found in the report, indicate "Not available" for that parameter.

IMPORTANT: Always respond with valid JSON only, no additional text before or after.

{{
    "summary": {{
        "report_date": "Date of the report if found",
        "lab_name": "Laboratory name if found",
        "overall_health_status": "Good/Fair/Needs Attention/Critical",
        "summary_text": "2-3 sentence overview of the blood test results"
    }},
    "parameters": [
        {{
            "name": "Parameter name (e.g., Hemoglobin, Glucose Fasting)",
            "value": "The value from the report",
            "unit": "Unit of measurement",
            "reference_range": "Normal range for this parameter",
            "status": "Normal/High/Low/Critical",
            "explanation": "What this parameter measures and why it matters",
            "health_implications": "What abnormal levels could indicate"
        }}
    ],
    "abnormal_findings": [
        {{
            "parameter": "Name of abnormal parameter",
            "status": "High/Low/Critical",
            "value": "The abnormal value",
            "possible_causes": ["List of possible causes"],
            "recommendations": ["Specific recommendations to address this"],
            "related_conditions": ["Related health conditions to be aware of"]
        }}
    ],
    "health_insights": {{
        "strengths": ["What the results show as positive health indicators"],
        "areas_of_concern": ["Areas that need attention or monitoring"],
        "lifestyle_recommendations": [
            {{
                "category": "Diet/Exercise/Sleep/Hydration/Stress Management",
                "recommendation": "Specific actionable advice",
                "reasoning": "Why this is recommended based on the results"
            }}
        ],
        "dietary_suggestions": {{
            "foods_to_include": ["List of beneficial foods"],
            "foods_to_limit": ["Foods to reduce or avoid"],
            "supplements_to_consider": ["Beneficial supplements with reasoning"]
        }}
    }},
    "follow_up": {{
        "tests_to_repeat": ["Tests that should be repeated and when"],
        "specialist_consultations": ["Recommended specialist consultations if any"],
        "monitoring_frequency": "How often to get tested",
        "warning_signs": ["Symptoms to watch for that require immediate medical attention"]
    }},
    "disclaimer": "This analysis is for informational purposes only and should not replace professional medical advice. Always consult with a qualified healthcare provider for proper diagnosis and treatment."
}}"""

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Claude's response into structured data."""
        try:
            # Try to extract JSON from the response
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