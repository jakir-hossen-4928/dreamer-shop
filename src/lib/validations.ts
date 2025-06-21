import { z } from 'zod';

export const userSchema = z.object({
  ID: z.string().min(1, 'ID is required'),
  Name: z.string().min(1, 'Name is required'),
  Email: z.string().email('Invalid email format'),
  Number: z.string().regex(/^\d{11}$/, 'Phone number must be 11 digits'),
  Status: z.enum(['Verified', 'Non-verified']),
  Role: z.enum(['Admin', 'Moderator']),
});

export const orderSchema = z.object({
  ID: z.string().min(1, 'Order ID is required'),
  Name: z.string().min(1, 'Customer name is required'),
  Number: z.string().regex(/^\d{11}$/, 'Phone number must be 11 digits'),
  'Order-Items': z.string().min(1, 'Order items are required'),
  Address: z.string().min(1, 'Address is required'),
  Amount: z.number().min(0, 'Amount must be positive'),
  Reference: z.string(),
  Status: z.enum(['Pending', 'Confirmed']),
  Notes: z.string(),
  'Steadfast-tracking-id': z.string(),
  CreatedAt: z.string(),
  UpdatedAt: z.string()
});

// For order creation, 'ID', 'CreatedAt', etc., are often assigned by backend
export const orderDataSchema = orderSchema.partial({
  ID: true,
  Reference: true,
  Status: true,
  Notes: true,
  'Steadfast-tracking-id': true,
  CreatedAt: true,
  UpdatedAt: true
});

export const steadfastOrderSchema = z.object({
  invoice: z.string().min(1, 'Invoice is required'),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_phone: z.string().regex(/^\d{11}$/, 'Phone number must be 11 digits'),
  recipient_address: z.string().min(1, 'Address is required'),
  cod_amount: z.number().min(0, 'Amount must be positive'),
  note: z.string().optional(),
  alternative_phone: z.string().regex(/^\d{11}$/).optional(),
  recipient_email: z.string().email().optional(),
  item_description: z.string().optional(),
  total_lot: z.number().optional(),
  delivery_type: z.union([z.literal(0), z.literal(1)]).optional()
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});
export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  number: z.string().regex(/^\d{11}$/, 'Phone number must be 11 digits')
});

export const validateUserPermissions = (user: any): { isValid: boolean; error?: string } => {
  if (!user) {
    return { isValid: false, error: 'User not authenticated' };
  }
  const result = userSchema.safeParse(user);
  if (!result.success) {
    return { isValid: false, error: result.error.issues[0]?.message || 'Invalid user data' };
  }
  if (user.Status !== 'Verified') {
    return { isValid: false, error: 'Account not verified' };
  }
  return { isValid: true };
};

export const hasAdminPermissions = (user: any): boolean => {
  return user?.Role === 'Admin' && user?.Status === 'Verified';
};

export const hasModeratorPermissions = (user: any): boolean => {
  return (user?.Role === 'Moderator' || user?.Role === 'Admin') && user?.Status === 'Verified';
};

export type UserSchema = z.infer<typeof userSchema>;
export type OrderDataSchema = z.infer<typeof orderDataSchema>;
export type OrderSchema = z.infer<typeof orderSchema>;
export type SteadfastOrderSchema = z.infer<typeof steadfastOrderSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type SignupSchema = z.infer<typeof signupSchema>;
