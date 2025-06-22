
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Phone, User, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { checkPhoneFraud } from '@/utils/bdcourierApi';
import { getOrders } from '@/services/firestore';
import Loading from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';
import { Order } from '@/types';

interface Customer {
  name: string;
  phone: string;
  orderId: string;
}

interface FraudCheckResult {
  phone: string;
  status: string;
  delivery_count?: number;
  last_delivery?: string;
  risk_score?: number;
  notes?: string;
}

const FraudsCheck: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const { orders } = await getOrders(1, 1000); // Fetch a large number to get all customers
        
        // Extract unique customers
        const uniqueCustomers = new Map<string, Customer>();
        
        orders.forEach((order: Order & { id: string }) => {
          if (order.Number && order.Name) {
            const key = order.Number;
            if (!uniqueCustomers.has(key)) {
              uniqueCustomers.set(key, {
                name: order.Name,
                phone: order.Number,
                orderId: order.ID
              });
            }
          }
        });
        
        setCustomers(Array.from(uniqueCustomers.values()));
      } catch (error: any) {
        console.error('Error fetching customers:', error);
        toast({
          title: "Error",
          description: "Failed to load customers",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [toast]);

  // Query for fraud check
  const { data: fraudData, isLoading: isCheckingFraud, refetch } = useQuery({
    queryKey: ['fraud-check', selectedCustomer?.phone],
    queryFn: () => checkPhoneFraud(selectedCustomer!.phone),
    enabled: false,
    retry: false,
  });

  const handleCheckCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    refetch();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'safe':
      case 'verified':
        return 'default';
      case 'fraud':
      case 'suspicious':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'safe':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'fraud':
      case 'suspicious':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return <Loading className="min-h-96" text="Loading customers..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-red-500" />
          Frauds Check
        </h1>
        <p className="text-muted-foreground">Check customer fraud status and delivery history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customers ({customers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {customers.map((customer, index) => (
                <div 
                  key={`${customer.phone}-${index}`}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCheckCustomer(customer)}
                    disabled={isCheckingFraud}
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Check
                  </Button>
                </div>
              ))}
              {customers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No customers found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Fraud Check Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Fraud Check Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedCustomer ? (
              <div className="text-center py-8 text-muted-foreground">
                Select a customer to check fraud status
              </div>
            ) : isCheckingFraud ? (
              <div className="flex justify-center py-8">
                <Loading size="lg" text="Checking fraud status..." />
              </div>
            ) : fraudData ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  </div>
                  <Badge variant={getStatusColor(fraudData.status)} className="flex items-center gap-1">
                    {getStatusIcon(fraudData.status)}
                    {fraudData.status || 'Unknown'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fraudData.delivery_count !== undefined && (
                    <div className="bg-white border rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-600">Delivery Count</p>
                      <p className="text-lg font-semibold">{fraudData.delivery_count}</p>
                    </div>
                  )}

                  {fraudData.risk_score !== undefined && (
                    <div className="bg-white border rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-600">Risk Score</p>
                      <p className="text-lg font-semibold">{fraudData.risk_score}/100</p>
                    </div>
                  )}
                </div>

                {fraudData.last_delivery && (
                  <div className="bg-white border rounded-lg p-3">
                    <p className="font-medium text-sm text-gray-600">Last Delivery</p>
                    <p className="text-sm">{new Date(fraudData.last_delivery).toLocaleDateString()}</p>
                  </div>
                )}

                {fraudData.notes && (
                  <div className="bg-white border rounded-lg p-3">
                    <p className="font-medium text-sm text-gray-600">Notes</p>
                    <p className="text-sm">{fraudData.notes}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500 pt-2 border-t">
                  Checked at: {new Date().toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-500">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>Failed to check fraud status</p>
                <p className="text-xs text-muted-foreground">Please try again later</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FraudsCheck;
