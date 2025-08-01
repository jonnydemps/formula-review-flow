
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FileUp, FileText, X, CheckCircle } from 'lucide-react';
import { validateFile } from '@/utils/validationUtils';
import { Progress } from '@/components/ui/progress';

interface FileUploaderProps {
  onFileSelected: (file: File, path: string) => void;
  isUploading: boolean;
  uploadProgress?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFileSelected, 
  isUploading, 
  uploadProgress = 0 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileValidation = useCallback((file: File) => {
    try {
      validateFile(file);
      setSelectedFile(file);
      setError(null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid file');
      setSelectedFile(null);
      return false;
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileValidation(e.target.files[0]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileValidation(e.dataTransfer.files[0]);
    }
  }, [handleFileValidation]);

  const handleUpload = () => {
    if (selectedFile) {
      // Generate a unique path for the file
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(2, 15);
      const extension = selectedFile.name.split('.').pop();
      const path = `formulas/${timestamp}-${randomId}.${extension}`;
      
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
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
          }`}
          onClick={triggerFileInput}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <FileUp className={`h-12 w-12 transition-colors ${
              dragActive ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <div>
              <p className="text-foreground font-medium">
                {dragActive ? 'Drop your file here' : 'Click to select a file or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Excel (.xlsx, .xls) or CSV files, max 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FileText className="h-8 w-8 text-primary" />
                {isUploading && uploadProgress === 100 && (
                  <CheckCircle className="h-4 w-4 text-green-500 absolute -top-1 -right-1" />
                )}
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
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
          
          {isUploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
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
        <div className="text-destructive text-sm p-3 bg-destructive/10 rounded-md border border-destructive/20">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
