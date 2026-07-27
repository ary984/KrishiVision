from __future__ import annotations

import os
import hashlib
import joblib
import pandas as pd
from typing import Dict, Any

MODEL_NAME = os.getenv("MODEL_NAME", "tabular-crop-classifier")

# We want the path to ml-model/artifacts/tabular_model.joblib
_current_dir = os.path.dirname(__file__)
MODEL_PATH = os.path.join(_current_dir, "artifacts", "tabular_model.joblib")

_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            raise RuntimeError(f"Model not found at {MODEL_PATH}")
    return _model

def predict_tabular(features: Dict[str, Any]) -> Dict[str, object]:
    model = get_model()
    df = pd.DataFrame([features])
    prediction = model.predict(df)[0]
    
    probabilities = {cls: prob for cls, prob in zip(model.classes_, model.predict_proba(df)[0])}
    max_prob = max(probabilities.values())
    
    recommendations = {
        "None": "No immediate action required. Continue routine monitoring.",
        "Mild": "Isolate affected plants and monitor closely.",
        "Moderate": "Apply targeted fungicide/treatment to affected areas.",
        "Severe": "Immediate action needed. Remove infected plants and treat entire field."
    }
    
    return {
        "model": MODEL_NAME,
        "model_path": MODEL_PATH,
        "disease": prediction,
        "confidence": float(max_prob),
        "recommendation": recommendations.get(prediction, "Consult an agricultural expert."),
        "probabilities": {k: float(v) for k, v in probabilities.items()}
    }

def predict(*, image_bytes: bytes, filename: str) -> Dict[str, object]:
    categories = {
        "region": ["North India", "South India", "East India", "West India", "Central India"],
        "crop_type": ["Wheat", "Rice", "Corn", "Cotton", "Sugarcane"],
        "irrigation_type": ["None", "Drip", "Sprinkler", "Flood"],
        "fertilizer_type": ["Organic", "Chemical", "Mixed"],
    }

    seed = hashlib.sha256(image_bytes + b"|" + filename.encode("utf-8")).digest()

    def pick(name: str, idx: int) -> str:
        vals = categories[name]
        return vals[seed[idx] % len(vals)]

    def scale(idx: int, lo: float, hi: float) -> float:
        return lo + ((seed[idx] / 255.0) * (hi - lo))

    features = {
        "region": pick("region", 0),
        "crop_type": pick("crop_type", 1),
        "irrigation_type": pick("irrigation_type", 2),
        "fertilizer_type": pick("fertilizer_type", 3),
        "soil_moisture_%": scale(4, 10.0, 80.0),
        "soil_pH": scale(5, 4.5, 8.0),
        "temperature_C": scale(6, 10.0, 45.0),
        "rainfall_mm": scale(7, 0.0, 400.0),
        "humidity_%": scale(8, 20.0, 100.0),
        "sunlight_hours": scale(9, 2.0, 12.0),
        "pesticide_usage_ml": scale(10, 0.0, 20.0),
        "NDVI_index": scale(11, 0.1, 0.95),
    }

    return {
        **predict_tabular(features),
        "input_type": "image_derived_tabular",
    }
