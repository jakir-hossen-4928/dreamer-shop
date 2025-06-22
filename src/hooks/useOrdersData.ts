
import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types';
import { getOrders } from '@/services/firestore';
import { toast } from '@/hooks/use-toast';

export const useOrdersData = () => {
  const [orders, setOrders] = useState<(Order & { id: string; deliveryStatus?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const data = await getOrders(page, 10);
      setOrders(data.orders.map((o) => ({ ...o, deliveryStatus: undefined })));
      setTotalPages(data.totalPages);
    } catch (error: any) {
      console.error("Error fetching orders:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  return {
    orders,
    setOrders,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    fetchOrders
  };
};
