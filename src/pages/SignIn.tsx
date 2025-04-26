
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TestTube, LogIn } from 'lucide-react';

const SignIn: React.FC = () => {
  const { user, signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // If already authenticated, redirect to appropriate dashboard
  if (user) {
    return <Navigate to={user.role === 'specialist' ? '/specialist-dashboard' : '/customer-dashboard'} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      await signIn(email, password);
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Demo accounts for testing
  const fillDemoAccount = (type: 'customer' | 'specialist') => {
    if (type === 'customer') {
      setEmail('customer@example.com');
      setPassword('password123');
    } else {
      setEmail('specialist@example.com');
      setPassword('password123');
    }
  };

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
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
                <LogIn className="ml-2 h-4 w-4" />
              </Button>
              
              <div className="text-sm text-center text-gray-500">
                Don't have an account?{' '}
                <Link to="/sign-up" className="text-ra-blue hover:underline">
                  Sign Up
                </Link>
              </div>

              <div className="border-t pt-4 text-sm text-center text-gray-500">
                <p className="mb-2">Demo Accounts:</p>
                <div className="flex gap-2 justify-center">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => fillDemoAccount('customer')}
                  >
                    Customer Demo
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => fillDemoAccount('specialist')}
                  >
                    Specialist Demo
                  </Button>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;
