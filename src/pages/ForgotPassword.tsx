
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { requestPasswordReset } = useAuth();

  // Set page title
  React.useEffect(() => {
    document.title = 'Forgot Password - Reset Your Password';
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (!emailRegex.test(e.target.value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emailError || !email) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to Send Reset Email",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-full shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Forgot Password?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Enter your email to receive password reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {!submitted ? (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  {emailError && (
                    <div className="text-red-600 text-sm flex items-center gap-1">
                      {emailError}
                    </div>
                  )}
                </div>
                
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading || Boolean(emailError)}
                >
                  {loading ? "Sending Email..." : "Send Reset Email"}
                </Button>
                
                <div className="text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-4 py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium mb-2">Reset Email Sent!</p>
                  <p className="text-green-700 text-sm">
                    Check your email inbox for password reset instructions. 
                    Click the link in the email to reset your password.
                  </p>
                </div>
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
