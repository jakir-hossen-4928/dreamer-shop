
export interface User {
  ID: string;
  Name: string;
  Email: string;
  Number: string;
  Status: 'Verified' | 'Non-Verified';
  Role: 'Admin' | 'Moderator';
}

export interface Order {
  ID: string;
  Name: string;
  Number: string;
  'Order-Items': string;
  Address: string;
  Amount: number;
  Reference: string;
  Status: 'Pending' | 'Confirmed';
  'Steadfast-tracking-id': string;
  Notes: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export type OrderData = Omit<Order, "ID" | "CreatedAt" | "UpdatedAt"> & Partial<Pick<Order, "ID" | "CreatedAt" | "UpdatedAt">>;

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  signup?: (name: string, email: string, password: string, number: string) => Promise<void>;
}

export interface SteadfastOrder {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  alternative_phone?: string;
  recipient_email?: string;
  item_description?: string;
  total_lot?: number;
  delivery_type?: 0 | 1;
}

export interface SteadfastResponse {
  status: number;
  message: string;
  consignment: {
    consignment_id: number;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string;
    note: string;
    created_at: string;
    updated_at: string;
  };
}
