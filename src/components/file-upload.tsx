'use client';

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  className?: string;
  multiple?: boolean;
}

export function FileUpload({
  onFileSelect,
  accept = '*',
  className = '',
  multiple = false,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setFileNames(fileList.map((f) => f.name));
      onFileSelect(fileList);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files).filter((file) =>
        file.type.match(accept.replace('*', '.*'))
      );
      if (fileList.length > 0) {
        if (fileInputRef.current) {
          const dataTransfer = new DataTransfer();
          fileList.forEach((file) => dataTransfer.items.add(file));
          fileInputRef.current.files = dataTransfer.files;
        }
        setFileNames(fileList.map((f) => f.name));
        onFileSelect(fileList);
      }
    }
  };

  return (
    <div className={className}>
      <div
        className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          dragging ? 'border-accent bg-accent/10' : 'border-border hover:border-accent'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-center text-muted-foreground">
          <span className="font-semibold text-accent">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {accept === '*' ? 'Any file type' : accept}
        </p>
        <Input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={accept}
          multiple={multiple}
        />
      </div>
      {fileNames.length > 0 && (
        <div className="mt-4 text-center text-sm">
          <p>Selected file(s):</p>
          <ul className="list-disc list-inside">
            {fileNames.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
