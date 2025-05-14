
import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TestTube, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const SignIn: React.FC = () => {
  const { user, signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // If already authenticated, redirect to appropriate dashboard
  useEffect(() => {
    if (user) {
      console.log('User already authenticated, redirecting to dashboard');
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    console.log('Sign in form submitted for:', email);
    
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
      // No need to navigate here, the auth context will handle it
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading while initial auth check is happening
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-ra-blue" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md page-transition">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-ra-blue font-medium text-2xl">
            <TestTube className="h-6 w-6" />
            <span>SimplyRA</span>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <LogIn className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              
              <div className="text-sm text-center text-gray-500">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-ra-blue hover:underline">
                  Sign Up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
