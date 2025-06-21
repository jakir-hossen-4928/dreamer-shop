import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrders } from '@/services/firestore';
import { Order } from '@/types';
import { ShoppingCart, Package, TrendingUp, User } from 'lucide-react';

const DEMO_USER = {
  Name: "Demo User",
  Email: "demo@example.com",
  Number: "01900000000",
  Role: "User",
  Status: "Verified",
};

const UserDashboard: React.FC = () => {
  const user = DEMO_USER;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserOrders();
    // eslint-disable-next-line
  }, []);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      // For demo/public, get all orders
      const ordersData = await getOrders();
      setOrders(ordersData.orders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.Name}!</h1>
        <p className="text-muted-foreground">Here's your account overview and recent activity.</p>
      </div>

      {/* User Info Card */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.Status}</div>
            <p className="text-xs text-muted-foreground">
              Account verification status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.Role}</div>
            <p className="text-xs text-muted-foreground">
              Your account role
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">
              Total orders in system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">{user?.Name}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{user?.Email}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number</label>
                <p className="text-sm text-muted-foreground">{user?.Number}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div>
                  <Badge variant={user?.Status === 'Verified' ? 'default' : 'destructive'}>
                    {user?.Status}
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" disabled>
              Edit Profile (disabled)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Activity</CardTitle>
          <CardDescription>Latest orders in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.ID} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{order.ID}</p>
                  <p className="text-xs text-muted-foreground">{order.Name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">৳{order.Amount.toLocaleString()}</p>
                  <Badge variant={order.Status === 'Confirmed' ? 'default' : 'secondary'}>
                    {order.Status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
