import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingCart, 
  Package, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Index = () => {
  // No authentication - always show public view
  const user = null;

  const features = [
    {
      icon: ShoppingCart,
      title: 'Order Management',
      description: 'Complete CRUD operations for managing customer orders efficiently'
    },
    {
      icon: Package,
      title: 'Steadfast Integration',
      description: 'Seamless integration with Steadfast courier for order tracking'
    },
    {
      icon: TrendingUp,
      title: 'BD Courier Check',
      description: 'Order ratio checking with BD Courier for fraud prevention'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Industry-grade security with JWT tokens and role-based access'
    },
    {
      icon: Zap,
      title: 'Bulk Operations',
      description: 'Handle multiple orders, invoices, and courier operations at once'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Admin dashboard for managing users and their permissions'
    }
  ];

  const benefits = [
    'Real-time order tracking and status updates',
    'Automated invoice generation with PDF download',
    'Bulk order processing for efficiency',
    'Mobile-responsive design for any device',
    'SEO optimized for better visibility',
    'Comprehensive fraud detection system'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl">Dreamer Shop</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Dreamer Shop
            </span>
            <br />
            Order Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete order management solution with Steadfast integration, invoice generation, 
            and fraud detection. Built for modern e-commerce businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Everything you need to manage your orders efficiently and grow your business
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-3 rounded-lg w-fit">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Why Choose Dreamer Shop?</h2>
              <p className="text-blue-100 max-w-2xl mx-auto">
                Built with modern technologies and best practices for scalability and security
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                  <span className="text-blue-50">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Dreamer Shop to streamline their order management process.
            </p>
            <Button size="lg" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600">
              <Link to="/signup">
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold">Dreamer Shop</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2024 Dreamer Shop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
