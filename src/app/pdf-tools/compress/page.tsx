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
import { compressPdfAction, type PdfToolFormState } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Compress PDF
    </Button>
  );
}

export default function CompressPdfPage() {
  const initialState: PdfToolFormState = { message: '' };
  const [state, formAction] = useActionState(compressPdfAction, initialState);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionLevel, setCompressionLevel] = useState([50]);
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
        title: 'Error compressing PDF',
        description: state.errors?.file?.[0] || state.message,
      });
    }
  }, [state, toast]);

  if (state.message === 'success' && state.downloadUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Compression Successful!</CardTitle>
            <CardDescription>
              Your PDF has been compressed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <a href={state.downloadUrl} download={state.fileName}>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Compressed PDF
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
          <CardTitle className="text-2xl">Compress PDF</CardTitle>
          <CardDescription>
             Reduce the file size of your PDFs to make them easier to share and store, while maintaining the best possible quality.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <FileUpload
              onFileSelect={handleFileSelect}
              multiple={false}
              accept="application/pdf"
            />
             {state?.errors?.file && (
              <p className="text-sm text-destructive mt-2">{state.errors.file[0]}</p>
            )}
             <div>
              <Label htmlFor="compressionLevel">Compression Level</Label>
              <div className="flex items-center gap-4 mt-2">
                <Slider
                  id="compressionLevel"
                  name="compressionLevel"
                  min={0}
                  max={100}
                  step={1}
                  value={compressionLevel}
                  onValueChange={setCompressionLevel}
                  disabled={!selectedFile}
                />
                <span className="text-sm font-medium w-12 text-right">
                  {compressionLevel[0]}%
                </span>
              </div>
               <p className="text-xs text-muted-foreground mt-1">
                Lower values result in smaller file sizes but may reduce quality. (Note: This is currently a placeholder).
              </p>
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
