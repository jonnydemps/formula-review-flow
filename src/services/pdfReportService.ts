
import jsPDF from 'jspdf';
import { Ingredient, ReviewData } from '@/services/review/types';

interface FormulaReportData {
  formula: any;
  reviewData: ReviewData;
  reviewerName: string;
  reviewDate: string;
}

export const generateFormulaPDF = (reportData: FormulaReportData): void => {
  const { formula, reviewData, reviewerName, reviewDate } = reportData;
  
  // Create new PDF document in landscape mode for better table display
  const doc = new jsPDF('landscape');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;
  
  // Colors matching the website theme
  const primaryBlue = '#0EA5E9';
  const darkGray = '#1F2937';
  const lightGray = '#6B7280';
  
  // Header with logo placeholder and company name
  doc.setFontSize(24);
  doc.setTextColor(primaryBlue);
  doc.text('SimplyRA', 20, yPosition);
  
  doc.setFontSize(12);
  doc.setTextColor(lightGray);
  doc.text('Regulatory Affairs & Compliance', 20, yPosition + 8);
  
  // Add a horizontal line
  doc.setDrawColor(primaryBlue);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition + 15, pageWidth - 20, yPosition + 15);
  
  yPosition += 30;
  
  // Report title
  doc.setFontSize(20);
  doc.setTextColor(darkGray);
  doc.text('Formula Review Report', 20, yPosition);
  
  yPosition += 20;
  
  // Formula Information Section
  doc.setFontSize(16);
  doc.setTextColor(primaryBlue);
  doc.text('Formula Information', 20, yPosition);
  yPosition += 10;
  
  doc.setFontSize(11);
  doc.setTextColor(darkGray);
  
  const formulaInfo = [
    `Product Name: ${reviewData.productName || 'Not specified'}`,
    `Formula Number: ${reviewData.formulaNumber || 'Not specified'}`,
    `Original Filename: ${formula.original_filename}`,
    `Submission Date: ${new Date(formula.created_at).toLocaleDateString()}`,
    `Status: ${formula.status}`,
    `Quote Amount: ${formula.quote_amount ? `$${formula.quote_amount}` : 'Not specified'}`
  ];
  
  formulaInfo.forEach(info => {
    doc.text(info, 20, yPosition);
    yPosition += 7;
  });
  
  yPosition += 10;
  
  // Review Notes Section
  if (reviewData.reviewNotes) {
    doc.setFontSize(16);
    doc.setTextColor(primaryBlue);
    doc.text('Review Notes', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(darkGray);
    
    // Split long text into multiple lines with increased width for landscape
    const splitNotes = doc.splitTextToSize(reviewData.reviewNotes, pageWidth - 40);
    doc.text(splitNotes, 20, yPosition);
    yPosition += splitNotes.length * 7 + 10;
  }
  
  // Ingredients Section
  doc.setFontSize(16);
  doc.setTextColor(primaryBlue);
  doc.text('Ingredient Analysis', 20, yPosition);
  yPosition += 15;
  
  // Table headers with optimized widths for landscape mode
  doc.setFontSize(8);
  doc.setTextColor(darkGray);
  doc.setFont(undefined, 'bold');
  
  const headers = ['CAS Number', 'INCI Name', 'Conc. %', 'Chemical Name', 'AICS', 'SIR', 'SUSMP', 'NZOIC', 'Compliant', 'Notes'];
  const colWidths = [25, 35, 15, 45, 18, 18, 18, 18, 15, 35]; // Increased widths for better readability
  let xPosition = 20;
  
  headers.forEach((header, index) => {
    doc.text(header, xPosition, yPosition);
    xPosition += colWidths[index];
  });
  
  // Header underline
  doc.setDrawColor(lightGray);
  doc.line(20, yPosition + 2, pageWidth - 20, yPosition + 2);
  yPosition += 10;
  
  // Ingredient rows
  doc.setFont(undefined, 'normal');
  doc.setFontSize(7); // Slightly smaller font for better fit
  
  reviewData.ingredients.forEach((ingredient: Ingredient) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      doc.addPage('landscape');
      yPosition = 20;
    }
    
    xPosition = 20;
    const rowData = [
      ingredient.casNumber || '-',
      ingredient.name || '-',
      ingredient.percentage || '-',
      ingredient.chemicalName || '-',
      ingredient.aicsListed || '-',
      ingredient.sir || '-',
      ingredient.susmp || '-',
      ingredient.nzoic || '-',
      ingredient.compliant ? 'Yes' : 'No',
      ingredient.notes || '-'
    ];
    
    rowData.forEach((data, index) => {
      // Use splitTextToSize for longer text fields to handle wrapping
      const splitText = doc.splitTextToSize(data, colWidths[index] - 2);
      doc.text(splitText, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 12;
  });
  
  yPosition += 20;
  
  // Check if we need a new page for the footer
  if (yPosition > pageHeight - 60) {
    doc.addPage('landscape');
    yPosition = 20;
  }
  
  // Reviewer Information
  doc.setDrawColor(primaryBlue);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(14);
  doc.setTextColor(primaryBlue);
  doc.text('Review Certification', 20, yPosition);
  yPosition += 15;
  
  doc.setFontSize(11);
  doc.setTextColor(darkGray);
  doc.text(`This formula has been reviewed by ${reviewerName}`, 20, yPosition);
  yPosition += 10;
  doc.text(`Review completed on: ${reviewDate}`, 20, yPosition);
  yPosition += 15;
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(lightGray);
  doc.text('SimplyRA - Professional Regulatory Affairs Services', 20, yPosition);
  doc.text('Generated by SimplyRA Review System', 20, yPosition + 7);
  
  // Save the PDF
  const fileName = `Formula_Review_${reviewData.formulaNumber || formula.id}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
