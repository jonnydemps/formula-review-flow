import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FileUploader from '@/components/FileUploader';
import StatusBadge, { FormulStatus } from '@/components/StatusBadge';
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

// Mock formula data type
interface Formula {
  id: string;
  name: string;
  uploadDate: string;
  status: FormulStatus;
  quote?: number;
  reportUrl?: string;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [showUploader, setShowUploader] = useState(false);

  // Protect route - redirect if not authenticated or not a customer
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'customer') {
      navigate('/specialist-dashboard');
    }
  }, [user, navigate]);

  // Mock initial formulas
  useEffect(() => {
    // Simulate loading data from API/database
    const mockFormulas: Formula[] = [
      {
        id: '1',
        name: 'Natural Face Cream.xlsx',
        uploadDate: '2025-04-20',
        status: 'pending'
      },
      {
        id: '2',
        name: 'Organic Shampoo Formula.xls',
        uploadDate: '2025-04-19',
        status: 'quote',
        quote: 75
      },
      {
        id: '3',
        name: 'Anti-Aging Serum.xlsx',
        uploadDate: '2025-04-15',
        status: 'paid',
        quote: 120,
        reportUrl: '#report-3'
      }
    ];
    
    setFormulas(mockFormulas);
  }, []);

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    
    // Simulate file upload with delay
    try {
      // This would be an actual file upload to Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new formula to the list
      const newFormula: Formula = {
        id: `formula-${Date.now()}`,
        name: file.name,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      setFormulas([newFormula, ...formulas]);
      setShowUploader(false);
      toast.success('Formula uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload formula');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAcceptQuote = (id: string, quote: number) => {
    // In a real implementation, this would redirect to Stripe payment
    toast.success(`Redirecting to payment for $${quote}...`);
    
    // Mock payment success after delay
    setTimeout(() => {
      setFormulas(formulas.map(formula => 
        formula.id === id 
          ? {...formula, status: 'paid', reportUrl: '#report-' + id} 
          : formula
      ));
      toast.success('Payment successful! Your report will be ready soon.');
    }, 2000);
  };

  if (!user) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="ra-container">
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
                  <FileUploader onFileSelected={handleFileUpload} />
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
                {formulas.length > 0 ? (
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
                            
                            {formula.status === 'paid' && formula.reportUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <a href={formula.reportUrl} target="_blank" rel="noopener noreferrer">
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
