
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Shield, Edit, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    Name: user?.Name || '',
    Email: user?.Email || '',
    Number: user?.Number || ''
  });

  // Set page title
  React.useEffect(() => {
    document.title = 'Profile - Manage Your Account';
  }, []);

  React.useEffect(() => {
    if (user) {
      setFormData({
        Name: user.Name,
        Email: user.Email,
        Number: user.Number
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSave = async () => {
    if (!formData.Name.trim() || !formData.Email.trim() || !formData.Number.trim()) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        Name: user.Name,
        Email: user.Email,
        Number: user.Number
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  Full Name
                </Label>
                {isEditing ? (
                  <Input
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-lg font-medium">{user.Name}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                {isEditing ? (
                  <Input
                    name="Email"
                    type="email"
                    value={formData.Email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-lg">{user.Email}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                {isEditing ? (
                  <Input
                    name="Number"
                    type="tel"
                    value={formData.Number}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    disabled={loading}
                  />
                ) : (
                  <p className="text-lg">{user.Number}</p>
                )}
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4" />
                  Role & Status
                </Label>
                <div className="flex gap-2">
                  <Badge variant={user.Role === 'Admin' ? 'default' : 'secondary'}>
                    {user.Role}
                  </Badge>
                  <Badge variant={user.Status === 'Verified' ? 'default' : 'destructive'}>
                    {user.Status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
