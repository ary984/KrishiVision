# Backend (Flask)

## Run locally

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
# source .venv/bin/activate
pip install -r requirements.txt
python -m app.server
```

Backend serves:
- `GET /api/health`
- `POST /api/predict` (multipart form-data with `image`)

## Firebase backend integration

Backend now supports Firebase Firestore persistence for predictions.

Set service account credentials before running:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/firebase-service-account.json
```

When credentials are configured, each successful `/api/predict` call is stored in the
`predictions` Firestore collection.

## Test

```bash
cd backend
PYTHONPATH=. pytest
```
