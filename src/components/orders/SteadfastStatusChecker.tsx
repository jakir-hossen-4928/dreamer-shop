
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Search, RefreshCw, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  getStatusByConsignmentId, 
  getStatusByInvoice, 
  getStatusByTrackingCode,
  getCurrentBalance,
  SteadfastStatusResponse,
  SteadfastBalanceResponse
} from '@/api/steadfast';

interface SteadfastStatusCheckerProps {
  className?: string;
}

const SteadfastStatusChecker: React.FC<SteadfastStatusCheckerProps> = ({ className }) => {
  const [loading, setLoading] = useState(false);
  const [statusType, setStatusType] = useState<'consignment' | 'invoice' | 'tracking'>('tracking');
  const [searchValue, setSearchValue] = useState('');
  const [statusResult, setStatusResult] = useState<SteadfastStatusResponse | null>(null);
  const [balance, setBalance] = useState<SteadfastBalanceResponse | null>(null);

  const getStatusLabel = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: any } } = {
      'pending': { label: 'Pending', variant: 'secondary' },
      'delivered_approval_pending': { label: 'Delivered (Pending Approval)', variant: 'default' },
      'partial_delivered_approval_pending': { label: 'Partially Delivered (Pending Approval)', variant: 'default' },
      'cancelled_approval_pending': { label: 'Cancelled (Pending Approval)', variant: 'destructive' },
      'unknown_approval_pending': { label: 'Unknown (Pending Approval)', variant: 'secondary' },
      'delivered': { label: 'Delivered', variant: 'default' },
      'partial_delivered': { label: 'Partially Delivered', variant: 'default' },
      'cancelled': { label: 'Cancelled', variant: 'destructive' },
      'hold': { label: 'Hold', variant: 'secondary' },
      'in_review': { label: 'In Review', variant: 'secondary' },
      'unknown': { label: 'Unknown', variant: 'secondary' },
    };
    return statusMap[status] || { label: status, variant: 'secondary' };
  };

  const handleCheckStatus = async () => {
    if (!searchValue.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a value to search',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      let result: SteadfastStatusResponse;
      
      switch (statusType) {
        case 'consignment':
          result = await getStatusByConsignmentId(searchValue.trim());
          break;
        case 'invoice':
          result = await getStatusByInvoice(searchValue.trim());
          break;
        case 'tracking':
          result = await getStatusByTrackingCode(searchValue.trim());
          break;
        default:
          throw new Error('Invalid status type');
      }

      setStatusResult(result);
      toast({
        title: 'Status Retrieved',
        description: `Delivery status: ${result.delivery_status}`,
      });
    } catch (error: any) {
      console.error('Error checking status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to check delivery status',
        variant: 'destructive',
      });
      setStatusResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBalance = async () => {
    setLoading(true);
    try {
      const result = await getCurrentBalance();
      setBalance(result);
      toast({
        title: 'Balance Retrieved',
        description: `Current balance: ৳${result.current_balance}`,
      });
    } catch (error: any) {
      console.error('Error checking balance:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to check balance',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Steadfast Status Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="status-type">Check By</Label>
              <Select value={statusType} onValueChange={(value: any) => setStatusType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tracking">Tracking Code</SelectItem>
                  <SelectItem value="invoice">Invoice ID</SelectItem>
                  <SelectItem value="consignment">Consignment ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="search-value">
                {statusType === 'tracking' ? 'Tracking Code' : 
                 statusType === 'invoice' ? 'Invoice ID' : 'Consignment ID'}
              </Label>
              <Input
                id="search-value"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={`Enter ${statusType === 'tracking' ? 'tracking code' : 
                            statusType === 'invoice' ? 'invoice ID' : 'consignment ID'}`}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleCheckStatus} disabled={loading} className="w-full">
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Check Status
              </Button>
            </div>
          </div>

          {statusResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Delivery Status:</span>
                <Badge variant={getStatusLabel(statusResult.delivery_status).variant}>
                  {getStatusLabel(statusResult.delivery_status).label}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Account Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {balance ? (
                <div>
                  <p className="text-2xl font-bold">৳{balance.current_balance.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Click to check your current balance</p>
              )}
            </div>
            <Button onClick={handleCheckBalance} disabled={loading} variant="outline">
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Check Balance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SteadfastStatusChecker;
