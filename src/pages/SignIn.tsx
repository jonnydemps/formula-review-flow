
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, AtSign, KeyRound, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect authenticated users away from sign in page
  useEffect(() => {
    if (user && !isLoading) {
      // Redirect based on user role
      console.log('Sign in page: User already authenticated, redirecting');
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/customer-dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    // Clear any previous error when user starts typing again
    if (error) setError(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear any previous error when user starts typing again
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      console.log('Sign in form submitted for:', email);
      
      if (!email || !password) {
        setError('Email and password are required');
        setIsSubmitting(false);
        return;
      }
      
      await signIn(email, password);
      console.log('Sign in success, waiting for auth context update');
      // No need to navigate here, the auth context will handle navigation after sign in
      
    } catch (err: any) {
      console.error('Sign in submit error:', err);
      setError(err?.message || 'Failed to sign in');
      // Don't toast here, as the auth service already handles that
    } finally {
      setIsSubmitting(false);
    }
  };

  // If still checking auth state, show loading
  if (isLoading && !isSubmitting) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-500">Checking authentication...</p>
            <p className="text-xs text-gray-400 mt-2">If this takes too long, please refresh the page</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <CardDescription>
                Enter your email and password to access your account
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="email"
                      id="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={email}
                      onChange={handleEmailChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="password"
                      id="password"
                      placeholder="•••••••••"
                      className="pl-10"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <p className="mt-4 text-center text-sm text-gray-500">
                  Don't have an account?{' '}
                  <Link to="/sign-up" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignIn;
