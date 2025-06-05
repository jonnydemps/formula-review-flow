
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const { user, signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasRedirected, setHasRedirected] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  console.log('SignIn page - isLoading:', isLoading, 'user:', user?.email, 'role:', user?.role);
  console.log('SignIn page - current location:', window.location.pathname);

  // When component mounts, clear any saved credentials in the form
  useEffect(() => {
    // Reset any autofilled values by browser
    const emailInput = document.querySelector('input[name="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
    
    if (emailInput) emailInput.value = '';
    if (passwordInput) passwordInput.value = '';
  }, []);

  // Handle authenticated user redirection - redirect immediately when user is detected
  useEffect(() => {
    if (user && !hasRedirected) {
      console.log('SignIn: Authenticated user detected, redirecting immediately');
      console.log('SignIn: User role:', user.role);
      setHasRedirected(true);
      
      // Use setTimeout to ensure state updates don't interfere
      setTimeout(() => {
        if (user.role === 'admin') {
          console.log('SignIn: Redirecting to admin dashboard');
          window.location.replace('/admin-dashboard');
        } else {
          console.log('SignIn: Redirecting to customer dashboard');
          window.location.replace('/customer-dashboard');
        }
      }, 100);
    }
  }, [user, hasRedirected]);

  const onSubmit = async (data: FormValues) => {
    setAuthError(null);
    setIsSubmitting(true);
    
    try {
      console.log('SignIn: Attempting to sign in with:', data.email);
      const response = await signIn(data.email, data.password);
      
      // Check if there was an error from the sign in process
      if ('error' in response) {
        console.log('SignIn: Error in response:', response.error.message);
        setAuthError(response.error.message);
      } else {
        console.log('SignIn: Success response received');
        // Success case - the useEffect above will handle the redirect
      }
      
    } catch (error: any) {
      console.error('Sign in submission error:', error);
      setAuthError(error.message || 'Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If user is authenticated, show redirecting message
  if (user) {
    console.log('SignIn: User authenticated, showing redirect message');
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // If auth is still loading, show loading state
  if (isLoading) {
    console.log('SignIn: Showing auth loading state');
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-500 mb-4" />
          <p className="text-gray-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  console.log('SignIn: Rendering sign-in form');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
          <CardDescription>Enter your email and password to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(onSubmit)} 
              className="space-y-4"
              autoComplete="off"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="you@example.com" 
                        type="email" 
                        autoComplete="new-email"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="••••••••" 
                        type="password" 
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
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
            </form>
          </Form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/sign-up" className="text-blue-600 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
