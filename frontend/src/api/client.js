export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

function handleFetchError(err) {
  if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('NetworkError') || err.message.includes('Failed'))) {
    throw new Error(
      `Cannot connect to backend server at ${API_BASE_URL}. Please ensure the backend is running (cd backend && python -m app.server).`
    );
  }
  throw err;
}

export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) return { connected: false, error: `Status ${response.status}` };
    const data = await response.json();
    return { connected: true, ...data };
  } catch {
    return { connected: false, error: 'Unreachable' };
  }
}

export async function getPredictions(limit = 20) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/predictions?limit=${limit}`);
  } catch (err) {
    return handleFetchError(err);
  }
  if (!response.ok) throw new Error('Failed to fetch predictions');
  return response.json();
}

export async function predictCropDisease(file) {
  const formData = new FormData();
  formData.append('image', file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      body: formData,
    });
  } catch (err) {
    return handleFetchError(err);
  }

  let data = {};
  const rawBody = await response.text();
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse prediction response as JSON', error);
    }
  }

  if (!response.ok) {
    throw new Error(data.error || 'Prediction request failed');
  }

  return data;
}

export async function predictTabularCropDisease(features) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/predict_tabular`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(features),
    });
  } catch (err) {
    return handleFetchError(err);
  }

  let data = {};
  const rawBody = await response.text();
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch (error) {
      console.error('Failed to parse prediction response as JSON', error);
    }
  }

  if (!response.ok) {
    throw new Error(data.error || 'Prediction request failed');
  }

  return data;
}
