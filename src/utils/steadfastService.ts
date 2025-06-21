
import { API_CONFIG } from '@/config/api';
import { SteadfastOrder, SteadfastResponse } from '@/types';

export const createSteadfastOrder = async (order: SteadfastOrder): Promise<string> => {
  try {
    const response = await fetch(`${API_CONFIG.STEADFAST_API_URL}/create_order`, {
      method: 'POST',
      headers: {
        'Api-Key': API_CONFIG.STEADFAST_API_KEY,
        'Secret-Key': API_CONFIG.STEADFAST_SECRET_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SteadfastResponse = await response.json();

    if (data.status !== 200) {
      throw new Error(data.message || 'Failed to create Steadfast order');
    }

    return data.consignment.tracking_code;
  } catch (error) {
    console.error('Steadfast API error:', error);
    throw new Error(`Failed to create Steadfast order: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const createBulkSteadfastOrders = async (orders: SteadfastOrder[]): Promise<{
  success: { order: SteadfastOrder; trackingId: string }[];
  errors: { order: SteadfastOrder; error: string }[];
}> => {
  const success: { order: SteadfastOrder; trackingId: string }[] = [];
  const errors: { order: SteadfastOrder; error: string }[] = [];

  for (const order of orders) {
    try {
      const trackingId = await createSteadfastOrder(order);
      success.push({ order, trackingId });
    } catch (error) {
      errors.push({ 
        order, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return { success, errors };
};
