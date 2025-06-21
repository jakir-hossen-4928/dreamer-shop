
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Order } from '@/types';

// Logging utility for debugging
const log = (context: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[OrderForm:${context}] ${message}`, data || '');
  }
};

interface OrderFormProps {
  order?: Order;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  loading?: boolean;
  defaultName?: string;
  defaultNumber?: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ 
  order, 
  onSubmit, 
  onCancel, 
  loading,
  defaultName = '',
  defaultNumber = ''
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      Name: order?.Name || defaultName,
      Number: order?.Number || defaultNumber,
      'Order-Items': order?.['Order-Items'] || '',
      Address: order?.Address || '',
      Amount: order?.Amount || 0,
      Reference: order?.Reference || `${defaultName} - ${defaultNumber}`,
      Notes: order?.Notes || '',
    },
    mode: 'onBlur',
  });

  // Handle form submission with logging
  const onSubmitWithLog = (data: any) => {
    log('submit', 'Form data submitted', data);
    onSubmit(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{order ? 'Edit Order' : 'Create New Order'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmitWithLog)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                {...register('Name', { required: 'Customer name is required' })}
                placeholder="Enter customer name"
              />
              {errors.Name && <p className="text-sm text-red-500 mt-1">{errors.Name.message}</p>}
            </div>

            <div>
              <Label htmlFor="number">Phone Number *</Label>
              <Input
                id="number"
                type="text"
                {...register('Number', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^0[0-9]{10}$/,
                    message: 'Phone number must start with 0 and be 11 digits'
                  },
                  setValueAs: (value) => String(value).trim(),
                })}
                placeholder="01xxxxxxxxx"
                onInput={(e) => {
                  log('input', 'Phone number input', { value: e.currentTarget.value });
                }}
              />
              {errors.Number && <p className="text-sm text-red-500 mt-1">{errors.Number.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="orderItems">Order Items *</Label>
            <Textarea
              id="orderItems"
              {...register('Order-Items', { required: 'Order items are required' })}
              placeholder="Describe the items"
              rows={3}
            />
            {errors['Order-Items'] && <p className="text-sm text-red-500 mt-1">{errors['Order-Items'].message}</p>}
          </div>

          <div>
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              {...register('Address', { required: 'Address is required' })}
              placeholder="Enter full delivery address"
              rows={3}
            />
            {errors.Address && <p className="text-sm text-red-500 mt-1">{errors.Address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount (৳) *</Label>
              <Input
                id="amount"
                type="number"
                {...register('Amount', {
                  required: 'Amount is required',
                  min: { value: 0, message: 'Amount must be positive' },
                  setValueAs: (value) => parseFloat(value) || 0,
                })}
                placeholder="0"
              />
              {errors.Amount && <p className="text-sm text-red-500 mt-1">{errors.Amount.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="reference">Reference</Label>
            <Input
              id="reference"
              {...register('Reference')}
              placeholder="Enter reference (optional)"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register('Notes')}
              placeholder="Additional notes (optional)"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (order ? 'Update Order' : 'Create Order')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
