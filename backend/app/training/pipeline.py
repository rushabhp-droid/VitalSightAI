"""
Model Training Pipeline for VitalSightAI

Fine-tunes language models for medical analysis tasks.
"""

import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling
)
from typing import List, Dict, Any, Optional
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class MedicalAnalysisDataset(Dataset):
    """Dataset for medical analysis training."""

    def __init__(
        self,
        data_path: str,
        tokenizer: Any,
        max_length: int = 2048,
        task_type: str = "blood_analysis"
    ):
        """
        Initialize dataset.

        Args:
            data_path: Path to JSONL training data
            tokenizer: Tokenizer to use
            max_length: Maximum sequence length
            task_type: Type of analysis task
        """
        self.tokenizer = tokenizer
        self.max_length = max_length
        self.task_type = task_type

        # Load data
        self.data = []
        with open(data_path, 'r') as f:
            for line in f:
                if line.strip():
                    self.data.append(json.loads(line))

        logger.info(f"Loaded {len(self.data)} training examples")

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        example = self.data[idx]

        # Format based on task type
        if self.task_type == "blood_analysis":
            prompt = self._format_blood_analysis(example)
        elif self.task_type == "prescription_analysis":
            prompt = self._format_prescription_analysis(example)
        elif self.task_type == "medicine_analysis":
            prompt = self._format_medicine_analysis(example)
        else:
            prompt = self._format_general(example)

        # Tokenize
        encoding = self.tokenizer(
            prompt,
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
            return_tensors="pt"
        )

        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "labels": encoding["input_ids"].flatten()
        }

    def _format_blood_analysis(self, example: Dict) -> str:
        """Format blood analysis example."""
        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a medical AI assistant specializing in blood test analysis. Analyze blood test reports and provide comprehensive health insights in JSON format.

<|eot_id|><|start_header_id|>user<|end_header_id|>
Blood Test Report:
```
{example['input']}
```

Analyze this blood test report and provide detailed insights in JSON format.<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{example['output']}<|eot_id|>"""

    def _format_prescription_analysis(self, example: Dict) -> str:
        """Format prescription analysis example."""
        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a medical AI assistant specializing in pharmaceutical analysis. Analyze prescriptions and provide detailed medicine information in JSON format.

<|eot_id|><|start_header_id|>user<|end_header_id|>
Prescription:
```
{example['input']}
```

Analyze this prescription and provide detailed medicine analysis in JSON format.<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{example['output']}<|eot_id|>"""

    def _format_medicine_analysis(self, example: Dict) -> str:
        """Format medicine analysis example."""
        return f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a medical AI assistant specializing in pharmaceutical analysis. Provide detailed medicine information in JSON format.

<|eot_id|><|start_header_id|>user<|end_header_id|>
Medicine: {example['medicine_name']}
Dosage: {example.get('dosage', 'Not specified')}

Provide comprehensive analysis of this medicine in JSON format.<|eot_id|><|start_header_id|>assistant<|end_header_id|>
{example['output']}<|eot_id|>"""

    def _format_general(self, example: Dict) -> str:
        """Format general example."""
        return f"<|begin_of_text|>User: {example['input']}\n\nAssistant: {example['output']}<|eot_id|>"


class ModelTrainer:
    """Trainer for fine-tuning medical analysis models."""

    def __init__(
        self,
        base_model: str = "meta-llama/Llama-3.2-3B-Instruct",
        output_dir: str = "./models/vitalsight-medical-v1"
    ):
        """
        Initialize trainer.

        Args:
            base_model: Base model to fine-tune
            output_dir: Directory to save the fine-tuned model
        """
        self.base_model = base_model
        self.output_dir = Path(output_dir)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        logger.info(f"Using device: {self.device}")
        logger.info(f"Base model: {base_model}")
        logger.info(f"Output directory: {output_dir}")

    def load_base_model(self):
        """Load the base model and tokenizer."""
        logger.info("Loading base model...")

        self.tokenizer = AutoTokenizer.from_pretrained(self.base_model)
        self.model = AutoModelForCausalLM.from_pretrained(
            self.base_model,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
            device_map="auto" if self.device == "cuda" else None
        )

        # Set padding token if not set
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        logger.info("Base model loaded successfully")

    def prepare_datasets(
        self,
        train_data_path: str,
        val_data_path: Optional[str] = None,
        task_type: str = "blood_analysis"
    ):
        """Prepare training and validation datasets."""
        logger.info("Preparing datasets...")

        self.train_dataset = MedicalAnalysisDataset(
            train_data_path,
            self.tokenizer,
            task_type=task_type
        )

        if val_data_path:
            self.val_dataset = MedicalAnalysisDataset(
                val_data_path,
                self.tokenizer,
                task_type=task_type
            )
        else:
            self.val_dataset = None

        logger.info("Datasets prepared")

    def train(
        self,
        num_train_epochs: int = 3,
        per_device_train_batch_size: int = 4,
        learning_rate: float = 2e-5,
        warmup_steps: int = 100,
        save_steps: int = 500,
        eval_steps: int = 500
    ):
        """Train the model."""
        logger.info("Starting training...")

        # Training arguments
        training_args = TrainingArguments(
            output_dir=str(self.output_dir),
            num_train_epochs=num_train_epochs,
            per_device_train_batch_size=per_device_train_batch_size,
            per_device_eval_batch_size=per_device_train_batch_size,
            learning_rate=learning_rate,
            warmup_steps=warmup_steps,
            save_steps=save_steps,
            eval_steps=eval_steps,
            save_total_limit=3,
            logging_steps=50,
            evaluation_strategy="steps" if self.val_dataset else "no",
            fp16=self.device == "cuda",
            gradient_accumulation_steps=4,
            load_best_model_at_end=True if self.val_dataset else False,
            metric_for_best_model="eval_loss" if self.val_dataset else None,
        )

        # Data collator
        data_collator = DataCollatorForLanguageModeling(
            tokenizer=self.tokenizer,
            mlm=False
        )

        # Trainer
        trainer = Trainer(
            model=self.model,
            args=training_args,
            train_dataset=self.train_dataset,
            eval_dataset=self.val_dataset,
            data_collator=data_collator,
        )

        # Train
        trainer.train()

        logger.info("Training completed")

    def save_model(self):
        """Save the fine-tuned model."""
        logger.info(f"Saving model to {self.output_dir}")

        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.model.save_pretrained(str(self.output_dir))
        self.tokenizer.save_pretrained(str(self.output_dir))

        logger.info("Model saved successfully")

    def push_to_hub(self, repo_name: str, token: str):
        """Push model to HuggingFace Hub."""
        logger.info(f"Pushing model to Hub: {repo_name}")

        self.model.push_to_hub(repo_name, token=token)
        self.tokenizer.push_to_hub(repo_name, token=token)

        logger.info("Model pushed to Hub successfully")


def main():
    """Main training function."""
    import argparse

    parser = argparse.ArgumentParser(description="Train VitalSightAI model")
    parser.add_argument("--base_model", type=str, default="meta-llama/Llama-3.2-3B-Instruct",
                        help="Base model to fine-tune")
    parser.add_argument("--train_data", type=str, required=True,
                        help="Path to training data (JSONL)")
    parser.add_argument("--val_data", type=str, default=None,
                        help="Path to validation data (JSONL)")
    parser.add_argument("--output_dir", type=str, default="./models/vitalsight-medical-v1",
                        help="Output directory for fine-tuned model")
    parser.add_argument("--epochs", type=int, default=3,
                        help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=4,
                        help="Batch size per device")
    parser.add_argument("--learning_rate", type=float, default=2e-5,
                        help="Learning rate")
    parser.add_argument("--task_type", type=str, default="blood_analysis",
                        choices=["blood_analysis", "prescription_analysis", "medicine_analysis"],
                        help="Type of analysis task")
    parser.add_argument("--push_to_hub", type=str, default=None,
                        help="HuggingFace repo name to push model")
    parser.add_argument("--hf_token", type=str, default=None,
                        help="HuggingFace API token")

    args = parser.parse_args()

    # Initialize trainer
    trainer = ModelTrainer(
        base_model=args.base_model,
        output_dir=args.output_dir
    )

    # Load model
    trainer.load_base_model()

    # Prepare datasets
    trainer.prepare_datasets(
        train_data_path=args.train_data,
        val_data_path=args.val_data,
        task_type=args.task_type
    )

    # Train
    trainer.train(
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        learning_rate=args.learning_rate
    )

    # Save
    trainer.save_model()

    # Push to hub if specified
    if args.push_to_hub and args.hf_token:
        trainer.push_to_hub(args.push_to_hub, args.hf_token)

    logger.info("Training pipeline completed!")


if __name__ == "__main__":
    main()