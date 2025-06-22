
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Edit, Download, Truck, Trash2, Package, RefreshCw } from "lucide-react";
import { Order } from "@/types";

interface OrdersTableProps {
  orders: (Order & { id: string; deliveryStatus?: string })[];
  hasManagePermissions: boolean;
  selectedOrders: Set<string>;
  filteredOrders: (Order & { id: string; deliveryStatus?: string })[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  setViewingOrder: (order: Order & { id: string }) => void;
  setEditingOrder: (order: Order & { id: string }) => void;
  onDownload: (order: Order & { id: string }) => void;
  onSteadfast: (order: Order & { id: string }) => void;
  onDelete: (id: string) => void;
  onCheckFraudsCheck?: (order: Order & { id: string }) => void;
  onCheckStatus: (order: Order & { id: string }) => Promise<void>;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  hasManagePermissions,
  selectedOrders,
  filteredOrders,
  onSelect,
  onSelectAll,
  setViewingOrder,
  setEditingOrder,
  onDownload,
  onSteadfast,
  onDelete,
  onCheckFraudsCheck,
  onCheckStatus,
}) => {
  if (!filteredOrders.length) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No orders found</h3>
        <p className="text-muted-foreground mb-4">
          Adjust search or filter to find orders.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {hasManagePermissions && (
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedOrders.size === filteredOrders.length}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Tracking</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
            <TableHead>Frauds Check</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.map((o) => (
            <TableRow key={o.id}>
              {hasManagePermissions && (
                <TableCell>
                  <Checkbox
                    checked={selectedOrders.has(o.id)}
                    onCheckedChange={() => onSelect(o.id)}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="font-medium">{o.Name}</div>
                <div className="text-sm text-muted-foreground">{o.Number}</div>
                <div className="text-xs text-muted-foreground">{o.ID}</div>
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate" title={o["Order-Items"]}>
                  {o["Order-Items"]}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">৳{o.Amount.toLocaleString()}</div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={o.Status === "Confirmed" ? "default" : "secondary"}
                >
                  {o.Status}
                </Badge>
              </TableCell>
              <TableCell>
                {o["Steadfast-tracking-id"] ? (
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {o["Steadfast-tracking-id"]} {o.deliveryStatus ? `- ${o.deliveryStatus}` : ""}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onCheckStatus(o)}
                      title="Check Status"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {new Date(o.CreatedAt).toLocaleDateString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewingOrder(o)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {hasManagePermissions && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingOrder(o)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDownload(o)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {o.Status === "Pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSteadfast(o)}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(o.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCheckFraudsCheck?.(o)}
                  >
                    Check Frauds
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
