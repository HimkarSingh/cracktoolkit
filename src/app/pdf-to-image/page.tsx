'use client';

import { useRef, useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

// Required for pdf.js to work
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ConvertedImage {
  url: string;
  name: string;
}

export default function PdfToImagePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (files: File[]) => {
    const file = files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else if (file) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please select a PDF file.',
      });
      setSelectedFile(null);
    } else {
      setSelectedFile(null);
    }
  };

  const handleConversion = async () => {
    if (!selectedFile) {
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a PDF file to convert.',
      });
      return;
    }
    
    setIsConverting(true);
    setConvertedImages([]);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const images: ConvertedImage[] = [];
      const originalFileName = selectedFile.name.replace(/\.pdf$/i, '');

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Increase scale for better quality
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const imageUrl = canvas.toDataURL('image/png');
          images.push({ url: imageUrl, name: `${originalFileName}-page-${i}.png` });
        }
      }

      setConvertedImages(images);
      if(images.length === 0){
         toast({
            variant: 'destructive',
            title: 'Conversion Failed',
            description: 'Could not extract any images from the PDF.',
        });
      }

    } catch (error) {
      console.error('Error converting PDF to image:', error);
      toast({
        variant: 'destructive',
        title: 'Conversion Failed',
        description: 'An unexpected error occurred during conversion.',
      });
    } finally {
      setIsConverting(false);
    }
  };

  if (convertedImages.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        <Card className="w-full max-w-4xl text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Conversion Successful!</CardTitle>
            <CardDescription>
              Your PDF has been converted to images. Click to download.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {convertedImages.map((item) => (
              <div key={item.name} className="flex flex-col gap-2 items-center">
                 <div className="border rounded-lg overflow-hidden w-full aspect-[3/4] bg-white">
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
              onClick={() => {
                setConvertedImages([]);
                setSelectedFile(null);
              }}
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
            Convert each page of your PDF into a separate high-quality PNG image. The conversion happens entirely in your browser.
          </CardDescription>
        </CardHeader>
        
          <CardContent>
            <FileUpload
              onFileSelect={handleFileSelect}
              multiple={false}
              accept="application/pdf"
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleConversion} disabled={isConverting || !selectedFile} className="w-full">
                {isConverting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Convert to Images
            </Button>
          </CardFooter>
      </Card>
    </div>
  );
}
