'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface GeneratedFormProps {
  schemaString: string;
}

type JsonSchema = {
  title?: string;
  type: 'object';
  properties: {
    [key: string]: {
      type: 'string' | 'boolean' | 'number';
      title?: string;
      description?: string;
      enum?: string[];
    };
  };
  required?: string[];
};

export function GeneratedForm({ schemaString }: GeneratedFormProps) {
  const { toast } = useToast();
  const [parsedSchema, setParsedSchema] = useState<JsonSchema | null>(null);
  const [zodSchema, setZodSchema] = useState<z.ZodObject<any> | null>(null);

  useEffect(() => {
    try {
      const schema: JsonSchema = JSON.parse(schemaString);
      setParsedSchema(schema);

      const shape: { [key: string]: z.ZodType<any, any> } = {};
      for (const key in schema.properties) {
        const prop = schema.properties[key];
        let fieldSchema: z.ZodType<any, any>;

        switch (prop.type) {
          case 'boolean':
            fieldSchema = z.boolean().default(false);
            break;
          case 'number':
            fieldSchema = z.coerce.number();
            break;
          case 'string':
          default:
            if (prop.enum) {
              fieldSchema = z.enum(prop.enum as [string, ...string[]]);
            } else {
              fieldSchema = z.string();
            }
            break;
        }

        if (!schema.required?.includes(key)) {
          fieldSchema = fieldSchema.optional();
        } else {
           if (prop.type === 'string' && !prop.enum) {
            fieldSchema = (fieldSchema as z.ZodString).min(1, { message: `${prop.title || key} is required.`});
           }
        }
        shape[key] = fieldSchema;
      }
      setZodSchema(z.object(shape));
    } catch (error) {
      console.error('Failed to parse form schema:', error);
      setParsedSchema(null);
    }
  }, [schemaString]);

  const form = useForm({
    resolver: zodSchema ? zodResolver(zodSchema) : undefined,
  });

  const onSubmit = (data: any) => {
    toast({
      title: 'Form Submitted!',
      description: <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4"><code className="text-white">{JSON.stringify(data, null, 2)}</code></pre>,
    });
  };

  if (!parsedSchema || !zodSchema) {
    return (
         <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
                Could not parse the form schema provided by the AI.
            </AlertDescription>
        </Alert>
    );
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>{parsedSchema.title || 'Generated Form'}</CardTitle>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {Object.entries(parsedSchema.properties).map(([key, prop]) => (
                    <FormField
                    key={key}
                    control={form.control}
                    name={key}
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{prop.title || key}</FormLabel>
                        {prop.type === 'boolean' ? (
                            <div className="flex items-center space-x-2">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <Label htmlFor={field.name} className="text-sm font-normal text-muted-foreground">{prop.description}</Label>
                            </div>
                        ) : prop.enum ? (
                             prop.enum.length <= 3 ? ( // Render as RadioGroup for few options
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex flex-col space-y-1"
                                    >
                                    {prop.enum.map((option) => (
                                        <FormItem className="flex items-center space-x-3 space-y-0" key={option}>
                                            <FormControl>
                                                <RadioGroupItem value={option} />
                                            </FormControl>
                                            <FormLabel className="font-normal">{option}</FormLabel>
                                        </FormItem>
                                    ))}
                                    </RadioGroup>
                                </FormControl>
                             ) : ( // Render as Select for many options
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Select ${prop.title || key}`} />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    {prop.enum.map((option) => (
                                        <SelectItem value={option} key={option}>{option}</SelectItem>
                                    ))}
                                    </SelectContent>
                                </Select>
                             )
                        ) : (
                            <FormControl>
                            <Input placeholder={prop.description || `Enter ${prop.title || key}`} {...field} />
                            </FormControl>
                        )}
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                ))}
                
                <CardFooter className="px-0 pt-6">
                    <Button type="submit" className='w-full'>Submit Form</Button>
                </CardFooter>
                </form>
            </Form>
        </CardContent>
    </Card>
  );
}
