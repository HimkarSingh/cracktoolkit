'use server';

import { z } from 'zod';
import { generateFillableForm } from '@/ai/flows/generate-fillable-form';
import type { GenerateFillableFormOutput } from '@/ai/flows/generate-fillable-form';
import { PDFDocument } from 'pdf-lib';

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
  fileName?: string;
  errors?: {
    files?: string[];
    password?: string;
  };
}

const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, 'A file is required.');

const pdfFileSchema = fileSchema.refine(
  (file) => file.type === 'application/pdf',
  'Only PDF files are allowed.'
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
