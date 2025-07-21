'use client';

import { useActionState, useRef, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';
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
import { pdfToImageAction, type PdfToolFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Convert to Images
    </Button>
  );
}

export default function PdfToImagePage() {
  const initialState: PdfToolFormState = { message: '' };
  const [state, formAction] = useActionState(pdfToImageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    // This function can be used for any pre-submission logic if needed.
  };

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error converting PDF',
        description: state.errors?.file?.[0] || state.message,
      });
    }
  }, [state, toast]);

  if (state.message === 'success' && state.downloadUrls) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full max-w-4xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Conversion Successful!</CardTitle>
            <CardDescription>
              Your PDF has been converted to images. Note: Image generation from PDF pages is a placeholder. These are not real images from the PDF.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {state.downloadUrls.map((item) => (
              <div key={item.url} className="flex flex-col gap-2 items-center">
                 <div className="border rounded-lg overflow-hidden w-full aspect-[3/4]">
                    <Image
                        src={item.url}
                        alt={item.name}
                        width={300}
                        height={400}
                        className="object-contain"
                    />
                 </div>
                <a href={item.url} download={item.name} className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </a>
              </div>
            ))}
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
          <CardTitle className="text-2xl">PDF to Image</CardTitle>
          <CardDescription>
            Convert each page of your PDF into a separate high-quality JPG or PNG image. Perfect for sharing or embedding content.
          </CardDescription>
        </CardHeader>
        <form
          ref={formRef}
          action={formAction}
        >
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              multiple={false}
              accept="application/pdf"
            />
            {state?.errors?.file && (
              <p className="text-sm text-destructive mt-2">{state.errors.file[0]}</p>
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
