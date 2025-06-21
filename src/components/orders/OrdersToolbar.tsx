
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Search, Plus, Truck, FileDown } from "lucide-react";

interface OrdersToolbarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  statusFilter: string;
  onStatusFilter: (value: string) => void;
  hasManagePermissions: boolean;
  selectedOrdersCount: number;
  onAddOrder: () => void;
  onBulkSteadfast: () => void;
  onBulkDownload: () => void;
}

const OrdersToolbar: React.FC<OrdersToolbarProps> = ({
  searchTerm,
  onSearch,
  statusFilter,
  onStatusFilter,
  hasManagePermissions,
  selectedOrdersCount,
  onAddOrder,
  onBulkSteadfast,
  onBulkDownload,
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
      <p className="text-muted-foreground">
        Manage customer orders{" "}
        {hasManagePermissions && "(Admin or Moderator)"}
      </p>
    </div>
    <div className="space-x-2 flex flex-row items-center">
      {hasManagePermissions && (
        <>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600" onClick={onAddOrder}>
            <Plus className="h-4 w-4 mr-2" /> Add Order
          </Button>
          {selectedOrdersCount > 0 && (
            <>
              <Button variant="outline" onClick={onBulkSteadfast}>
                <Truck className="h-4 w-4 mr-2" /> Send to Steadfast ({selectedOrdersCount})
              </Button>
              <Button variant="outline" onClick={onBulkDownload}>
                <FileDown className="h-4 w-4 mr-2" /> Download Invoices ({selectedOrdersCount})
              </Button>
            </>
          )}
        </>
      )}
    </div>
    <div className="flex flex-row gap-4 items-center mt-3 sm:mt-0">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search orders..." value={searchTerm} onChange={e => onSearch(e.target.value)} className="pl-10" />
      </div>
      <Select value={statusFilter} onValueChange={onStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Confirmed">Confirmed</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

export default OrdersToolbar;
