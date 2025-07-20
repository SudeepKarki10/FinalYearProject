import { SOSAlert } from "@/types/sos";

const API_BASE_URL = "http://192.168.18.4:8000/api/";

interface FetchSOSAlertResponse {
  data: SOSAlert | null;
  error: string | null;
}

export async function fetchSOSAlertDetails(id: string, token: string): Promise<FetchSOSAlertResponse> {
  if (!token) {
    return {
      data: null,
      error: 'Authentication required'
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}sos-alerts/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch alert details');
    }

    const data = await response.json();
    return {
      data,
      error: null
    };
  } catch (err) {
    console.error('Error fetching alert:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to load alert details'
    };
  }
}
