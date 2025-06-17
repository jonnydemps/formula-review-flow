
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseMasterIngredientsExcel, uploadMasterIngredients } from '@/services/masterIngredientsService';
import { showSuccessToast, showErrorToast } from '@/utils/toastUtils';

const MasterIngredientsUploader: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type (Excel)
      const validTypes = [
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!validTypes.includes(file.type)) {
        setError('Please select an Excel file (.xls or .xlsx)');
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size should not exceed 10MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      // Parse the Excel file
      const ingredients = await parseMasterIngredientsExcel(selectedFile);
      
      if (ingredients.length === 0) {
        throw new Error('No valid ingredients found in the spreadsheet');
      }

      // Upload to database
      const result = await uploadMasterIngredients(ingredients, selectedFile.name);
      
      setUploadResult(result);
      showSuccessToast(`Master ingredients uploaded successfully! ${result.count} ingredients processed.`);
      
      // Reset form
      setSelectedFile(null);
      const fileInput = document.getElementById('master-ingredients-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload master ingredients';
      setError(errorMessage);
      showErrorToast(err, 'Upload Failed');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    const fileInput = document.getElementById('master-ingredients-file');
    fileInput?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-ra-blue" />
          Master Ingredients Database
        </CardTitle>
        <CardDescription>
          Upload your master ingredients spreadsheet to update the database. 
          Expected format: CAS Number | Chemical Name | AICS Listed | Specific Information Requirement | SUSMP | NZOIC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input 
          id="master-ingredients-file"
          type="file" 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".xls,.xlsx"
        />
        
        {!selectedFile ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-ra-blue transition-colors cursor-pointer"
            onClick={triggerFileInput}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <FileUp className="h-10 w-10 text-gray-400" />
              <p className="text-gray-600">Click to select master ingredients Excel file</p>
              <p className="text-xs text-gray-500">Excel format only, max 10MB</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileUp className="h-8 w-8 text-ra-blue" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedFile(null)}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : 'Upload Master Ingredients'}
            </Button>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {uploadResult && (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully uploaded {uploadResult.count} master ingredients!
            </AlertDescription>
          </Alert>
        )}
        
        <div className="text-sm text-gray-500 space-y-1">
          <p><strong>Important:</strong> This will replace all existing master ingredients data.</p>
          <p>Make sure your Excel file has the correct column structure:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Column A: CAS Number</li>
            <li>Column B: Chemical Name</li>
            <li>Column C: AICS Listed</li>
            <li>Column D: Specific Information Requirement</li>
            <li>Column E: SUSMP</li>
            <li>Column F: NZOIC</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterIngredientsUploader;
