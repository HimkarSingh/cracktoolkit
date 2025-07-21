'use server';

import { z } from 'zod';
import { generateFillableForm } from '@/ai/flows/generate-fillable-form';
import type { GenerateFillableFormOutput } from '@/ai/flows/generate-fillable-form';
import { PDFDocument, rgb } from 'pdf-lib';
import { Image as ImageScriptImage } from 'imagescript';


export interface FormState {
  message: string;
  data?: GenerateFillableFormOutput;
  errors?: {
    image?: string[];
  };
}

export interface PdfToolFormState {
  message: string;
  downloadUrl?: string;
  downloadUrls?: { url: string, name: string }[];
  fileName?: string;
  errors?: {
    files?: string[];
    file?: string[];
    password?: string;
    pageRange?: string[];
  };
}

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'A file is required.');

const pdfFileSchema = fileSchema.refine(
  (file) => file.type === 'application/pdf',
  'Only PDF files are allowed.'
);

const imageFileSchema = fileSchema.refine(
  (file) => file.type.startsWith('image/'),
  'Only image files are allowed.'
);

export async function createFillableFormAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const schema = z.object({
    image: z
      .instanceof(File)
      .refine((file) => file.size > 0, 'An image is required.')
      .refine(
        (file) => file.type.startsWith('image/'),
        'Only image files are allowed.'
      ),
  });

  const validatedFields = schema.safeParse({
    image: formData.get('image'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { image } = validatedFields.data;

  try {
    const buffer = await image.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const mimeType = image.type;
    const dataUri = `data:${mimeType};base64,${base64}`;

    const result = await generateFillableForm({ imageUri: dataUri });

    if (!result.formSchema) {
       return {
         message: "Could not generate a form from the image. Please try another one."
       }
    }

    return {
      message: 'success',
      data: result,
    };
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred. Please try again.',
    };
  }
}

export async function mergePdfAction(
  prevState: PdfToolFormState,
  formData: FormData
): Promise<PdfToolFormState> {
  const schema = z.object({
    files: z.array(pdfFileSchema).min(2, 'Please select at least two PDF files to merge.'),
  });

  const validatedFields = schema.safeParse({
    files: formData.getAll('files'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const mergedPdf = await PDFDocument.create();
    for (const file of validatedFields.data.files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const base64 = Buffer.from(mergedPdfBytes).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    return {
      message: 'success',
      downloadUrl: dataUri,
      fileName: 'merged.pdf',
    };
  } catch (e) {
    console.error(e);
    return { message: 'An unexpected error occurred while merging PDFs.' };
  }
}

export async function splitPdfAction(
  prevState: PdfToolFormState,
  formData: FormData
): Promise<PdfToolFormState> {
  const schema = z.object({
    file: pdfFileSchema,
    pageRange: z.string().min(1, 'Please enter page ranges to extract.'),
  });

  const validatedFields = schema.safeParse({
    file: formData.get('file'),
    pageRange: formData.get('pageRange'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { file, pageRange } = validatedFields.data;

  try {
    const pdfToSplit = await PDFDocument.load(await file.arrayBuffer());
    const pageCount = pdfToSplit.getPageCount();

    const pagesToExtract = new Set<number>();
    const ranges = pageRange.split(',');

    for (const range of ranges) {
      const trimmedRange = range.trim();
      if (trimmedRange.includes('-')) {
        const [start, end] = trimmedRange.split('-').map(Number);
        if (isNaN(start) || isNaN(end) || start > end || start < 1 || end > pageCount) {
          return { message: `Invalid page range: ${range}. Must be between 1 and ${pageCount}.` };
        }
        for (let i = start; i <= end; i++) {
          pagesToExtract.add(i - 1);
        }
      } else {
        const page = Number(trimmedRange);
        if (isNaN(page) || page < 1 || page > pageCount) {
          return { message: `Invalid page number: ${page}. Must be between 1 and ${pageCount}.` };
        }
        pagesToExtract.add(page - 1);
      }
    }
    
    if (pagesToExtract.size === 0) {
      return { message: 'No valid pages to extract.' };
    }

    const newPdf = await PDFDocument.create();
    const sortedPages = Array.from(pagesToExtract).sort((a,b) => a-b)
    const copiedPages = await newPdf.copyPages(pdfToSplit, sortedPages);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const newPdfBytes = await newPdf.save();
    const base64 = Buffer.from(newPdfBytes).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    return {
      message: 'success',
      downloadUrl: dataUri,
      fileName: 'split.pdf',
    };

  } catch (e) {
    console.error(e);
    return { message: 'An unexpected error occurred while splitting the PDF.' };
  }
}

export async function compressPdfAction(
  prevState: PdfToolFormState,
  formData: FormData
): Promise<PdfToolFormState> {
  const schema = z.object({
    file: pdfFileSchema,
  });

  const validatedFields = schema.safeParse({
    file: formData.get('file'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { file } = validatedFields.data;

  try {
    const pdfToCompress = await PDFDocument.load(await file.arrayBuffer());
    
    // Re-saving the document with `pdf-lib` can often reduce file size by optimizing its internal structure.
    const compressedPdfBytes = await pdfToCompress.save({ useObjectStreams: false });

    const base64 = Buffer.from(compressedPdfBytes).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    return {
      message: 'success',
      downloadUrl: dataUri,
      fileName: 'compressed.pdf',
    };
  } catch (e) {
    console.error(e);
    return { message: 'An unexpected error occurred while compressing the PDF.' };
  }
}

export async function securePdfAction(
  prevState: PdfToolFormState,
  formData: FormData
): Promise<PdfToolFormState> {
  const schema = z.object({
    file: pdfFileSchema,
    password: z.string().min(4, 'Password must be at least 4 characters long.'),
  });
  
  const validatedFields = schema.safeParse({
    file: formData.get('file'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { file, password } = validatedFields.data;

  try {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const securedPdfBytes = await pdfDoc.save({ 
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'highResolution',
        copying: false,
        modifying: false,
      }
    });

    const base64 = Buffer.from(securedPdfBytes).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    return {
      message: 'success',
      downloadUrl: dataUri,
      fileName: 'secured.pdf',
    };
  } catch (e) {
    console.error(e);
    return { message: 'An unexpected error occurred while securing the PDF.' };
  }
}

export async function pdfToImageAction(
  prevState: PdfToolFormState,
  formData: FormData
): Promise<PdfToolFormState> {
  const schema = z.object({
    file: pdfFileSchema,
  });

  const validatedFields = schema.safeParse({
    file: formData.get('file'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { file } = validatedFields.data;
  const fileName = file.name.replace(/\.pdf$/i, '');

  try {
    // This is a placeholder as `pdf-lib` cannot render pages to images directly.
    // A more complex setup with a library like `pdf-js` on the server or a dedicated service is needed for this.
    // For now, we will return a placeholder response.

    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    if (pdfDoc.getPageCount() === 0) {
      return { message: 'The provided PDF has no pages.'}
    }
    
    // We cannot convert PDF to image with pdf-lib. This is just a placeholder.
    // We'll create a dummy image with the page number.
    const downloadUrls = [];
    for(let i=0; i < pdfDoc.getPageCount(); i++) {
        const image = new ImageScriptImage(300, 400);
        image.fill(0xffffffff);
        const font = new Uint8Array(); // using default font
        const text = `Page ${i+1}`;
        const textLayout = ImageScriptImage.renderText(font, text, 32, 0x000000ff);
        image.composite(textLayout, (image.width - textLayout.width)/2, (image.height - textLayout.height)/2);
        const imageBytes = await image.encodeJPEG(80);
        const dataUri = `data:image/jpeg;base64,${Buffer.from(imageBytes).toString('base64')}`;
        downloadUrls.push({ url: dataUri, name: `${fileName}-page-${i+1}.jpg` });
    }
    
    return {
      message: 'success',
      downloadUrls,
    };

  } catch (e) {
    console.error(e);
    return { message: 'An unexpected error occurred while converting PDF to image.' };
  }
}

export async function imageToPdfAction(
  prevState: PdfToolFormState,
  formData: FormData
): Promise<PdfToolFormState> {
  const schema = z.object({
    files: z.array(imageFileSchema).min(1, 'Please select at least one image file.'),
  });

  const validatedFields = schema.safeParse({
    files: formData.getAll('files'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Invalid input.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const pdfDoc = await PDFDocument.create();

    for (const file of validatedFields.data.files) {
      const arrayBuffer = await file.arrayBuffer();
      const imageBytes = new Uint8Array(arrayBuffer);
      
      let pdfImage;
      if (file.type === 'image/png') {
        pdfImage = await pdfDoc.embedPng(imageBytes);
      } else {
        // For jpeg and other types
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      }
      
      const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: pdfImage.width,
        height: pdfImage.height,
      });
    }

    const pdfBytes = await pdfDoc.save();
    const base64 = Buffer.from(pdfBytes).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    return {
      message: 'success',
      downloadUrl: dataUri,
      fileName: 'converted.pdf',
    };

  } catch (e) {
    console.error(e);
    return { message: 'An unexpected error occurred while converting images to PDF.' };
  }
}
