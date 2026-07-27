from __future__ import annotations
import importlib.util
from pathlib import Path
from typing import Any, Dict, Callable

MODULE_PATH = Path(__file__).resolve().parents[2] / "ml-model" / "classifier.py"

class ModelService:
    def __init__(self) -> None:
        self._predictor = self._load_predictor()

    def _load_predictor(self) -> Callable[..., Dict[str, Any]]:
        spec = importlib.util.spec_from_file_location("crop_classifier", MODULE_PATH)
        if spec is None or spec.loader is None:
            raise RuntimeError(f"Unable to load classifier module at {MODULE_PATH}")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        if not hasattr(module, "predict"):
            raise RuntimeError("Classifier module must expose a 'predict' function")
        return module.predict

    def predict(self, *, image_bytes: bytes, filename: str) -> Dict[str, Any]:
        return self._predictor(image_bytes=image_bytes, filename=filename)
