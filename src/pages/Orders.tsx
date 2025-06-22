import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import OrdersToolbar from "@/components/orders/OrdersToolbar";
import OrdersTable from "@/components/orders/OrdersTable";
import OrdersPagination from "@/components/orders/OrdersPagination";
import Loading from "@/components/ui/loading";
import OrderForm from "@/components/OrderForm";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import SteadfastOrderModal from "@/components/SteadfastOrderModal";
import { Order, OrderData } from "@/types";
import { toast } from "@/hooks/use-toast";
import { downloadSingleInvoice, downloadBulkInvoices } from "@/utils/invoiceGenerator";
import { debounce } from "lodash";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder as deleteOrderFromFirestore,
  getOrderById,
  batchUpdateOrders,
} from "@/services/firestore";
import { checkBDFraud } from "@/api/bdcourier";
import BDCourierRatioResult from "@/components/orders/BDCourierRatioResult";
import { useBulkCourierRatio } from "@/hooks/useBulkCourierRatio";
import BdcourierRatioDialog from "@/components/orders/BdcourierRatioDialog";
import { getCurrentBalance, getStatusByTrackingCode } from "@/api/steadfast";
import { SteadfastBalanceResponse } from "@/api/steadfast";

interface StatusQueueItem {
  order: Order & { id: string };
  resolve: (value: string) => void;
  reject: (reason: any) => void;
}

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<(Order & { id: string; deliveryStatus?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSteadfastModal, setShowSteadfastModal] = useState(false);
  const [steadfastOrders, setSteadfastOrders] = useState<(Order & { id: string })[]>([]);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [bdcModalOpen, setBdcModalOpen] = useState(false);
  const [bdcModalResult, setBdcModalResult] = useState<any | null>(null);
  const [bdcCheckedPhones, setBdcCheckedPhones] = useState<string[]>([]);
  const [balance, setBalance] = useState<SteadfastBalanceResponse | null>(null);

  const hasManagePermissions = true;

  // Status checking queue using DSA
  const statusQueue = useMemo(() => {
    const queue: StatusQueueItem[] = [];
    let isProcessing = false;

    const processQueue = async () => {
      if (isProcessing || queue.length === 0) return;

      isProcessing = true;
      const { order, resolve, reject } = queue.shift()!;

      try {
        const result = await getStatusByTrackingCode(order["Steadfast-tracking-id"]);
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
  }, []);

  // Fetch Steadfast balance with caching
  const fetchBalance = useCallback(async () => {
    // Check cache first (5 minutes)
    const cachedBalance = sessionStorage.getItem('steadfast_balance');
    const cacheTimestamp = sessionStorage.getItem('steadfast_balance_timestamp');
    
    if (cachedBalance && cacheTimestamp) {
      const age = Date.now() - parseInt(cacheTimestamp);
      if (age < 5 * 60 * 1000) { // 5 minutes
        setBalance(JSON.parse(cachedBalance));
        return;
      }
    }

    try {
      const result = await getCurrentBalance();
      setBalance(result);
      // Cache the result
      sessionStorage.setItem('steadfast_balance', JSON.stringify(result));
      sessionStorage.setItem('steadfast_balance_timestamp', Date.now().toString());
    } catch (error: any) {
      console.error("Error fetching balance:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch balance",
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, []);

  // Filtering
  const filteredOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        (statusFilter === "All" || o.Status === statusFilter) &&
        (o.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         o.Number.includes(searchTerm) ||
         o.ID.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [orders, searchTerm, statusFilter]);

  // Fetch orders with optimized pagination
  const fetchOrders = useCallback(
    async (page: number = 1) => {
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
    },
    []
  );

  useEffect(() => {
    fetchOrders(currentPage);
  }, [currentPage, fetchOrders]);

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Handle order creation/editing with validation
  const handleOrderSubmit = useCallback(
    async (data: OrderData, isEdit = false, orderId?: string) => {
      try {
        setFormLoading(true);

        const orderData = {
          ...data,
          Name: data.Name || (user?.Name || ""),
          Number: data.Number || (user?.Number || ""),
        };

        if (isEdit && orderId) {
          const docOrder = orders.find((o) => o.ID === orderId);
          if (!docOrder) throw new Error("Order document not found.");
          await updateOrder(docOrder.id, orderData);
          toast({ title: "Success", description: "Order updated successfully" });
          setEditingOrder(null);
        } else {
          await createOrder({
            ...orderData,
            "Steadfast-tracking-id": "",
            Reference: orderData.Reference ?? "",
            Status: "Pending",
            Notes: orderData.Notes ?? "",
          });
          toast({ title: "Success", description: "Order created successfully" });
          setShowCreateForm(false);
        }

        fetchOrders(currentPage);
      } catch (error: any) {
        console.error("Error submitting order:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } finally {
        setFormLoading(false);
      }
    },
    [currentPage, fetchOrders, orders, user]
  );

  // Delete order
  const handleDeleteOrder = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this order?")) return;

      try {
        await deleteOrderFromFirestore(id);
        setOrders(orders.filter((o) => o.id !== id));
        setViewingOrder(null);
        toast({ title: "Success", description: "Order deleted successfully" });
      } catch (error: any) {
        console.error("Error deleting order:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    },
    [orders]
  );

  // Handle Steadfast orders
  const handleSteadfast = useCallback(
    (order?: Order & { id: string }) => {
      const selected: (Order & { id: string })[] = order
        ? [order]
        : orders.filter((o) => selectedOrders.has(o.id));
      if (!selected.length) {
        toast({
          title: "Error",
          description: "Please select orders",
          variant: "destructive",
        });
        return;
      }
      setSteadfastOrders(selected);
      setShowSteadfastModal(true);
    },
    [orders, selectedOrders]
  );

  // Optimized Steadfast success handler with batch operations
  const handleSteadfastSuccess = useCallback(
    async (successOrders: (Order & { id: string })[], trackingIds: string[]) => {
      try {
        if (successOrders.length === 0) {
          toast({
            title: "No Orders Processed",
            description: "No orders were successfully sent to Steadfast.",
            variant: "destructive",
          });
          fetchOrders(currentPage);
          return;
        }

        // Prepare batch updates with proper typing
        const batchUpdates = successOrders.map((order, index) => ({
          id: order.id,
          data: {
            Status: "Confirmed" as const, // Fix type issue with explicit const assertion
            "Steadfast-tracking-id": trackingIds[index],
            UpdatedAt: new Date().toISOString(),
          } as Partial<Order>
        }));

        try {
          // Use batch update for better performance
          await batchUpdateOrders(batchUpdates);
          
          toast({
            title: "Success",
            description: `${successOrders.length} order${successOrders.length > 1 ? "s" : ""} confirmed with tracking ID${successOrders.length > 1 ? "s" : ""}`,
          });
          
          setShowSteadfastModal(false);
          fetchOrders(currentPage);
          
          // Refresh balance after successful order
          setTimeout(() => {
            sessionStorage.removeItem('steadfast_balance');
            sessionStorage.removeItem('steadfast_balance_timestamp');
            fetchBalance();
          }, 1000);
          
        } catch (firestoreError: any) {
          console.error("Error updating orders in Firestore:", firestoreError);
          toast({ 
            title: "Data Storage Error", 
            description: `Orders were sent to Steadfast but failed to update in database: ${firestoreError.message}`,
            variant: "destructive" 
          });
        }

      } catch (error: any) {
        console.error("Error in Steadfast success handler:", error);
        toast({ 
          title: "Error", 
          description: `Failed to process Steadfast orders: ${error.message}`,
          variant: "destructive" 
        });
      }
    },
    [currentPage, fetchOrders, fetchBalance]
  );

  // Download invoices
  const handleDownload = useCallback(
    async (order?: Order & { id: string }) => {
      const items = order ? [order] : orders.filter((o) => selectedOrders.has(o.id));
      if (!items.length) {
        toast({
          title: "Error",
          description: "Please select orders",
          variant: "destructive",
        });
        return;
      }

      try {
        if (items.length > 1) {
          // Convert Order & { id: string } to Order for bulk download by reconstructing Order objects
          const orderItems: Order[] = items.map((item) => ({
            ID: item.ID,
            Name: item.Name,
            Number: item.Number,
            'Order-Items': item['Order-Items'],
            Address: item.Address,
            Amount: item.Amount,
            Reference: item.Reference,
            Status: item.Status,
            'Steadfast-tracking-id': item['Steadfast-tracking-id'],
            Notes: item.Notes,
            CreatedAt: item.CreatedAt,
            UpdatedAt: item.UpdatedAt,
          }));
          await downloadBulkInvoices(orderItems);
        } else {
          // Convert Order & { id: string } to Order for single download by reconstructing Order object
          const orderItem: Order = {
            ID: items[0].ID,
            Name: items[0].Name,
            Number: items[0].Number,
            'Order-Items': items[0]['Order-Items'],
            Address: items[0].Address,
            Amount: items[0].Amount,
            Reference: items[0].Reference,
            Status: items[0].Status,
            'Steadfast-tracking-id': items[0]['Steadfast-tracking-id'],
            Notes: items[0].Notes,
            CreatedAt: items[0].CreatedAt,
            UpdatedAt: items[0].UpdatedAt,
          };
          await downloadSingleInvoice(orderItem);
        }
        toast({
          title: "Success",
          description: `${items.length} invoice${items.length > 1 ? "s" : ""} downloaded`,
        });
      } catch (error: any) {
        console.error("Error downloading invoices:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    },
    [orders, selectedOrders]
  );

  // Selection handlers
  const handleSelect = useCallback(
    (id: string) => {
      const newSelected = new Set(selectedOrders);
      newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
      setSelectedOrders(newSelected);
    },
    [selectedOrders]
  );

  const handleSelectAll = useCallback(() => {
    const newSelected =
      selectedOrders.size === filteredOrders.length
        ? new Set<string>()
        : new Set(filteredOrders.map((o) => o.id));
    setSelectedOrders(newSelected);
  }, [selectedOrders, filteredOrders]);

  // Check single order status
  const handleCheckStatus = useCallback(
    async (order: Order & { id: string }) => {
      if (!order["Steadfast-tracking-id"]) {
        toast({
          title: "Error",
          description: "No tracking ID available for this order",
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

  // Fetch status for all steadfast orders
  const handleFetchAllSteadfastStatus = async () => {
    try {
      const steadfastOrders = orders.filter((o) => o["Steadfast-tracking-id"]);
      if (!steadfastOrders.length) {
        toast({
          title: "No Steadfast Orders",
          description: "No orders with tracking IDs found.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Checking Status",
        description: `Checking status for ${steadfastOrders.length} orders...`,
      });

      const statusPromises = steadfastOrders.map((order) =>
        statusQueue.enqueue(order).then(
          (status) => ({ order, status }),
          (error) => ({ order, error })
        )
      );

      await Promise.all(statusPromises);

      toast({
        title: "Status Check Complete",
        description: "All Steadfast order statuses updated in table",
      });
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch status", variant: "destructive" });
    }
  };

  // Check BDCourier order ratio
  const handleCheckBDCourierRatio = async () => {
    const baseOrders =
      selectedOrders.size > 0
        ? orders.filter((o) => selectedOrders.has(o.id))
        : filteredOrders;

    const uniquePhones = Array.from(
      new Set(baseOrders.map((o) => o.Number).filter(Boolean))
    );
    if (!uniquePhones.length) {
      toast({
        title: "BDCourier Ratio",
        description: "No customer phone numbers found in the selected or filtered orders.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "BDCourier Check",
      description: `Checking ${uniquePhones.length} phone${uniquePhones.length > 1 ? "s" : ""}...`,
      variant: "default",
    });

    let aggregate: any = {};
    let phonesChecked: string[] = [];
    for (const phone of uniquePhones) {
      try {
        const data = await checkBDFraud(phone);
        if (data?.courierData) {
          for (const courier of ["pathao", "steadfast", "redx", "paperfly", "parceldex", "summary"]) {
            if (!aggregate[courier])
              aggregate[courier] = {
                name: data.courierData[courier]?.name ?? courier,
                total_parcel: 0,
                success_parcel: 0,
                cancelled_parcel: 0,
                success_ratio: 0,
              };
            if (data.courierData[courier]) {
              aggregate[courier].total_parcel += data.courierData[courier].total_parcel || 0;
              aggregate[courier].success_parcel += data.courierData[courier].success_parcel || 0;
              aggregate[courier].cancelled_parcel += data.courierData[courier].cancelled_parcel || 0;
              aggregate[courier].success_ratio += data.courierData[courier].success_ratio || 0;
            }
          }
          phonesChecked.push(phone);
        }
      } catch (err: any) {
        // can collect errors if needed
      }
    }

    if (phonesChecked.length === 0) {
      toast({
        title: "BDCourier",
        description: "No BD Courier data found for given numbers.",
        variant: "destructive",
      });
      return;
    }

    setBdcCheckedPhones(phonesChecked);
    setBdcModalResult(aggregate);
    setBdcModalOpen(true);
  };

  const {
    dialogOpen,
    courierData,
    checkedPhones,
    openDialogForPhones,
    closeDialog,
  } = useBulkCourierRatio();

  const handleCheckSingleBdCourierRatio = (order?: Order & { id: string }) => {
    let number = "";
    if (order) {
      number = order.Number;
    } else {
      const baseOrder =
        selectedOrders.size > 0
          ? orders.find((o) => selectedOrders.has(o.id))
          : filteredOrders[0];
      if (!baseOrder) {
        toast({
          title: "BDCourier Ratio",
          description: "No customer phone numbers found.",
          variant: "destructive",
        });
        return;
      }
      number = baseOrder.Number;
    }
    if (number) {
      openDialogForPhones([number]);
    }
  };

  if (loading && !orders.length)
    return <Loading className="min-h-96" text="Loading orders..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b pb-4 mb-6">
        <div className="flex flex-col items-start justify-center gap-1 md:flex-row md:items-center md:gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 md:mb-0">
            <span className="inline-flex items-center gap-2">
              <svg
          className="w-6 h-6 text-green-500"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
              >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="#dcfce7" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12l2 2 4-4"
            stroke="#22c55e"
            strokeWidth="2"
            fill="none"
          />
              </svg>
              Steadfast Balance
            </span>
          </h1>
          {balance ? (
            <span className="text-lg md:text-xl font-semibold text-green-700 bg-green-100 px-3 py-1 rounded shadow-sm ml-0 md:ml-2">
              ৳{balance.current_balance.toLocaleString()}
            </span>
          ) : (
            <span className="text-gray-400 text-sm ml-0 md:ml-2">Loading...</span>
          )}
        </div>
        <div className="flex flex-row gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
            onClick={handleFetchAllSteadfastStatus}
          >
            Fetch All Steadfast Status
          </button>
        </div>
      </div>

      <OrdersToolbar
        searchTerm={searchTerm}
        onSearch={debouncedSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        hasManagePermissions={true}
        selectedOrdersCount={selectedOrders.size}
        onAddOrder={() => setShowCreateForm(true)}
        onBulkSteadfast={() => handleSteadfast()}
        onBulkDownload={() => handleDownload()}
      />

      <OrdersTable
        orders={orders}
        hasManagePermissions={true}
        selectedOrders={selectedOrders}
        filteredOrders={filteredOrders}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        setViewingOrder={setViewingOrder}
        setEditingOrder={setEditingOrder}
        onDownload={handleDownload}
        onSteadfast={handleSteadfast}
        onDelete={handleDeleteOrder}
        onCheckBdCourierRatio={handleCheckSingleBdCourierRatio}
        onCheckStatus={handleCheckStatus}
      />

      <OrdersPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Order</DialogTitle>
            </DialogHeader>
            <OrderForm
              defaultName={user?.Name || ""}
              defaultNumber={user?.Number || ""}
              onSubmit={(data) => handleOrderSubmit(data)}
              onCancel={() => setShowCreateForm(false)}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingOrder} onOpenChange={() => setEditingOrder(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Update Order</DialogTitle>
            </DialogHeader>
            <OrderForm
              order={editingOrder || undefined}
              onSubmit={(data) => handleOrderSubmit(data, true, editingOrder?.ID)}
              onCancel={() => setEditingOrder(null)}
              loading={formLoading}
            />
          </DialogContent>
        </Dialog>

        <SteadfastOrderModal
          orders={steadfastOrders}
          isOpen={showSteadfastModal}
          onClose={() => setShowSteadfastModal(false)}
          onSuccess={handleSteadfastSuccess}
          isBulk={steadfastOrders.length > 1}
        />
      </>

      <OrderDetailsModal
        order={viewingOrder}
        isOpen={!!viewingOrder}
        onClose={() => setViewingOrder(null)}
        onEdit={setEditingOrder}
        onDelete={handleDeleteOrder}
        onDownloadInvoice={(order: Order) => {
          // Create a temporary object with id for the download function
          const orderWithId = { ...order, id: orders.find(o => o.ID === order.ID)?.id || '' };
          handleDownload(orderWithId);
        }}
      />

      <BdcourierRatioDialog
        open={dialogOpen}
        courierData={courierData}
        checkedPhones={checkedPhones}
        onClose={closeDialog}
      />
    </div>
  );
};

export default Orders;
