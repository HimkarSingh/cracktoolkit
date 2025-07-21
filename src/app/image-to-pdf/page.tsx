'use client';

import { useActionState, useFormStatus } from 'react';
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
import { imageToPdfAction, type PdfToolFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Convert to PDF
    </Button>
  );
}

export default function ImageToPdfPage() {
  const initialState: PdfToolFormState = { message: '' };
  const [state, formAction] = useActionState(imageToPdfAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
     // Reset form state when new files are selected
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error converting images',
        description: state.errors?.files?.[0] || state.message,
      });
    }
  }, [state, toast]);

  if (state.message === 'success' && state.downloadUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Conversion Successful!</CardTitle>
            <CardDescription>
              Your images have been converted to a PDF.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={state.downloadUrl} download={state.fileName}>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </a>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Start Over
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Image to PDF</CardTitle>
          <CardDescription>
            Convert your JPG, PNG, and other image files into a single,
            easy-to-share PDF document. Drag and drop to reorder images.
          </CardDescription>
        </CardHeader>
        <form
          ref={formRef}
          action={formAction}
        >
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              multiple={true}
              accept="image/*"
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
