
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
import { Truck, Package, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
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

interface ProcessingResult {
  successful: Array<{ order: Order; trackingId: string }>;
  failed: Array<{ order: Order; error: string }>;
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
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);

  // Validate order data before sending
  const validateOrder = (order: Order) => {
    const numberStr = String(order.Number).trim();
    
    // Check required fields
    if (!order.ID?.trim()) return 'Order ID is required';
    if (!order.Name?.trim()) return 'Customer name is required';
    if (!numberStr) return 'Phone number is required';
    if (!order['Order-Items']?.trim()) return 'Order items are required';
    if (!order.Address?.trim()) return 'Address is required';
    if (order.Amount === undefined || order.Amount === null) return 'Amount is required';
    
    // Validate phone number format
    if (!/^\d{11}$/.test(numberStr)) return 'Phone number must be exactly 11 digits';
    
    // Validate amount
    if (typeof order.Amount !== 'number' || order.Amount < 0 || isNaN(order.Amount)) {
      return 'Amount must be a positive number';
    }
    
    // Validate string fields
    if (typeof order.Name !== 'string' || typeof order.Address !== 'string' || typeof order['Order-Items'] !== 'string') {
      return 'Name, Address, and Order-Items must be valid text';
    }
    
    // Additional business validations
    if (order.Name.length > 100) return 'Customer name too long (max 100 characters)';
    if (order.Address.length > 250) return 'Address too long (max 250 characters)';
    if (order.Amount > 500000) return 'Amount too high (max ৳500,000)';
    
    return null;
  };

  // Create single Steadfast order with comprehensive error handling
  const createSingleOrder = useCallback(
    async (order: Order) => {
      log('createSingleOrder', `Creating Steadfast order for ${order.ID}`);
      const validationError = validateOrder(order);
      if (validationError) {
        log('createSingleOrder', `Validation failed for ${order.ID}`, validationError);
        throw new Error(`Validation failed: ${validationError}`);
      }

      try {
        const payload = {
          invoice: order.ID.trim(),
          recipient_name: order.Name.trim(),
          recipient_phone: String(order.Number).trim(),
          recipient_address: order.Address.trim(),
          cod_amount: parseFloat(order.Amount.toString()),
          note: order.Notes?.trim() || `Order ID: ${order.ID}`,
          item_description: order['Order-Items']?.trim() || 'E-commerce Order',
        };
        
        log('createSingleOrder', `Payload for ${order.ID}`, payload);

        const result = await createSteadfastOrder(payload);

        if (!result.tracking_code) {
          throw new Error('No tracking code received from Steadfast');
        }

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
        
        // Enhance error messages
        let errorMessage = error.message || 'Unknown error occurred';
        if (error.message?.includes('duplicate')) {
          errorMessage = 'Order with this ID already exists in Steadfast';
        } else if (error.message?.includes('balance')) {
          errorMessage = 'Insufficient balance in Steadfast account';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Network connection error - please try again';
        }
        
        throw new Error(errorMessage);
      }
    },
    []
  );

  // Create bulk Steadfast orders with comprehensive error handling
  const createBulkOrders = useCallback(async (): Promise<ProcessingResult> => {
    log('createBulkOrders', `Creating ${orders.length} bulk Steadfast orders`);

    // Validate all orders first
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
      throw new Error(`Validation failed for ${Object.keys(validationErrors).length} order(s)`);
    }

    try {
      const payload = orders.map((order) => ({
        invoice: order.ID.trim(),
        recipient_name: order.Name.trim(),
        recipient_phone: String(order.Number).trim(),
        recipient_address: order.Address.trim(),
        cod_amount: parseFloat(order.Amount.toString()),
        note: order.Notes?.trim() || `Order ID: ${order.ID}`,
        item_description: order['Order-Items']?.trim() || 'E-commerce Order',
      }));
      
      log('createBulkOrders', 'Payload', payload);

      const result = await createBulkSteadfastOrders(payload);

      // Process results
      const successful: Array<{ order: Order; trackingId: string }> = [];
      const failed: Array<{ order: Order; error: string }> = [];

      for (const item of result) {
        const foundOrder = orders.find((o) => o.ID === item.invoice);
        if (!foundOrder) continue;

        if (item.status === 'success' && item.tracking_code) {
          successful.push({
            order: {
              ...foundOrder,
              'Steadfast-tracking-id': item.tracking_code,
            },
            trackingId: item.tracking_code,
          });
        } else {
          let errorMessage = item.message || item.status || 'Unknown error';
          if (errorMessage.includes('duplicate')) {
            errorMessage = 'Order already exists in Steadfast';
          } else if (errorMessage.includes('balance')) {
            errorMessage = 'Insufficient account balance';
          }
          
          failed.push({
            order: foundOrder,
            error: errorMessage,
          });
        }
      }

      return { successful, failed };
    } catch (error: any) {
      log('createBulkOrders', 'Error creating bulk orders', error);
      
      // If the entire bulk request fails, mark all as failed
      const failed = orders.map(order => ({
        order,
        error: error.message || 'Bulk request failed'
      }));
      
      return { successful: [], failed };
    }
  }, [orders]);

  // Handle Steadfast order creation with enhanced feedback
  const handleCreateSteadfastOrder = useCallback(async () => {
    log('handleCreateSteadfastOrder', `Initiating Steadfast order creation (isBulk: ${isBulk})`);
    setLoading(true);
    setErrors({});
    setProcessingResult(null);

    try {
      if (isBulk) {
        const result = await createBulkOrders();
        setProcessingResult(result);

        if (result.successful.length > 0) {
          const successfulOrders = result.successful.map(r => r.order);
          const trackingIds = result.successful.map(r => r.trackingId);

          toast({
            title: "Bulk Processing Complete",
            description: `${result.successful.length} of ${orders.length} orders processed successfully`,
            variant: result.failed.length === 0 ? "default" : "destructive",
          });

          // Call success handler for successful orders
          onSuccess(successfulOrders, trackingIds);
        }

        if (result.failed.length > 0) {
          // Set errors for failed orders
          const errorMap: { [key: string]: string } = {};
          result.failed.forEach(({ order, error }) => {
            errorMap[order.ID] = error;
          });
          setErrors(errorMap);
          
          toast({
            title: "Some Orders Failed",
            description: `${result.failed.length} orders failed to process. Please review the errors below.`,
            variant: "destructive",
          });
        }

        // Only close modal if all orders succeeded
        if (result.failed.length === 0) {
          onClose();
        }
      } else {
        // Single order processing
        const { order, trackingId } = await createSingleOrder(orders[0]);
        
        toast({
          title: "Success",
          description: `Order sent to Steadfast successfully with tracking ID: ${trackingId}`,
        });

        onSuccess([order], [trackingId]);
        onClose();
      }
    } catch (error: any) {
      log('handleCreateSteadfastOrder', 'Error processing Steadfast orders', error);
      toast({
        title: 'Steadfast Error',
        description: error.message || 'Failed to send orders to Steadfast',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [isBulk, orders, createSingleOrder, createBulkOrders, onSuccess, onClose]);

  // Memoized order list to prevent re-renders
  const memoizedOrders = useMemo(() => orders, [orders]);

  // Get status icon for orders
  const getOrderStatusIcon = (order: Order) => {
    if (processingResult) {
      const successful = processingResult.successful.find(r => r.order.ID === order.ID);
      const failed = processingResult.failed.find(r => r.order.ID === order.ID);
      
      if (successful) return <CheckCircle className="h-4 w-4 text-green-500" />;
      if (failed) return <XCircle className="h-4 w-4 text-red-500" />;
    }
    
    if (errors[order.ID]) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    return null;
  };

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
            {processingResult 
              ? `Processing completed: ${processingResult.successful.length} successful, ${processingResult.failed.length} failed`
              : `Confirm the details below to create ${isBulk ? 'bulk' : 'a'} Steadfast order(s).`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              This will create {isBulk ? 'delivery consignments' : 'a delivery consignment'} with
              Steadfast Courier and update the order status to "Confirmed" for successful orders.
            </p>
          </div>

          <div className="grid gap-4">
            {memoizedOrders.map((order) => (
              <div key={order.ID} className="border rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {getOrderStatusIcon(order)}
                    <div>
                      <h3 className="font-semibold">{order.Name}</h3>
                      <p className="text-sm text-muted-foreground">{order.ID}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge variant="outline">৳{order.Amount.toLocaleString()}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Phone:</span> {order.Number}
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

                {errors[order.ID] && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 rounded border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700">
                      {errors[order.ID]}
                    </span>
                  </div>
                )}

                {processingResult && (
                  <>
                    {processingResult.successful.find(r => r.order.ID === order.ID) && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 rounded border border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-green-700">
                          Successfully sent to Steadfast with tracking: {processingResult.successful.find(r => r.order.ID === order.ID)?.trackingId}
                        </span>
                      </div>
                    )}
                    {processingResult.failed.find(r => r.order.ID === order.ID) && (
                      <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 rounded border border-red-200">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">
                          Failed: {processingResult.failed.find(r => r.order.ID === order.ID)?.error}
                        </span>
                      </div>
                    )}
                  </>
                )}
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
              {processingResult && processingResult.failed.length > 0 ? 'Close' : 'Cancel'}
            </Button>
            {(!processingResult || processingResult.failed.length > 0) && (
              <Button onClick={handleCreateSteadfastOrder} disabled={loading}>
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    <Package className="h-4 w-4 mr-2" />
                    {processingResult && processingResult.failed.length > 0 
                      ? `Retry Failed Orders (${processingResult.failed.length})`
                      : isBulk ? `Send ${orders.length} Orders` : 'Send Order'
                    }
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SteadfastOrderModal;
