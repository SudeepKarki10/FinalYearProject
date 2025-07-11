import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';

const Backend_API = "http://192.168.18.4:8000/api/";

export interface SOSResponse {
  contacts: {
    name: string;
    phone?: string;
    email?: string;
    location?: { lat: number; lng: number };
    type?: string;
  }[];
  message?: string;
}

export function useSOSAlert() {
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<SOSResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendSOSAlert = useCallback(async (latitude: number, longitude: number, selected_types: string[]) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await fetch(`${Backend_API}sos-alert/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token || ''}`
        },
        body: JSON.stringify({
          latitude,
          longitude,
          selected_types,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data: SOSResponse = await response.json();
      setResponseData(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Something went wrong';
      setError(errorMessage);
      console.error('SOS Alert Error:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendSOSAlert,
    loading,
    error,
    responseData
  };
}
