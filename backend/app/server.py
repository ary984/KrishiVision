from __future__ import annotations
import os
import uuid
import logging
import importlib.util
from pathlib import Path
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename

from .firebase_service import FirebaseService
from .model_service import ModelService

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "heic", "heif"}
logger = logging.getLogger(__name__)
MODULE_PATH = Path(__file__).resolve().parents[2] / "ml-model" / "classifier.py"
_TABULAR_PREDICTOR = None
REQUIRED_TABULAR_FEATURES = {
    "region",
    "crop_type",
    "irrigation_type",
    "fertilizer_type",
    "soil_moisture_%",
    "soil_pH",
    "temperature_C",
    "rainfall_mm",
    "humidity_%",
    "sunlight_hours",
    "pesticide_usage_ml",
    "NDVI_index",
}


def _load_tabular_predictor():
    global _TABULAR_PREDICTOR
    if _TABULAR_PREDICTOR is not None:
        return _TABULAR_PREDICTOR
    spec = importlib.util.spec_from_file_location("crop_classifier", MODULE_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load classifier module at {MODULE_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    if not hasattr(module, "predict_tabular"):
        raise RuntimeError("Classifier module must expose a 'predict_tabular' function")
    _TABULAR_PREDICTOR = module.predict_tabular
    return _TABULAR_PREDICTOR


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app, origins=os.getenv("CORS_ORIGINS", "http://localhost:5173"))

    model_service = ModelService()
    firebase_service = FirebaseService()

    @app.get("/api/health")
    def health():
        return jsonify({
            "status": "ok",
            "firebase": firebase_service.enabled,
        }), 200

    @app.post("/api/predict_tabular")
    def predict_tabular():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict) or not payload:
            return jsonify({"error": "JSON body with tabular features is required"}), 400
        missing = sorted(REQUIRED_TABULAR_FEATURES - set(payload.keys()))
        if missing:
            return jsonify({"error": f"Missing required features: {', '.join(missing)}"}), 400
        try:
            tabular_predict = _load_tabular_predictor()
            prediction = tabular_predict(payload)
        except Exception:
            logger.exception("Tabular model prediction failed")
            return jsonify({"error": "Internal prediction error"}), 500
        return jsonify(prediction), 200

    @app.post("/api/predict")
    def predict():
        if "image" not in request.files:
            return jsonify({"error": "Missing 'image' file"}), 400

        file = request.files["image"]
        filename = secure_filename((file.filename or "").strip())
        if not filename:
            return jsonify({"error": "Image filename is required"}), 400

        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Unsupported file type. Use PNG, JPG, or HEIC."}), 400

        image_bytes = file.read()
        if not image_bytes:
            return jsonify({"error": "Uploaded file is empty"}), 400

        # Run ML prediction
        try:
            prediction = model_service.predict(
                image_bytes=image_bytes, filename=filename
            )
        except NotImplementedError:
            return jsonify({"error": "Model not ready — ML engineer needs to update classifier.py"}), 503
        except Exception:
            logger.exception("Model prediction failed")
            return jsonify({"error": "Internal prediction error"}), 500

        prediction_id = str(uuid.uuid4())

        # Upload image to Storage
        image_url = firebase_service.upload_image(
            image_bytes=image_bytes,
            filename=filename,
            content_type=file.content_type or "image/jpeg",
            prediction_id=prediction_id,
        )

        # Save to Firestore
        persisted = firebase_service.save_prediction(
            prediction_id=prediction_id,
            filename=filename,
            content_type=file.content_type or "",
            size_bytes=len(image_bytes),
            image_url=image_url,
            prediction=prediction,
        )

        if firebase_service.enabled and not persisted:
            logger.warning("Prediction generated but Firestore persistence failed")

        return jsonify({
            **prediction,
            "id": prediction_id,
            "image_url": image_url,
        }), 200

    @app.get("/api/predictions")
    def get_predictions():
        limit = min(int(request.args.get("limit", 20)), 100)
        predictions = firebase_service.get_predictions(limit=limit)
        return jsonify(predictions), 200

    return app


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app = create_app()
    app.run(host="0.0.0.0", port=port)
