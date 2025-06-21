import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getOrders } from '@/services/firestore';
import { Order } from '@/types';
import { ShoppingCart, TrendingUp, AlertCircle, Package, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ModeratorDashboard: React.FC = () => {
  // No user prop
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const ordersData = await getOrders();
      setOrders(ordersData.orders);

      // Calculate stats
      const pendingOrders = ordersData.orders.filter(o => o.Status === 'Pending').length;
      const confirmedOrders = ordersData.orders.filter(o => o.Status === 'Confirmed').length;
      const totalRevenue = ordersData.orders
        .filter(o => o.Status === 'Confirmed')
        .reduce((sum, o) => sum + o.Amount, 0);

      setStats({
        totalOrders: ordersData.orders.length,
        pendingOrders,
        confirmedOrders,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderator Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage orders and track performance.</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Link to="/orders">
            <Plus className="h-4 w-4 mr-2" />
            Add New Order
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              All time orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Orders</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.confirmedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From confirmed orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Order Management Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Management
            </CardTitle>
            <CardDescription>
              Manage customer orders and track status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Pending Orders</span>
                <Badge variant="secondary">{stats.pendingOrders}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Confirmed Orders</span>
                <Badge variant="default">{stats.confirmedOrders}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Revenue</span>
                <Badge variant="outline">৳{stats.totalRevenue.toLocaleString()}</Badge>
              </div>
              <Button asChild className="w-full">
                <Link to="/orders">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Manage Orders
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest customer orders</CardDescription>
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
    </div>
  );
};

export default ModeratorDashboard;

// File is getting long; consider refactor!
