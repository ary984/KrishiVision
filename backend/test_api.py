import requests
import json

data = {
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
    "NDVI_index": 0.63
}

try:
    response = requests.post("http://localhost:5000/api/predict_tabular", json=data)
    print("STATUS:", response.status_code)
    print("RESPONSE:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("FAILED:", str(e))
