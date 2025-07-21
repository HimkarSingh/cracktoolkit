'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import Image from 'next/image';
import { createFillableFormAction, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, X, AlertCircle, Loader2 } from 'lucide-react';
import { GeneratedForm } from './generated-form';
import { useToast } from '@/hooks/use-toast';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Generate Form
    </Button>
  );
}

export function FillableFormClient() {
  const initialState: FormState = { message: '' };
  const [state, formAction] = useFormState(createFillableFormAction, initialState);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (state.message && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.message,
      });
    }
  }, [state, toast]);

  if (state.message === 'success' && state.data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Original Image</h2>
          <div className="relative aspect-video rounded-lg overflow-hidden border">
             {imagePreview && <Image src={imagePreview} alt="Form preview" layout="fill" objectFit="contain" />}
          </div>
          <Card className="mt-4">
            <CardHeader>
                <h3 className="font-semibold">Instructions</h3>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">{state.data.instructions}</p>
            </CardContent>
          </Card>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Generated Form</h2>
          <GeneratedForm schemaString={state.data.formSchema} />
        </div>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <Card>
        <CardContent className="pt-6">
          {imagePreview ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
              <Image src={imagePreview} alt="Form preview" layout="fill" objectFit="contain" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div>
              <Label htmlFor="image-upload" className="sr-only">Upload Image</Label>
              <div
                className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors hover:border-accent"
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  <span className="font-semibold text-accent">Click to upload an image</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, etc.</p>
              </div>
              <Input
                id="image-upload"
                name="image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
                required
              />
               {state.errors?.image && (
                 <p className="text-sm text-destructive mt-2">{state.errors.image[0]}</p>
               )}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
