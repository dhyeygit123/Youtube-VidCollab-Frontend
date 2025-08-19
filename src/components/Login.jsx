import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Video, User, LogOut, ChevronLeft, ChevronRight, Check, X, ExternalLink, Filter, SortAsc, SortDesc, Clock, AlertCircle } from 'lucide-react';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const CustomAlert = ({ message, type }) => {
  if (!message) return null;

  return (
    <Alert className={`mb-4 ${type === 'success' ? 'border-green-200 bg-green-50' : 
                      type === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                      'border-red-200 bg-red-50'}`}>
      <AlertCircle className={`h-4 w-4 ${type === 'success' ? 'text-green-600' : 
                               type === 'pending' ? 'text-yellow-600' :
                               'text-red-600'}`} />
      <AlertDescription className={`${type === 'success' ? 'text-green-700' : 
                                     type === 'pending' ? 'text-yellow-700' :
                                     'text-red-700'}`}>
        {message}
      </AlertDescription>
    </Alert>
  );
};

function Login({ setCurrentPage, setUser }) {
  const [role, setRole] = useState('youtuber');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [youtuberId, setYoutuberId] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e, endpoint) => {
    e.preventDefault();
    setLoading(true);
    setNotification({ message: '', type: '' });
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          role, 
          youtuberId: role === 'editor' ? youtuberId : undefined 
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Error occurred');
      }

      // Handle successful signup/login
      if (data.pending) {
        // Editor signup is pending approval
        setNotification({ 
          message: data.message, 
          type: 'pending' 
        });
        // Clear form
        setEmail('');
        setPassword('');
        setYoutuberId('');
      } else {
        // Normal login/signup flow
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setUser({ role: data.role });
        setCurrentPage(data.role === 'youtuber' ? 'dashboard' : 'upload');
        setNotification({ 
          message: `${endpoint === 'signup' ? 'Signed up' : 'Logged in'} successfully`, 
          type: 'success' 
        });
      }
    } catch (error) {
      setNotification({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email.trim() && password.trim() && (role !== 'editor' || youtuberId.trim());

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold pb-8 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CustomAlert message={notification.message} type={notification.type} />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtuber">YouTuber</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            {role === 'editor' && (
              <div className="space-y-2">
                <Label htmlFor="youtuberId" className="text-sm font-medium text-gray-700">
                  YouTuber ID
                  <span className="text-xs text-gray-500 ml-2">(provided in invitation email)</span>
                </Label>
                <Input
                  id="youtuberId"
                  type="text"
                  value={youtuberId}
                  onChange={(e) => setYoutuberId(e.target.value)}
                  className="w-full"
                  placeholder="Enter YouTuber's ID from invitation"
                  required={role === 'editor'}
                />
                <p className="text-xs text-gray-500">
                  This ID was provided in your invitation email from the YouTuber
                </p>
              </div>
            )}

            {/* Info card for editor signup */}
            {role === 'editor' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Editor Signup Process</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Your signup will be sent to the YouTuber for approval</li>
                      <li>• You'll receive an email once approved/denied</li>
                      <li>• The YouTuber has 7 days to respond</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col space-y-3 pt-2">
              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'login')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5"
                disabled={loading || !isFormValid}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={(e) => handleSubmit(e, 'signup')}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5"
                disabled={loading || !isFormValid}
              >
                {loading ? "Creating account..." : 
                 role === 'editor' ? "Request to Join Team" : "Create Account"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;