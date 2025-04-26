
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUploader from '@/components/FileUploader';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { FileUp, Download, DollarSign } from 'lucide-react';
import { Formula, getCustomerFormulas, uploadFormulaFile, createFormula, markFormulaPaid } from '@/services/formulaService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const queryClient = useQueryClient();

  // Protect route - redirect if not authenticated or not a customer
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'customer') {
      navigate('/specialist-dashboard');
    }
  }, [user, navigate]);

  // Fetch formulas for the customer
  const { data: formulas = [], isLoading, error } = useQuery({
    queryKey: ['formulas', user?.id],
    queryFn: () => user ? getCustomerFormulas(user.id) : Promise.resolve([]),
    enabled: !!user
  });

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, path }: { file: File, path: string }) => {
      if (!user) throw new Error('User not authenticated');
      
      // Upload file to storage
      const filePath = await uploadFormulaFile(file, path);
      
      // Create formula record in database
      return createFormula(user.id, filePath, file.name);
    },
    onSuccess: () => {
      setShowUploader(false);
      toast.success('Formula uploaded successfully');
      queryClient.invalidateQueries({ queryKey: ['formulas', user?.id] });
    },
    onError: (error) => {
      console.error('Upload error:', error);
      toast.error('Failed to upload formula');
    },
    onSettled: () => {
      setIsUploading(false);
    }
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: (formulaId: string) => markFormulaPaid(formulaId),
    onSuccess: () => {
      toast.success('Payment successful! Your report will be ready soon.');
      queryClient.invalidateQueries({ queryKey: ['formulas', user?.id] });
    },
    onError: (error) => {
      console.error('Payment error:', error);
      toast.error('Failed to process payment');
    }
  });

  const handleFileUpload = async (file: File, path: string) => {
    setIsUploading(true);
    uploadMutation.mutate({ file, path });
  };

  const handleAcceptQuote = (id: string, quote: number) => {
    // In a real implementation, this would redirect to Stripe payment
    toast.success(`Redirecting to payment for $${quote}...`);
    
    // Mock payment success after delay
    setTimeout(() => {
      paymentMutation.mutate(id);
    }, 2000);
  };

  if (!user) {
    return null; // Don't render anything while checking authentication
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-red-600">Error loading formulas</h2>
              <p className="mt-2 text-gray-600">Please try refreshing the page</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="py-8">
            <h1 className="text-3xl font-bold mb-2">Customer Dashboard</h1>
            <p className="text-gray-600 mb-6">
              Upload formulas, track reviews, and download reports
            </p>
            
            {/* Upload Section */}
            {showUploader ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Upload New Formula</CardTitle>
                  <CardDescription>
                    Submit your cosmetic formula Excel file for review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploader 
                    onFileSelected={handleFileUpload} 
                    isUploading={isUploading}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowUploader(false)} 
                    className="mr-2"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <div className="mb-8">
                <Button onClick={() => setShowUploader(true)}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload New Formula
                </Button>
              </div>
            )}
            
            {/* Formulas List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Formulas</CardTitle>
                <CardDescription>
                  Track the status of your formula reviews
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading your formulas...</p>
                  </div>
                ) : formulas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formula Name</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {formulas.map((formula) => (
                        <TableRow key={formula.id}>
                          <TableCell>{formula.name}</TableCell>
                          <TableCell>{formula.uploadDate}</TableCell>
                          <TableCell>
                            <StatusBadge status={formula.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {formula.status === 'quote' && formula.quote && (
                              <Button 
                                onClick={() => handleAcceptQuote(formula.id, formula.quote!)} 
                                size="sm"
                              >
                                <DollarSign className="mr-1 h-4 w-4" />
                                Pay ${formula.quote}
                              </Button>
                            )}
                            
                            {formula.status === 'paid' && (
                              <Button variant="outline" size="sm">
                                Report in Progress
                              </Button>
                            )}

                            {formula.status === 'completed' && (
                              <Button variant="outline" size="sm" asChild>
                                <a 
                                  href="#" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toast.success('Downloading report...');
                                  }}
                                >
                                  <Download className="mr-1 h-4 w-4" />
                                  Download Report
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't uploaded any formulas yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomerDashboard;
