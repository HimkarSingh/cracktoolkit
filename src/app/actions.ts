'use server';

import { z } from 'zod';
import { generateFillableForm } from '@/ai/flows/generate-fillable-form';
import type { GenerateFillableFormOutput } from '@/ai/flows/generate-fillable-form';

export interface FormState {
  message: string;
  data?: GenerateFillableFormOutput;
  errors?: {
    image?: string[];
  };
}

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
