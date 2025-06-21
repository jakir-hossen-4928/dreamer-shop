
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock } from 'lucide-react';

const VerificationPending: React.FC = () => {
  // Set page title
  React.useEffect(() => {
    document.title = 'Account Verification Pending';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-full shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Account Created Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 text-center space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <CheckCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-amber-800 mb-3">
                Verification Required
              </h3>
              <p className="text-amber-700 text-sm leading-relaxed">
                Your account has been created successfully! However, an admin needs to verify 
                your account before you can log in.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>What happens next?</strong><br />
                Once an admin verifies your account, you'll be able to log in successfully. 
                This process helps us maintain security and ensure all users are legitimate.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                asChild
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Link to="/login">
                  Try Logging In
                </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline"
                className="w-full border-gray-200 hover:bg-gray-50"
              >
                <Link to="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerificationPending;
