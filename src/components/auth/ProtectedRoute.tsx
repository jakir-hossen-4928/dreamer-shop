
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('[ProtectedRoute] Current user:', user);
  console.log('[ProtectedRoute] Loading state:', loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You must be logged in to access this page.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/login')} className="flex-1">
                Login
              </Button>
              <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
                Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.Status !== 'Verified') {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Account Not Verified
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your account needs to be verified by an administrator before you can access this area.
            </p>
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm text-amber-800">
                Current Status: <span className="font-semibold">{user.Status}</span>
              </p>
            </div>
            <Button onClick={() => navigate('/verification-pending')} className="w-full">
              View Status
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
