
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface FileUploaderProps {
  onFileSelected: (file: File, path: string) => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, isUploading }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type (Excel or PDF)
      const validTypes = [
        'application/vnd.ms-excel', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/pdf',
        // Add more valid types as needed
      ];
      
      if (!validTypes.includes(file.type)) {
        setError('Please select an Excel or PDF file');
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
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      // Generate a unique path for the file
      const timestamp = new Date().getTime();
      const uniqueId = uuidv4();
      const extension = selectedFile.name.split('.').pop();
      const path = `formulas/${timestamp}-${uniqueId}.${extension}`;
      
      onFileSelected(selectedFile, path);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange} 
        className="hidden" 
        accept=".xls,.xlsx,.pdf"
        autoComplete="off"
      />
      
      {!selectedFile ? (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-ra-blue transition-colors cursor-pointer"
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <FileUp className="h-10 w-10 text-gray-400" />
            <p className="text-gray-600">Click to select a file or drag and drop</p>
            <p className="text-xs text-gray-500">Excel or PDF format, max 10MB</p>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-ra-blue" />
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
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              {isUploading ? 'Uploading...' : 'Upload Formula'}
            </Button>
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
