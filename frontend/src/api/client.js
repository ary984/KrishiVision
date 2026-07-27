const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

export async function getPredictions(limit = 20) {
  const response = await fetch(`${API_BASE_URL}/api/predictions?limit=${limit}`);
  if (!response.ok) throw new Error('Failed to fetch predictions');
  return response.json();
}

export async function predictCropDisease(file) {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    body: formData,
  });

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
  const response = await fetch(`${API_BASE_URL}/api/predict_tabular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(features),
  });

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
