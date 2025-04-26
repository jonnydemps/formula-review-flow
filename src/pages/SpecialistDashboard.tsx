
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import StatusBadge, { FormulStatus } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  FileDown,
  Download,
  File,
  DollarSign,
  FileCheck,
  Search,
  Clipboard
} from 'lucide-react';

// Mock formula data type with additional fields for the specialist
interface Formula {
  id: string;
  name: string;
  uploadDate: string;
  status: FormulStatus;
  customerName: string;
  customerEmail: string;
  quote?: number;
  reviewNotes?: string;
  ingredients?: Ingredient[];
  reportUrl?: string;
}

interface Ingredient {
  id: string;
  name: string;
  percentage?: string;
  compliant: boolean;
  notes?: string;
}

const SpecialistDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [quoteAmount, setQuoteAmount] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  
  // Protect route - redirect if not authenticated or not a specialist
  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    } else if (user.role !== 'specialist') {
      navigate('/customer-dashboard');
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
        status: 'pending',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah@example.com',
        ingredients: [
          { id: 'ing-1', name: 'Water', percentage: '70%', compliant: true },
          { id: 'ing-2', name: 'Glycerin', percentage: '5%', compliant: true },
          { id: 'ing-3', name: 'Sodium Lauryl Sulfate', percentage: '2%', compliant: false, notes: 'Exceeds maximum concentration' },
          { id: 'ing-4', name: 'Fragrance', percentage: '0.5%', compliant: true },
        ]
      },
      {
        id: '2',
        name: 'Organic Shampoo Formula.xls',
        uploadDate: '2025-04-19',
        status: 'quote',
        customerName: 'Mike Brown',
        customerEmail: 'mike@example.com',
        quote: 75,
        ingredients: [
          { id: 'ing-5', name: 'Aloe Vera Extract', percentage: '10%', compliant: true },
          { id: 'ing-6', name: 'Coconut Oil', percentage: '3%', compliant: true },
          { id: 'ing-7', name: 'Vitamin E', percentage: '0.5%', compliant: true },
        ],
        reviewNotes: 'Formula appears compliant with some minor suggestions.'
      },
      {
        id: '3',
        name: 'Anti-Aging Serum.xlsx',
        uploadDate: '2025-04-15',
        status: 'paid',
        customerName: 'Emily Davis',
        customerEmail: 'emily@example.com',
        quote: 120,
        reviewNotes: 'Complete compliance check performed. Two ingredients require modifications.',
        reportUrl: '#report-3',
        ingredients: [
          { id: 'ing-8', name: 'Hyaluronic Acid', percentage: '1%', compliant: true },
          { id: 'ing-9', name: 'Retinol', percentage: '0.3%', compliant: true },
          { id: 'ing-10', name: 'Vitamin C', percentage: '5%', compliant: true },
        ]
      }
    ];
    
    setFormulas(mockFormulas);
  }, []);

  const handleReviewFormula = (formula: Formula) => {
    setSelectedFormula(formula);
    setReviewNotes(formula.reviewNotes || '');
    setIngredients(formula.ingredients || []);
    setShowReviewDialog(true);
  };

  const handleSendQuote = (formula: Formula) => {
    if (!quoteAmount || isNaN(Number(quoteAmount))) {
      toast.error('Please enter a valid quote amount');
      return;
    }
    
    // Update formula with quote
    const updatedFormulas = formulas.map(f => 
      f.id === formula.id 
        ? { ...f, quote: Number(quoteAmount), status: 'quote' as FormulStatus } 
        : f
    );
    
    setFormulas(updatedFormulas);
    toast.success(`Quote of $${quoteAmount} sent to ${formula.customerName}`);
    setQuoteAmount('');
    setSelectedFormula(null);
  };

  const handleUpdateIngredient = (id: string, field: keyof Ingredient, value: string | boolean) => {
    setIngredients(ingredients.map(ing => 
      ing.id === id ? { ...ing, [field]: value } : ing
    ));
  };

  const handleSaveReview = () => {
    if (selectedFormula) {
      const updatedFormulas = formulas.map(f => 
        f.id === selectedFormula.id 
          ? { 
              ...f, 
              reviewNotes, 
              ingredients,
            } 
          : f
      );
      
      setFormulas(updatedFormulas);
      toast.success('Review saved successfully');
      setShowReviewDialog(false);
    }
  };

  const handleGenerateReport = (formula: Formula) => {
    // In a real app, this would generate a PDF and store it
    toast.success('Generating report...');
    
    // Mock report generation
    setTimeout(() => {
      const updatedFormulas = formulas.map(f => 
        f.id === formula.id 
          ? { 
              ...f, 
              reportUrl: `#report-${formula.id}` 
            } 
          : f
      );
      
      setFormulas(updatedFormulas);
      toast.success('Report generated and available for customer');
    }, 2000);
  };

  const filteredFormulas = formulas.filter(formula => {
    return (
      formula.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formula.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      formula.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (!user) {
    return null; // Don't render anything while checking authentication
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow bg-gray-50">
        <div className="ra-container">
          <div className="py-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Specialist Dashboard</h1>
                <p className="text-gray-600">
                  Review formulas, create quotes, and generate reports
                </p>
              </div>
              
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search formulas..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {/* Formulas List */}
            <Card>
              <CardHeader>
                <CardTitle>Submitted Formulas</CardTitle>
                <CardDescription>
                  Review customer formula submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFormulas.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formula Name</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFormulas.map((formula) => (
                        <TableRow key={formula.id}>
                          <TableCell>{formula.name}</TableCell>
                          <TableCell>{formula.uploadDate}</TableCell>
                          <TableCell>
                            <div>
                              <div>{formula.customerName}</div>
                              <div className="text-xs text-gray-500">{formula.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={formula.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href="#download" onClick={(e) => e.preventDefault()}>
                                  <FileDown className="h-4 w-4" />
                                </a>
                              </Button>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReviewFormula(formula)}
                              >
                                <Clipboard className="h-4 w-4" />
                              </Button>
                              
                              {formula.status === 'pending' && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button size="sm">
                                      <DollarSign className="mr-1 h-4 w-4" />
                                      Quote
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Create Quote</DialogTitle>
                                      <DialogDescription>
                                        Send a price quote to {formula.customerName}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                      <div className="mb-4 text-sm">
                                        <div className="font-medium mb-1">Formula</div>
                                        <div className="text-gray-700">{formula.name}</div>
                                      </div>
                                      <div className="mb-4">
                                        <label className="text-sm font-medium mb-1 block">
                                          Quote Amount (USD)
                                        </label>
                                        <div className="relative">
                                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                                          <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="pl-9"
                                            value={quoteAmount}
                                            onChange={(e) => setQuoteAmount(e.target.value)}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <DialogFooter>
                                      <Button 
                                        variant="outline" 
                                        onClick={() => setQuoteAmount('')}
                                      >
                                        Cancel
                                      </Button>
                                      <Button 
                                        onClick={() => handleSendQuote(formula)}
                                      >
                                        Send Quote
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>
                              )}
                              
                              {formula.status === 'paid' && !formula.reportUrl && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleGenerateReport(formula)}
                                >
                                  <FileCheck className="mr-1 h-4 w-4" />
                                  Generate Report
                                </Button>
                              )}
                              
                              {formula.reportUrl && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={formula.reportUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-1 h-4 w-4" />
                                    Report
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No formulas found matching your search</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Formula</DialogTitle>
            <DialogDescription>
              {selectedFormula?.name} - Submitted by {selectedFormula?.customerName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Review Notes</h4>
              <Textarea
                placeholder="Enter your review notes..."
                className="min-h-[100px]"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2">Ingredients</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Compliant</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell>{ingredient.name}</TableCell>
                      <TableCell>
                        <Input 
                          type="text" 
                          value={ingredient.percentage || ''} 
                          onChange={(e) => handleUpdateIngredient(ingredient.id, 'percentage', e.target.value)} 
                          className="max-w-[80px]"
                        />
                      </TableCell>
                      <TableCell>
                        <select 
                          value={ingredient.compliant ? 'yes' : 'no'}
                          onChange={(e) => handleUpdateIngredient(
                            ingredient.id, 
                            'compliant', 
                            e.target.value === 'yes'
                          )}
                          className="border rounded p-1"
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="text" 
                          value={ingredient.notes || ''} 
                          onChange={(e) => handleUpdateIngredient(ingredient.id, 'notes', e.target.value)} 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIngredients([
                    ...ingredients,
                    {
                      id: `ing-${Date.now()}`,
                      name: '',
                      percentage: '',
                      compliant: true
                    }
                  ]);
                }}
              >
                Add Ingredient
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveReview}>
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default SpecialistDashboard;
