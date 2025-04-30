
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // If the user is already logged in, redirect to the appropriate dashboard
  React.useEffect(() => {
    if (user) {
      if (user.email === 'john-dempsey@hotmail.co.uk') {
        navigate('/admin-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success("Signed in successfully");
      
      // Auth context will handle the redirect
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in');
      toast.error(err.message || 'Failed to sign in');
      setIsSubmitting(false);
    }
  };

  // Don't show the sign-in page if we're still checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    required 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="•••••••••" 
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex-col space-y-4">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !email || !password}
              onClick={handleSubmit}
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
              <LogIn className="ml-2 h-4 w-4" />
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link to="/sign-up" className="text-ra-blue hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default SignIn;
