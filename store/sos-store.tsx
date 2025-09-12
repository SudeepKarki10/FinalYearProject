import { API_BASE_URL } from "@/constants/config";
import { SOSAlert } from "@/types/sos";


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
    const response = await fetch(`${API_BASE_URL}sos/${id}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      }
    });
    
    const ct = response.headers.get('content-type') || '';
    const rawText = await response.text();
    const raw = ct.includes('application/json') ? JSON.parse(rawText) : rawText;

    if (!response.ok) {
      const msg = typeof raw === 'string' ? raw : (raw?.message || raw?.error || 'Failed to fetch alert details');
      throw new Error(msg);
    }

    let alertData: SOSAlert;
    if (raw && typeof raw === 'object') {
      if ('data' in raw) {
        alertData = (raw as any).data;
      } else {
        // If the response is the direct alert object
        alertData = raw as SOSAlert;
      }
    } else {
      throw new Error('Invalid response format');
    }
    
    return {
      data: alertData,
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

interface FetchSOSListResponse {
  data: SOSAlert[] | null;
  error: string | null;
}

export async function fetchMySOSAlerts(token: string): Promise<FetchSOSListResponse> {
  if (!token) {
    return { data: null, error: 'Authentication required' };
  }

  try {
    const response = await fetch(`${API_BASE_URL}sos/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });

    const ct = response.headers.get('content-type') || '';
    const rawText = await response.text();
    const raw = ct.includes('application/json') ? JSON.parse(rawText) : rawText;

    if (!response.ok) {
      const msg = typeof raw === 'string' ? raw : (raw?.message || raw?.error || 'Failed to fetch SOS alerts');
      throw new Error(msg);
    }

    const data = (raw && typeof raw === 'object' && 'data' in raw) ? (raw as any).data : raw;
    return { data: Array.isArray(data) ? (data as SOSAlert[]) : [], error: null };
  } catch (err) {
    console.error('Error fetching SOS alerts:', err);
    return { data: null, error: err instanceof Error ? err.message : 'Failed to load SOS alerts' };
  }
}
