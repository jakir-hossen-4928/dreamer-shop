
import { API_CONFIG } from '@/config/api';

export const checkPhoneFraud = async (phone: string) => {
  try {
    const response = await fetch(`${API_CONFIG.FRAUD_API_URL}?phone=${phone}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.FRAUD_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check phone fraud status');
    }

    return await response.json();
  } catch (error) {
    console.error('BDCourier API Error:', error);
    throw error;
  }
};
