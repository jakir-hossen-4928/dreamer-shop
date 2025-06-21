
import React, { useState, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { Truck, Package, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createSteadfastOrder, createBulkSteadfastOrders } from '@/api/steadfast';

// Structured logging utility
const log = (context: string, message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SteadfastOrderModal:${context}] ${message}`, data || '');
  }
};

interface SteadfastOrderModalProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (orders: Order[], trackingIds: string[]) => void;
  isBulk?: boolean;
}

const SteadfastOrderModal: React.FC<SteadfastOrderModalProps> = ({
  orders,
  isOpen,
  onClose,
  onSuccess,
  isBulk = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validate order data before sending
  const validateOrder = (order: Order) => {
    const numberStr = String(order.Number).trim();
    if (
      !order.ID ||
      !order.Name ||
      !numberStr ||
      !order['Order-Items'] ||
      !order.Address ||
      order.Amount === undefined
    ) {
      return 'All required fields (ID, Name, Number, Order-Items, Address, Amount) must be provided';
    }
    if (!/^\d{11}$/.test(numberStr)) {
      return 'Phone number must be 11 digits';
    }
    if (typeof order.Amount !== 'number' || order.Amount < 0 || isNaN(order.Amount)) {
      return 'Amount must be a positive number';
    }
    if (
      typeof order.Name !== 'string' ||
      typeof order.Address !== 'string' ||
      typeof order['Order-Items'] !== 'string'
    ) {
      return 'Name, Address, and Order-Items must be strings';
    }
    return null;
  };

  // Create single Steadfast order
  const createSingleOrder = useCallback(
    async (order: Order) => {
      log('createSingleOrder', `Creating Steadfast order for ${order.ID}`);
      const validationError = validateOrder(order);
      if (validationError) {
        log('createSingleOrder', `Validation failed for ${order.ID}`, validationError);
        throw new Error(validationError);
      }

      try {
        const payload = {
          invoice: order.ID,
          recipient_name: order.Name.trim(),
          recipient_phone: String(order.Number).trim(),
          recipient_address: order.Address.trim(),
          cod_amount: parseFloat(order.Amount.toString()),
          note: order.Notes?.trim() || `Order ID: ${order.ID}`,
          item_description: order['Order-Items']?.trim() || '',
        };
        log('createSingleOrder', `Payload for ${order.ID}`, payload);

        const result = await createSteadfastOrder(payload);

        log('createSingleOrder', `Order ${order.ID} created successfully`, result);
        return {
          order: {
            ...order,
            'Steadfast-tracking-id': result.tracking_code,
          },
          trackingId: result.tracking_code,
        };
      } catch (error: any) {
        log('createSingleOrder', `Error creating order ${order.ID}`, error);
        throw error;
      }
    },
    []
  );

  // Create bulk Steadfast orders
  const createBulkOrders = useCallback(async () => {
    log('createBulkOrders', `Creating ${orders.length} bulk Steadfast orders`);

    // Validate all orders
    const validationErrors: { [key: string]: string } = {};
    orders.forEach((order) => {
      const error = validateOrder(order);
      if (error) {
        validationErrors[order.ID] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      log('createBulkOrders', 'Validation errors detected', validationErrors);
      throw new Error('Validation failed for one or more orders');
    }

    try {
      const payload = orders.map((order) => ({
        invoice: order.ID,
        recipient_name: order.Name.trim(),
        recipient_phone: String(order.Number).trim(),
        recipient_address: order.Address.trim(),
        cod_amount: parseFloat(order.Amount.toString()),
        note: order.Notes?.trim() || `Order ID: ${order.ID}`,
        item_description: order['Order-Items']?.trim() || '',
      }));
      log('createBulkOrders', 'Payload', payload);

      const result = await createBulkSteadfastOrders(payload);

      // Split successes and errors
      const successfulOrders: Order[] = [];
      const trackingIds: string[] = [];
      const errorMap: { [key: string]: string } = {};

      for (const item of result) {
        if (item.status === 'success' && item.tracking_code) {
          // Find original order by invoice/ID
          const foundOrder = orders.find((o) => o.ID === item.invoice);
          if (foundOrder) {
            successfulOrders.push({
              ...foundOrder,
              'Steadfast-tracking-id': item.tracking_code,
            });
            trackingIds.push(item.tracking_code);
          }
        } else {
          errorMap[item.invoice] = item.status || item.message || 'Unknown error';
        }
      }
      if (Object.keys(errorMap).length > 0) setErrors((prev) => ({ ...prev, ...errorMap }));

      return { successfulOrders, trackingIds };
    } catch (error: any) {
      log('createBulkOrders', 'Error creating bulk orders', error);
      throw error;
    }
  }, [orders]);

  // Handle Steadfast order creation
  const handleCreateSteadfastOrder = useCallback(async () => {
    log('handleCreateSteadfastOrder', `Initiating Steadfast order creation (isBulk: ${isBulk})`);
    setLoading(true);
    setErrors({});

    try {
      let successfulOrders: Order[] = [];
      let trackingIds: string[] = [];

      if (isBulk) {
        const { successfulOrders: bulkOrders, trackingIds: bulkTrackingIds } =
          await createBulkOrders();
        successfulOrders = bulkOrders;
        trackingIds = bulkTrackingIds;

        if (successfulOrders.length > 0) {
          toast({
            title: 'Success',
            description: `${successfulOrders.length} of ${orders.length} orders sent to Steadfast successfully`,
          });
        }

        if (successfulOrders.length < orders.length) {
          toast({
            title: 'Partial Failure',
            description: `${orders.length - successfulOrders.length} orders failed to process. See details below.`,
            variant: 'destructive',
          });
        }
      } else {
        const { order, trackingId } = await createSingleOrder(orders[0]);
        successfulOrders = [order];
        trackingIds = [trackingId];

        toast({
          title: 'Success',
          description: 'Order sent to Steadfast successfully',
        });
      }

      if (successfulOrders.length > 0) {
        onSuccess(successfulOrders, trackingIds);
      }

      // Only close modal if all orders succeeded
      if (successfulOrders.length === orders.length) {
        onClose();
      }
    } catch (error: any) {
      log('handleCreateSteadfastOrder', 'Error processing Steadfast orders', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send orders to Steadfast',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isBulk, orders, createSingleOrder, createBulkOrders, onSuccess, onClose]);

  // Memoized order list to prevent re-renders
  const memoizedOrders = useMemo(() => orders, [orders]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        aria-describedby="steadfast-order-description"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {isBulk ? `Send ${orders.length} Orders to Steadfast` : 'Send Order to Steadfast'}
          </DialogTitle>
          <DialogDescription id="steadfast-order-description">
            Confirm the details below to create {isBulk ? 'bulk' : 'a'} Steadfast order(s).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              This will create {isBulk ? 'delivery consignments' : 'a delivery consignment'} with
              Steadfast Courier and update the order status to "Confirmed".
            </p>
          </div>

          <div className="grid gap-4">
            {memoizedOrders.map((order) => (
              <div key={order.ID} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold">{order.Name}</h3>
                    <p className="text-sm text-muted-foreground">{order.ID}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge variant="outline">৳{order.Amount.toLocaleString()}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Phone:</span> {order.Number}
                    {errors[order.ID] && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-600">
                          {errors[order.ID]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">Items:</span> {order['Order-Items']}
                  </div>
                </div>

                <div className="mt-2">
                  <span className="font-medium text-sm">Address:</span>
                  <p className="text-sm text-muted-foreground">
                    {order.Address}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                log('dialog', 'Closing modal');
                onClose();
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSteadfastOrder} disabled={loading}>
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <Package className="h-4 w-4 mr-2" />
                  {isBulk ? `Send ${orders.length} Orders` : 'Send Order'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SteadfastOrderModal;
