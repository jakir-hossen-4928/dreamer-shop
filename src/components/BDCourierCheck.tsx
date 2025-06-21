
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { checkPhoneFraud } from '@/utils/bdcourierApi';
import Loading from '@/components/ui/loading';
import { useToast } from '@/hooks/use-toast';

const BDCourierCheck: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [shouldCheck, setShouldCheck] = useState(false);
  const { toast } = useToast();

  const { data: courierData, isLoading, error, refetch } = useQuery({
    queryKey: ['bd-courier-check', phoneNumber],
    queryFn: () => checkPhoneFraud(phoneNumber),
    enabled: shouldCheck && phoneNumber.length >= 11,
    retry: false,
  });

  const handleCheck = () => {
    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter a phone number to check",
        variant: "destructive"
      });
      return;
    }

    if (phoneNumber.length < 11) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 11-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setShouldCheck(true);
    refetch();
  };

  const handleReset = () => {
    setPhoneNumber('');
    setShouldCheck(false);
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
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">BD Courier Check</h1>
        <p className="text-muted-foreground">Check courier delivery status and fraud detection</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="01712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={11}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter 11-digit Bangladeshi phone number
              </p>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleCheck} disabled={isLoading} className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                {isLoading ? 'Checking...' : 'Check'}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="flex justify-center py-8">
              <Loading size="lg" text="Checking courier status..." />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium text-red-800">Error</span>
              </div>
              <p className="text-red-700 mt-1">
                Failed to check courier status. Please try again later.
              </p>
            </div>
          )}

          {courierData && !isLoading && (
            <div className="bg-gray-50 border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Courier Check Results</h3>
                <Badge variant={getStatusColor(courierData.status)} className="flex items-center gap-1">
                  {getStatusIcon(courierData.status)}
                  {courierData.status || 'Unknown'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <p className="text-sm font-mono bg-white rounded px-2 py-1 border">
                    {phoneNumber}
                  </p>
                </div>

                {courierData.delivery_count !== undefined && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Delivery Count</Label>
                    <p className="text-sm bg-white rounded px-2 py-1 border">
                      {courierData.delivery_count} deliveries
                    </p>
                  </div>
                )}

                {courierData.last_delivery && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Delivery</Label>
                    <p className="text-sm bg-white rounded px-2 py-1 border">
                      {new Date(courierData.last_delivery).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {courierData.risk_score !== undefined && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Risk Score</Label>
                    <p className="text-sm bg-white rounded px-2 py-1 border">
                      {courierData.risk_score}/100
                    </p>
                  </div>
                )}
              </div>

              {courierData.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Additional Notes</Label>
                  <p className="text-sm bg-white rounded px-3 py-2 border mt-1">
                    {courierData.notes}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500 pt-2 border-t">
                Checked at: {new Date().toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BDCourierCheck;
