'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/file-upload';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  buttonText: string;
  multiple?: boolean;
}

export function ToolPageLayout({
  title,
  description,
  buttonText,
  multiple = false,
}: ToolPageLayoutProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const fileAccept = multiple ? "image/*" : "application/pdf";

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onFileSelect={handleFileSelect} multiple={multiple} accept={fileAccept} />
        </CardContent>
        <CardFooter>
          <Button disabled={selectedFiles.length === 0} className="w-full">
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
