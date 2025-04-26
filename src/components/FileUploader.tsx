import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';

interface FileUploaderProps {
  onFileSelected: (file: File, path: string) => void;
  isUploading: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileSelected, isUploading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndSetFile(file);
    }
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Validate file before setting
  const validateAndSetFile = async (file: File) => {
    const validExcelTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
      'application/vnd.ms-excel.sheet.binary.macroEnabled.12'
    ];
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (validExcelTypes.includes(file.type) || ['xls', 'xlsx'].includes(fileExtension || '')) {
      setSelectedFile(file);
      
      if (user) {
        // Generate unique path for the file in storage
        const filePath = `${user.id}/${uuidv4()}-${file.name}`;
        onFileSelected(file, filePath);
      } else {
        toast.error('You must be logged in to upload files');
      }
    } else {
      toast.error('Please upload a valid Excel file (.xls, .xlsx)');
    }
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xls,.xlsx"
        className="hidden"
        disabled={isUploading}
      />
      
      {/* File upload area */}
      {!selectedFile ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'} transition-colors cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-lg font-medium text-gray-700">Drag & Drop your Excel file here</p>
            <p className="text-sm text-gray-500 mb-3">or click to browse</p>
            <p className="text-xs text-gray-400">Supported formats: .xls, .xlsx</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-50 p-3 rounded-md">
              <File className="h-6 w-6 text-ra-blue" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          {!isUploading && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => { e.stopPropagation(); removeFile(); }}
              className="hover:bg-gray-100 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
