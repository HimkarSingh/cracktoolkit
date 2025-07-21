'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useEffect, useState, useRef } from 'react';
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
import { mergePdfAction, type PdfToolFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Merge PDFs
    </Button>
  );
}

export default function MergePdfPage() {
  const initialState: PdfToolFormState = { message: '' };
  const [state, formAction] = useActionState(mergePdfAction, initialState);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    setSelectedFiles(files);
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });
    formAction(formData);
  };
  
  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error merging PDFs',
        description: state.errors?.files?.[0] || state.message,
      });
    }
  }, [state, toast]);

  if (state.message === 'success' && state.downloadUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Merge Successful!</CardTitle>
            <CardDescription>
              Your PDF files have been merged.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={state.downloadUrl} download={state.fileName}>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Merged PDF
              </Button>
            </a>
          </CardContent>
           <CardFooter>
            <Button variant="outline" onClick={() => window.location.reload()} className="w-full">Start Over</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Merge PDF</CardTitle>
          <CardDescription>
            Combine multiple PDF files into one single, organized document. Upload your files and arrange them in the desired order.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction as never} onSubmit={handleFormSubmit}>
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              multiple={true}
              accept="application/pdf"
            />
            {state?.errors?.files && (
              <p className="text-sm text-destructive mt-2">{state.errors.files[0]}</p>
            )}
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
