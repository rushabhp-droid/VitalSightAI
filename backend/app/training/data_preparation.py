"""
Training data preparation utilities.

Helps create and format training data for model fine-tuning.
"""

import json
from pathlib import Path
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class TrainingDataPreparer:
    """Prepare training data for model fine-tuning."""

    def __init__(self, output_dir: str = "./training_data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def add_blood_report_example(
        self,
        report_text: str,
        analysis: Dict[str, Any],
        output_file: str = "blood_analysis_train.jsonl"
    ):
        """
        Add a blood report analysis example.

        Args:
            report_text: Raw text from blood report
            analysis: Structured analysis output
            output_file: File to append example to
        """
        example = {
            "input": report_text,
            "output": json.dumps(analysis, indent=2)
        }

        self._append_example(example, output_file)

    def add_prescription_example(
        self,
        prescription_text: str,
        analysis: Dict[str, Any],
        output_file: str = "prescription_analysis_train.jsonl"
    ):
        """
        Add a prescription analysis example.

        Args:
            prescription_text: Raw text from prescription
            analysis: Structured analysis output
            output_file: File to append example to
        """
        example = {
            "input": prescription_text,
            "output": json.dumps(analysis, indent=2)
        }

        self._append_example(example, output_file)

    def add_medicine_example(
        self,
        medicine_name: str,
        dosage: str,
        analysis: Dict[str, Any],
        output_file: str = "medicine_analysis_train.jsonl"
    ):
        """
        Add a single medicine analysis example.

        Args:
            medicine_name: Name of the medicine
            dosage: Dosage information
            analysis: Structured analysis output
            output_file: File to append example to
        """
        example = {
            "medicine_name": medicine_name,
            "dosage": dosage,
            "output": json.dumps(analysis, indent=2)
        }

        self._append_example(example, output_file)

    def _append_example(self, example: Dict, output_file: str):
        """Append example to JSONL file."""
        file_path = self.output_dir / output_file
        with open(file_path, 'a') as f:
            f.write(json.dumps(example) + '\n')

        logger.info(f"Added example to {output_file}")

    def create_sample_training_data(self):
        """Create sample training data for demonstration."""
        # Sample blood report analysis
        blood_example = {
            "input": """
COMPLETE BLOOD COUNT (CBC)
Test Name          Result    Unit      Reference Range
Hemoglobin         14.5      g/dL      13.0-17.5
WBC Count          8.5       x10^3/uL  4.5-11.0
RBC Count          5.2       million/uL 4.5-5.5
Platelet Count     250       x10^3/uL  150-400
Hematocrit         44        %         38-50
MCV                88        fL        80-100
MCH                28        pg        27-33
MCHC               32        g/dL      32-36

LIPID PROFILE
Total Cholesterol  210       mg/dL     <200
HDL Cholesterol    45        mg/dL     40-60
LDL Cholesterol    135       mg/dL     <100
Triglycerides      180       mg/dL     <150
VLDL Cholesterol   36        mg/dL      5-40

FASTING GLUCOSE
Blood Glucose      110       mg/dL     70-100
HbA1c             6.2       %         <6.0
""",
            "output": json.dumps({
                "summary": {
                    "overall_health_status": "Needs Attention",
                    "summary_text": "Blood work shows elevated cholesterol, triglycerides, and slightly elevated fasting glucose. These findings suggest metabolic syndrome risk factors that should be addressed through lifestyle modifications."
                },
                "parameters": [
                    {
                        "name": "Total Cholesterol",
                        "value": "210",
                        "unit": "mg/dL",
                        "status": "High",
                        "explanation": "Total cholesterol measures all cholesterol in your blood"
                    },
                    {
                        "name": "LDL Cholesterol",
                        "value": "135",
                        "unit": "mg/dL",
                        "status": "High",
                        "explanation": "LDL is 'bad' cholesterol that can build up in arteries"
                    }
                ]
            }, indent=2)
        }

        self._append_example(blood_example, "blood_analysis_train.jsonl")
        logger.info("Created sample training data")


def main():
    """Create sample training data."""
    preparer = TrainingDataPreparer()
    preparer.create_sample_training_data()
    print("Sample training data created in ./training_data/")


if __name__ == "__main__":
    main()