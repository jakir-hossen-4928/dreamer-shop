
import { useState, useMemo, useCallback } from 'react';
import { Order } from '@/types';
import { getStatusByInvoice, getStatusByTrackingCode } from '@/api/steadfast';
import { toast } from '@/hooks/use-toast';

interface StatusQueueItem {
  order: Order & { id: string };
  resolve: (value: string) => void;
  reject: (reason: any) => void;
}

interface StatusResult {
  order: Order & { id: string; deliveryStatus?: string };
  status?: string;
  error?: any;
}

export const useOrderStatus = (
  orders: (Order & { id: string; deliveryStatus?: string })[],
  setOrders: React.Dispatch<React.SetStateAction<(Order & { id: string; deliveryStatus?: string })[]>>
) => {
  // Status checking queue using DSA
  const statusQueue = useMemo(() => {
    const queue: StatusQueueItem[] = [];
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing || queue.length === 0) return;

      isProcessing = true;
      const { order, resolve, reject } = queue.shift()!;

      try {
        let result;
        // Try invoice first, then tracking code
        try {
          result = await getStatusByInvoice(order.ID);
        } catch (invoiceError) {
          if (order["Steadfast-tracking-id"]) {
            result = await getStatusByTrackingCode(order["Steadfast-tracking-id"]);
          } else {
            throw invoiceError;
          }
        }

        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o.id === order.id ? { ...o, deliveryStatus: result.delivery_status } : o
          )
        );
        resolve(result.delivery_status);
      } catch (error) {
        reject(error);
      } finally {
        isProcessing = false;
        processQueue();
      }
    };

    return {
      enqueue: (order: Order & { id: string }) => {
        return new Promise<string>((resolve, reject) => {
          queue.push({ order, resolve, reject });
          processQueue();
        });
      },
    };
  }, [setOrders]);

  // Check single order status
  const handleCheckStatus = useCallback(
    async (order: Order & { id: string }) => {
      if (!order.ID && !order["Steadfast-tracking-id"]) {
        toast({
          title: "Error",
          description: "No invoice ID or tracking ID available for this order",
          variant: "destructive",
        });
        return;
      }

      try {
        await statusQueue.enqueue(order);
        toast({
          title: "Status Retrieved",
          description: `Status updated for order ${order.ID}`,
        });
      } catch (error: any) {
        console.error("Error checking status:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to check delivery status",
          variant: "destructive",
        });
      }
    },
    [statusQueue]
  );

  // Fetch status for all orders - ONLY update deliveryStatus, not Order Status
  const handleFetchAllSteadfastStatus = useCallback(async () => {
    try {
      const ordersList = orders.filter((o) => o.ID || o["Steadfast-tracking-id"]);
      if (!ordersList.length) {
        toast({
          title: "No Orders",
          description: "No orders with invoice IDs or tracking IDs found.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Checking Status",
        description: `Checking status for ${ordersList.length} orders...`,
      });

      const statusPromises = ordersList.map((order) =>
        statusQueue.enqueue(order).then(
          (status): StatusResult => ({ order, status }),
          (error): StatusResult => ({ order, error })
        )
      );

      const results = await Promise.all(statusPromises);
      
      // Count successful status checks
      const successfulChecks = results.filter(result => result.status && !result.error).length;

      toast({
        title: "Status Check Complete",
        description: `Successfully checked ${successfulChecks} order delivery statuses`,
      });
      
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch status", variant: "destructive" });
    }
  }, [orders, statusQueue]);

  return {
    handleCheckStatus,
    handleFetchAllSteadfastStatus
  };
};
