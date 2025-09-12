import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from "../constants/config";



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

  const sendSOSAlert = useCallback(async (
    latitude: number,
    longitude: number,
    selected_types: string[],
    emergency_type?: string | string[],
    description?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('auth_token');
      
      const response = await fetch(`${API_BASE_URL}sos/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token || ''}` 
        },
        body: JSON.stringify({
          latitude,
          longitude,
          selected_types,
          emergency_type,
          description,
        })
      });

      const contentType = response.headers.get('content-type') || '';
      const rawText = await response.text();
      let json: any = null;
      try {
        json = contentType.includes('application/json') ? JSON.parse(rawText) : null;
      } catch {}

      if (!response.ok) {
        const msg = json?.message || json?.error || rawText || `HTTP ${response.status}`;
        throw new Error(msg);
      }

      // Map backend payload to SOSResponse shape expected by UI
      const contactsFromCalls = Array.isArray(json?.call_numbers)
        ? json.call_numbers.map((c: any) => ({
            name: c?.name || 'Emergency Contact',
            phone: c?.phone,
            type: c?.type,
          }))
        : [];

      const contactsFromEmails = Array.isArray(json?.emails_sent_to)
        ? json.emails_sent_to.map((email: string) => ({
            name: 'Email Recipient',
            email,
          }))
        : [];

      const mapped: SOSResponse = {
        contacts: [...contactsFromCalls, ...contactsFromEmails],
        message: json?.message,
      };

      setResponseData(mapped);
      return mapped;
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
