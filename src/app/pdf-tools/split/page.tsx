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
import { splitPdfAction, type PdfToolFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Split PDF
    </Button>
  );
}

export default function SplitPdfPage() {
  const initialState: PdfToolFormState = { message: '' };
  const [state, formAction] = useActionState(splitPdfAction, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    setSelectedFile(files[0] || null);
  };

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error splitting PDF',
        description: state.errors?.file?.[0] || state.errors?.pageRange?.[0] || state.message,
      });
    }
  }, [state, toast]);

  if (state.message === 'success' && state.downloadUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Split Successful!</CardTitle>
            <CardDescription>
              Your PDF has been split.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={state.downloadUrl} download={state.fileName}>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Split PDF
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
          <CardTitle className="text-2xl">Split PDF</CardTitle>
          <CardDescription>
            Extract specific pages or page ranges from your PDF file. Ideal for creating smaller documents or separating chapters.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-4">
            <FileUpload
              onFileSelect={handleFileSelect}
              multiple={false}
              accept="application/pdf"
            />
            {state?.errors?.file && (
              <p className="text-sm text-destructive mt-2">{state.errors.file[0]}</p>
            )}
            <div>
              <Label htmlFor="pageRange">Pages to extract</Label>
              <Input
                id="pageRange"
                name="pageRange"
                placeholder="e.g., 1-3, 5, 8-10"
                className="mt-2"
                disabled={!selectedFile}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter page numbers or ranges separated by commas.
              </p>
              {state?.errors?.pageRange && (
              <p className="text-sm text-destructive mt-2">{state.errors.pageRange[0]}</p>
            )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
