
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import FileUploader from '@/components/FileUploader';
import { FileUp } from 'lucide-react';

interface UploadSectionProps {
  showUploader: boolean;
  isUploading: boolean;
  onFileUpload: (file: File, path: string) => void;
  onCancel: () => void;
  onShowUploader: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  showUploader,
  isUploading,
  onFileUpload,
  onCancel,
  onShowUploader,
}) => {
  if (showUploader) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Upload New Formula</CardTitle>
          <CardDescription>
            Submit your cosmetic formula Excel file for review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploader 
            onFileSelected={onFileUpload} 
            isUploading={isUploading}
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="mr-2"
            disabled={isUploading}
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="mb-8">
      <Button onClick={onShowUploader}>
        <FileUp className="mr-2 h-4 w-4" />
        Upload New Formula
      </Button>
    </div>
  );
};

export default UploadSection;
