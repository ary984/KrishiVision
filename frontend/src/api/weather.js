/**
 * Weather API client using Open-Meteo (free, no API key required).
 * Provides live weather data and risk advisory correlation with crop predictions.
 */

// Default fallback: New Delhi, India
const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.2090;
const DEFAULT_LOCATION_NAME = 'New Delhi';

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

/**
 * WMO Weather interpretation codes → human-readable label.
 * https://open-meteo.com/en/docs#weathervariables
 */
const WMO_LABELS = {
  0: 'Clear Sky',
  1: 'Mainly Clear',
  2: 'Partly Cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Rime Fog',
  51: 'Light Drizzle',
  53: 'Moderate Drizzle',
  55: 'Dense Drizzle',
  56: 'Freezing Drizzle',
  57: 'Heavy Freezing Drizzle',
  61: 'Light Rain',
  63: 'Moderate Rain',
  65: 'Heavy Rain',
  66: 'Light Freezing Rain',
  67: 'Heavy Freezing Rain',
  71: 'Light Snow',
  73: 'Moderate Snow',
  75: 'Heavy Snow',
  77: 'Snow Grains',
  80: 'Light Showers',
  81: 'Moderate Showers',
  82: 'Violent Showers',
  85: 'Light Snow Showers',
  86: 'Heavy Snow Showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ Hail',
  99: 'Severe Thunderstorm',
};

/**
 * WMO weather code → Material Symbols icon name.
 */
function weatherCodeToIcon(code) {
  if (code === 0 || code === 1) return 'wb_sunny';
  if (code === 2) return 'partly_cloudy_day';
  if (code === 3) return 'cloud';
  if (code === 45 || code === 48) return 'foggy';
  if (code >= 51 && code <= 57) return 'grain';
  if (code >= 61 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'ac_unit';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'weather_snowy';
  if (code >= 95) return 'thunderstorm';
  return 'cloud';
}

/**
 * Try browser geolocation, fall back to default coordinates.
 * Returns { lat, lng, locationName }.
 */
export function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, locationName: DEFAULT_LOCATION_NAME });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          locationName: 'Your Location',
        });
      },
      () => {
        // Denied or error — use default
        resolve({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, locationName: DEFAULT_LOCATION_NAME });
      },
      { timeout: 5000, maximumAge: 300000 }
    );
  });
}

/**
 * Fetch current weather from Open-Meteo.
 * Returns { temperature, humidity, windSpeed, weatherCode, label, icon }.
 */
export async function getWeather(lat, lng) {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m',
    timezone: 'auto',
  });

  const response = await fetch(`${OPEN_METEO_BASE}?${params}`);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();
  const current = data.current;

  const weatherCode = current.weather_code;
  return {
    temperature: Math.round(current.temperature_2m),
    humidity: current.relative_humidity_2m,
    windSpeed: Math.round(current.wind_speed_10m),
    weatherCode,
    label: WMO_LABELS[weatherCode] || 'Unknown',
    icon: weatherCodeToIcon(weatherCode),
  };
}

/**
 * Generate a dynamic risk advisory based on weather conditions
 * and the most recent crop disease predictions.
 */
export function computeRiskAdvisory(weather, recentPredictions = []) {
  // Find the most recent disease detection (non-healthy)
  const recentDisease = recentPredictions.find(
    (p) => p.disease && p.disease.toLowerCase() !== 'healthy'
  );

  const risks = [];

  // High humidity risk
  if (weather.humidity >= 75) {
    risks.push({
      level: 'high',
      message: `High humidity (${weather.humidity}%) creates favorable conditions for fungal diseases.`,
    });
  } else if (weather.humidity >= 60) {
    risks.push({
      level: 'moderate',
      message: `Moderate humidity (${weather.humidity}%) — monitor susceptible crops.`,
    });
  }

  // Temperature extremes
  if (weather.temperature >= 38) {
    risks.push({
      level: 'high',
      message: `Extreme heat (${weather.temperature}°C) may cause heat stress and wilting.`,
    });
  } else if (weather.temperature <= 5) {
    risks.push({
      level: 'high',
      message: `Low temperature (${weather.temperature}°C) — frost risk for sensitive crops.`,
    });
  }

  // Rain/storm risk
  if (weather.weatherCode >= 61 && weather.weatherCode <= 67) {
    risks.push({
      level: 'moderate',
      message: 'Rainfall expected — may accelerate pathogen spread in standing water.',
    });
  } else if (weather.weatherCode >= 80) {
    risks.push({
      level: 'high',
      message: 'Heavy precipitation or storms expected — protect exposed crops.',
    });
  }

  // Build advisory text
  let advisoryText;
  let urgency = 'low';

  if (risks.length === 0) {
    advisoryText = 'Weather conditions are favorable for crop growth. Continue routine monitoring.';
  } else {
    const highRisks = risks.filter((r) => r.level === 'high');
    urgency = highRisks.length > 0 ? 'high' : 'moderate';
    advisoryText = risks.map((r) => r.message).join(' ');
  }

  // Correlate with recent disease detection
  let diseaseName = null;
  if (recentDisease) {
    diseaseName = recentDisease.disease;
    if (urgency !== 'low') {
      advisoryText += ` Recent detection of "${diseaseName}" may be exacerbated by current conditions.`;
    }
  }

  return {
    advisoryText,
    urgency, // 'low' | 'moderate' | 'high'
    diseaseName,
    riskCount: risks.length,
  };
}
