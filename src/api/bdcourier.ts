
import { API_CONFIG } from '@/config/api';

export const checkBDFraud = async (phone: string): Promise<any> => {
  const response = await fetch(`${API_CONFIG.FRAUD_API_URL}?phone=${encodeURIComponent(phone)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_CONFIG.FRAUD_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Failed to check fraud status');
  return await response.json();
};
