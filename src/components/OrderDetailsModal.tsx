
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types';
import { Download, Edit, Trash2, Package } from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (order: Order) => void;
  onDelete: (orderId: string) => void;
  onDownloadInvoice: (order: Order) => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDownloadInvoice,
}) => {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Order Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div>
              <h3 className="text-lg font-semibold">{order.Name}</h3>
              <p className="text-sm text-muted-foreground">Order ID: {order.ID}</p>
            </div>
            <Badge variant={order.Status === 'Confirmed' ? 'default' : 'secondary'}>
              {order.Status}
            </Badge>
          </div>

          {/* Order Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <p className="text-sm">{order.Number}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Amount</label>
                <p className="text-sm font-semibold">৳{order.Amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reference</label>
                <p className="text-sm">{order.Reference || 'N/A'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{new Date(order.CreatedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="text-sm">{new Date(order.UpdatedAt).toLocaleDateString()}</p>
              </div>
              {order['Steadfast-tracking-id'] && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tracking ID</label>
                  <p className="text-sm text-green-600 font-mono">{order['Steadfast-tracking-id']}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Order Items</label>
            <p className="text-sm mt-1 p-3 bg-muted rounded-md">{order['Order-Items']}</p>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Delivery Address</label>
            <p className="text-sm mt-1 p-3 bg-muted rounded-md">{order.Address}</p>
          </div>

          {/* Notes */}
          {order.Notes && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <p className="text-sm mt-1 p-3 bg-muted rounded-md">{order.Notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadInvoice(order)}
              className="justify-center sm:justify-start"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(order)}
              className="justify-center sm:justify-start"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(order.ID)}
              className="justify-center sm:justify-start"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsModal;
