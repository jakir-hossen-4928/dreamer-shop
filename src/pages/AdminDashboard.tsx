import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUsers, getOrders } from '@/services/firestore';
import { User, Order } from '@/types';
import { Users, ShoppingCart, TrendingUp, AlertCircle, UserCheck, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
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
      const [usersData, ordersData] = await Promise.all([
        getUsers(),
        getOrders()
      ]);

      setUsers(usersData);
      setOrders(ordersData.orders);

      // Calculate stats
      const verifiedUsers = usersData.filter(u => u.Status === 'Verified').length;
      const pendingOrders = ordersData.orders.filter(o => o.Status === 'Pending').length;
      const confirmedOrders = ordersData.orders.filter(o => o.Status === 'Confirmed').length;
      const totalRevenue = ordersData.orders
        .filter(o => o.Status === 'Confirmed')
        .reduce((sum, o) => sum + o.Amount, 0);

      setStats({
        totalUsers: usersData.length,
        verifiedUsers,
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.verifiedUsers} verified users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending, {stats.confirmedOrders} confirmed
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

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Users</span>
                <Badge variant="secondary">{stats.totalUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Verified Users</span>
                <Badge variant="default">{stats.verifiedUsers}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Unverified Users</span>
                <Badge variant="destructive">{stats.totalUsers - stats.verifiedUsers}</Badge>
              </div>
              <Button asChild className="w-full">
                <Link to="/users">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Manage Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Management
            </CardTitle>
            <CardDescription>
              View and manage customer orders
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
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.ID} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{user.Name}</p>
                    <p className="text-xs text-muted-foreground">{user.Email}</p>
                  </div>
                  <Badge variant={user.Status === 'Verified' ? 'default' : 'destructive'}>
                    {user.Status}
                  </Badge>
                </div>
              ))}
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

export default AdminDashboard;
