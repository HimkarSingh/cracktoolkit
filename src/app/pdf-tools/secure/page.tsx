'use client';

import { useActionState, useFormStatus } from 'react-dom';
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
import { securePdfAction, type PdfToolFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Secure PDF
    </Button>
  );
}

export default function SecurePdfPage() {
  const initialState: PdfToolFormState = { message: '' };
  const [state, formAction] = useActionState(securePdfAction, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    setSelectedFile(files[0] || null);
    // Reset form state when a new file is selected
    if (formRef.current) {
      formRef.current.reset();
    }
  };
  
  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error securing PDF',
        description: state.errors?.file?.[0] || state.errors?.password?.[0] || state.message,
      });
    }
  }, [state, toast]);

  if (state.message === 'success' && state.downloadUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">PDF Secured!</CardTitle>
            <CardDescription>
              Your PDF is now password-protected.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={state.downloadUrl} download={state.fileName}>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Secured PDF
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
          <CardTitle className="text-2xl">Secure PDF</CardTitle>
          <CardDescription>
            Protect your PDF files by adding a password. You can also set permissions to restrict printing, copying, and editing.
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter a password"
                className="mt-2"
                disabled={!selectedFile}
              />
               {state?.errors?.password && (
              <p className="text-sm text-destructive mt-2">{state.errors.password[0]}</p>
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
