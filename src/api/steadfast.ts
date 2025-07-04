import { API_CONFIG } from '@/config/api';

export interface SteadfastOrderRequest {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
  alternative_phone?: string;
  recipient_email?: string;
  total_lot?: number;
  delivery_type?: number;
}

export interface SteadfastOrderResult {
  consignment_id: number;
  invoice: string;
  tracking_code: string;
  status: string;
  note?: string;
  message?: string;
}

export interface SteadfastStatusResponse {
  status: number;
  delivery_status: string;
}

export interface SteadfastBalanceResponse {
  status: number;
  current_balance: number;
}

// Helper to check config presence
const validateSteadfastConfig = () => (
  !!(API_CONFIG.STEADFAST_API_URL && API_CONFIG.STEADFAST_API_KEY && API_CONFIG.STEADFAST_SECRET_KEY)
);

const HEADERS = {
  'Api-Key': API_CONFIG.STEADFAST_API_KEY,
  'Secret-Key': API_CONFIG.STEADFAST_SECRET_KEY,
  'Content-Type': 'application/json',
};

/**
 * Send a single order to Steadfast
 */
export const createSteadfastOrder = async (
  order: SteadfastOrderRequest
): Promise<SteadfastOrderResult> => {
  if (!validateSteadfastConfig()) throw new Error('Steadfast API credentials missing!');
  const response = await fetch(`${API_CONFIG.STEADFAST_API_URL}/create_order`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(order),
  });
  const result = await response.json();

  if (!response.ok || result.status !== 200) {
    throw new Error(result?.message || 'Failed to create Steadfast order');
  }
  return result.consignment;
};

/**
 * Send bulk orders to Steadfast
 */
export const createBulkSteadfastOrders = async (
  orders: SteadfastOrderRequest[]
): Promise<SteadfastOrderResult[]> => {
  if (!validateSteadfastConfig()) throw new Error('Steadfast API credentials missing!');
  if (!Array.isArray(orders) || orders.length === 0) throw new Error('No orders to send');
  if (orders.length > 500) throw new Error('Maximum 500 orders per request');

  const data = orders.map((order) => ({
    invoice: order.invoice,
    recipient_name: order.recipient_name.trim(),
    recipient_phone: order.recipient_phone.trim(),
    recipient_address: order.recipient_address.trim(),
    cod_amount: parseFloat(order.cod_amount.toString()),
    note: order.note?.trim() || `Order ID: ${order.invoice}`,
    item_description: order.item_description?.trim() || '',
  }));

  console.log('📦 Final bulk payload to Steadfast (JSON):', data);

  const response = await fetch(`${API_CONFIG.STEADFAST_API_URL}/create_order/bulk-order`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      data: JSON.stringify(data)
    }),
  });

  const result = await response.json();

  console.log('📬 Steadfast bulk response:', result);

  if (Array.isArray(result)) return result;
  if (Array.isArray(result.data)) return result.data;
  if (Array.isArray(result.orders)) return result.orders;

  throw new Error(result?.message || 'Bulk order failed');
};

/**
 * Check delivery status by consignment ID
 */
export const getStatusByConsignmentId = async (id: string): Promise<SteadfastStatusResponse> => {
  if (!validateSteadfastConfig()) throw new Error('Steadfast API credentials missing!');

  const response = await fetch(`${API_CONFIG.STEADFAST_API_URL}/status_by_cid/${id}`, {
    method: 'GET',
    headers: HEADERS,
  });

  const result = await response.json();
  if (!response.ok || result.status !== 200) {
    throw new Error('Failed to get status');
  }
  return result;
};

/**
 * Check delivery status by invoice ID - NEW METHOD
 */
export const getStatusByInvoice = async (invoice: string): Promise<SteadfastStatusResponse> => {
  if (!validateSteadfastConfig()) throw new Error('Steadfast API credentials missing!');

  const response = await fetch(`${API_CONFIG.STEADFAST_API_URL}/status_by_invoice/${invoice}`, {
    method: 'GET',
    headers: HEADERS,
  });

  const text = await response.text();

  let result: any;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(text);
  }

  if (!response.ok || result.status !== 200) {
    throw new Error(result?.message || 'Failed to get status by invoice');
  }
  return result;
};

/**
 * Check delivery status by tracking code
 */
export const getStatusByTrackingCode = async (
  trackingCode: string
): Promise<SteadfastStatusResponse> => {
  if (!validateSteadfastConfig()) throw new Error('Steadfast API credentials missing!');

  const response = await fetch(
    `${API_CONFIG.STEADFAST_API_URL}/status_by_trackingcode/${trackingCode}`,
    {
      method: 'GET',
      headers: HEADERS,
    }
  );

  const text = await response.text();

  let result: any;
  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(text);
  }

  if (!response.ok || result.status !== 200) {
    throw new Error(result?.message || 'Failed to get status');
  }

  return result;
};

/**
 * Check current balance
 */
export const getCurrentBalance = async (): Promise<SteadfastBalanceResponse> => {
  if (!validateSteadfastConfig()) throw new Error('Steadfast API credentials missing!');

  const response = await fetch(`${API_CONFIG.STEADFAST_API_URL}/get_balance`, {
    method: 'GET',
    headers: HEADERS,
  });

  const result = await response.json();
  if (!response.ok || result.status !== 200) {
    throw new Error('Failed to get balance');
  }
  return result;
};

/**
 * Map Steadfast delivery status to Order status
 */
export const mapDeliveryStatusToOrderStatus = (deliveryStatus: string): 'Pending' | 'Confirmed' => {
  switch (deliveryStatus) {
    case 'delivered':
    case 'partial_delivered':
    case 'delivered_approval_pending':
    case 'partial_delivered_approval_pending':
      return 'Confirmed';
    case 'pending':
    case 'in_review':
    case 'hold':
    case 'cancelled':
    case 'cancelled_approval_pending':
    case 'unknown':
    case 'unknown_approval_pending':
    default:
      return 'Pending';
  }
};
