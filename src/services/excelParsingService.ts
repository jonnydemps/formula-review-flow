
import * as XLSX from 'xlsx';

export interface ParsedIngredient {
  casNumber: string;
  inciName: string;
  concentration: string;
}

export interface ParsedFormulaData {
  productName: string;
  formulaNumber: string;
  ingredients: ParsedIngredient[];
}

export const parseFormulaExcel = async (file: File): Promise<ParsedFormulaData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header row handling
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Extract product name (Row 1, typically in first non-empty cell)
        const productName = jsonData[0]?.[0] || jsonData[0]?.[1] || 'Unknown Product';
        
        // Extract formula number (Row 2)  
        const formulaNumber = jsonData[1]?.[0] || jsonData[1]?.[1] || 'Unknown Formula';
        
        // Extract ingredients (starting from row 3, index 2)
        const ingredients: ParsedIngredient[] = [];
        
        for (let i = 2; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (row && row.length >= 3) {
            const casNumber = row[0]?.toString().trim() || '';
            const inciName = row[1]?.toString().trim() || '';
            const concentration = row[2]?.toString().trim() || '';
            
            // Only add if we have at least an INCI name
            if (inciName) {
              ingredients.push({
                casNumber,
                inciName,
                concentration
              });
            }
          }
        }
        
        resolve({
          productName: productName.toString(),
          formulaNumber: formulaNumber.toString(),
          ingredients
        });
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        reject(new Error('Failed to parse Excel file. Please ensure it follows the expected format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
};

export const generateMasterExcel = (customerData: any, formulaData: ParsedFormulaData): Blob => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create master data structure
  const masterData = [
    ['Customer Information'],
    ['Customer ID:', customerData.customer_id || 'N/A'],
    ['Customer Name:', customerData.customer_name || 'N/A'],
    ['Submission Date:', new Date(customerData.created_at).toLocaleDateString()],
    [''],
    ['Formula Information'],
    ['Product Name:', formulaData.productName],
    ['Formula Number:', formulaData.formulaNumber],
    ['Original Filename:', customerData.original_filename],
    [''],
    ['Ingredients Analysis'],
    ['CAS Number', 'INCI Name', 'Concentration %', 'Compliance Status', 'Notes']
  ];
  
  // Add ingredients
  formulaData.ingredients.forEach(ingredient => {
    masterData.push([
      ingredient.casNumber,
      ingredient.inciName,
      ingredient.concentration,
      'Pending Review', // Default status
      '' // Empty notes field
    ]);
  });
  
  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, ws, 'Master Formula Analysis');
  
  // Generate Excel file as blob
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};
