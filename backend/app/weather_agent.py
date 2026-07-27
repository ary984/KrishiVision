from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

import requests
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

logger = logging.getLogger(__name__)

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
REQUEST_TIMEOUT = 10

DEFAULT_WEATHER: Dict[str, Any] = {
    "temperature_c": 30.0,
    "humidity_pct": 60.0,
    "precipitation_mm": 0.0,
}

SYSTEM_PROMPT = """\
You are an expert agricultural advisor for Indian farmers.
Given a crop disease classification and current local weather data,
return STRICTLY a JSON object with exactly these fields and no other text:

{
  "urgency_level": "low" | "medium" | "high",
  "plain_language_advice": "2-3 sentences, simple language, no jargon",
  "treatment_steps": ["step1", "step2", ...]
}

Rules:
- urgency_level MUST be exactly one of: low, medium, high
- treatment_steps should list organic / low-chemical options FIRST.
  Chemical intervention is ONLY included when urgency_level is "high".
- Return ONLY the raw JSON object. No markdown fences, no explanation.
"""


def _geocode_location(location: str) -> Optional[Tuple[float, float]]:
    try:
        resp = requests.get(
            "https://geocoding-api.open-meteo.com/v1/search",
            params={"name": location, "count": 1, "language": "en"},
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        results = resp.json().get("results")
        if results and len(results) > 0:
            return results[0]["latitude"], results[0]["longitude"]
    except Exception:
        logger.exception("Geocoding failed for location: %s", location)
    return None


def fetch_weather(lat: float, lon: float) -> Dict[str, Any]:
    try:
        resp = requests.get(
            OPEN_METEO_URL,
            params={
                "latitude": lat,
                "longitude": lon,
                "current_weather": True,
                "hourly": "relative_humidity_2m,precipitation",
                "forecast_days": 1,
            },
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json()

        current = data.get("current_weather", {})
        hourly = data.get("hourly", {})

        humidity_values = hourly.get("relative_humidity_2m", [])
        precipitation_values = hourly.get("precipitation", [])

        idx = 0
        if humidity_values:
            idx = min(idx, len(humidity_values) - 1)

        return {
            "temperature_c": current.get("temperature", DEFAULT_WEATHER["temperature_c"]),
            "humidity_pct": humidity_values[idx] if humidity_values else DEFAULT_WEATHER["humidity_pct"],
            "precipitation_mm": precipitation_values[idx] if precipitation_values else DEFAULT_WEATHER["precipitation_mm"],
        }
    except Exception:
        logger.exception("Weather fetch failed for (%s, %s). Using defaults.", lat, lon)
        return dict(DEFAULT_WEATHER)


def _resolve_location(location: str) -> Tuple[float, float]:
    coords = _geocode_location(location)
    if coords:
        return coords
    logger.warning("Could not geocode '%s', falling back to New Delhi.", location)
    return 28.6139, 77.2090


def _parse_llm_json(raw: str) -> Dict[str, Any]:
    text = raw.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    text = text.strip()

    parsed = json.loads(text)

    required_keys = {"urgency_level", "plain_language_advice", "treatment_steps"}
    if not required_keys.issubset(parsed.keys()):
        missing = required_keys - set(parsed.keys())
        raise ValueError(f"LLM response missing required fields: {missing}")

    if parsed["urgency_level"] not in ("low", "medium", "high"):
        raise ValueError(f"Invalid urgency_level: {parsed['urgency_level']}")

    if not isinstance(parsed["treatment_steps"], list):
        raise ValueError("treatment_steps must be a list")

    return parsed


def get_weather_advice(
    disease: str,
    confidence: float,
    location: str,
) -> Dict[str, Any]:
    lat, lon = _resolve_location(location)
    weather = fetch_weather(lat, lon)

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.warning("GROQ_API_KEY not set. Returning weather-only response.")
        return {
            "urgency_level": "medium",
            "plain_language_advice": (
                f"Weather at {location}: {weather['temperature_c']}\u00b0C, "
                f"{weather['humidity_pct']}% humidity. "
                f"Consult a local agricultural expert for specific advice on {disease}."
            ),
            "treatment_steps": [
                "Consult your local Krishi Vigyan Kendra (KVK) for diagnosis-specific treatment.",
                "Monitor crop closely over the next 24-48 hours.",
            ],
        }

    user_prompt = (
        f"Disease classification:\n"
        f'  Disease: "{disease}"\n'
        f"  Confidence: {confidence:.0%}\n\n"
        f"Current weather at {location} ({lat:.2f}, {lon:.2f}):\n"
        f"  Temperature: {weather['temperature_c']}\u00b0C\n"
        f"  Humidity: {weather['humidity_pct']}%\n"
        f"  Precipitation: {weather['precipitation_mm']} mm\n\n"
        f"Return ONLY the JSON object as specified."
    )

    llm = ChatGroq(
        model="openai/gpt-oss-120b",
        temperature=0.3,
        api_key=api_key,
    )

    response = llm.invoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=user_prompt),
    ])
    raw_text = response.content if hasattr(response, "content") else str(response)

    try:
        return _parse_llm_json(raw_text)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Failed to parse LLM response: %s\nRaw output:\n%s", exc, raw_text)
        raise RuntimeError(f"LLM returned unparseable response: {exc}") from exc


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    mock_disease = "Early Blight"
    mock_confidence = 0.87
    mock_location = "New Delhi"

    print("=== Weather Agent Test ===")
    print(f"Disease: {mock_disease} ({mock_confidence:.0%})")
    print(f"Location: {mock_location}\n")

    result = get_weather_advice(
        disease=mock_disease,
        confidence=mock_confidence,
        location=mock_location,
    )

    print("Response:")
    print(json.dumps(result, indent=2))
