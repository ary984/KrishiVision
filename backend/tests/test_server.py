from io import BytesIO

from app.server import create_app


def test_health_endpoint() -> None:
    app = create_app()
    client = app.test_client()

    response = client.get("/api/health")

    assert response.status_code == 200
    payload = response.get_json()
    assert payload["status"] == "ok"
    assert "firebase" in payload


def test_predict_success() -> None:
    app = create_app()
    client = app.test_client()

    response = client.post(
        "/api/predict",
        data={"image": (BytesIO(b"sample-image"), "leaf.jpg")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert "disease" in payload
    assert "confidence" in payload
    assert "recommendation" in payload


def test_predict_rejects_invalid_extension() -> None:
    app = create_app()
    client = app.test_client()

    response = client.post(
        "/api/predict",
        data={"image": (BytesIO(b"sample-image"), "leaf.gif")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    assert "Unsupported file type" in response.get_json()["error"]


def test_predict_accepts_heic_extension() -> None:
    app = create_app()
    client = app.test_client()

    response = client.post(
        "/api/predict",
        data={"image": (BytesIO(b"sample-image"), "leaf.heic")},
        content_type="multipart/form-data",
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert "disease" in payload
    assert "confidence" in payload
    assert "recommendation" in payload


def test_predict_tabular_success() -> None:
    app = create_app()
    client = app.test_client()

    response = client.post(
        "/api/predict_tabular",
        json={
            "region": "North India",
            "crop_type": "Wheat",
            "irrigation_type": "None",
            "fertilizer_type": "Organic",
            "soil_moisture_%": 35.95,
            "soil_pH": 5.99,
            "temperature_C": 17.79,
            "rainfall_mm": 75.62,
            "humidity_%": 77.03,
            "sunlight_hours": 7.27,
            "pesticide_usage_ml": 6.34,
            "NDVI_index": 0.63,
        },
    )

    assert response.status_code == 200
    payload = response.get_json()
    assert "disease" in payload
    assert "confidence" in payload
    assert "recommendation" in payload


def test_predict_tabular_rejects_missing_features() -> None:
    app = create_app()
    client = app.test_client()

    response = client.post(
        "/api/predict_tabular",
        json={
            "region": "North India",
            "crop_type": "Wheat",
        },
    )

    assert response.status_code == 400
    assert "Missing required features" in response.get_json()["error"]
