# KrishiVision Architecture

## Workflow

Frontend (React) → API Layer (Fetch) → Backend (Flask) → ML Model (Crop Disease Classifier)

## Service boundaries

- **Frontend (`/frontend`)**
  - Handles image selection, preview, and result rendering.
  - Uses `src/api/client.js` as the single API layer for backend communication.
- **Backend (`/backend`)**
  - Exposes HTTP API endpoints (`/api/health`, `/api/predict`, `/api/predict_tabular`).
  - Validates uploads and invokes the ML classifier.
- **ML Model (`/ml-model`)**
  - Contains prediction logic in `classifier.py`.
  - Is only called by backend code.

## API contract

`POST /api/predict`

- Request: `multipart/form-data`
  - `image`: JPG/PNG file
- Success response (200):
  - `model` (string)
  - `model_path` (string)
  - `disease` (string)
  - `confidence` (number between 0 and 1)
  - `recommendation` (string)
- Error response (400):
  - `error` (string)

`POST /api/predict_tabular`

- Request: `application/json`
  - Required feature keys:
    - `region`, `crop_type`, `irrigation_type`, `fertilizer_type`
    - `soil_moisture_%`, `soil_pH`, `temperature_C`, `rainfall_mm`
    - `humidity_%`, `sunlight_hours`, `pesticide_usage_ml`, `NDVI_index`
- Success response (200):
  - `model` (string)
  - `model_path` (string)
  - `disease` (string)
  - `confidence` (number between 0 and 1)
  - `recommendation` (string)
