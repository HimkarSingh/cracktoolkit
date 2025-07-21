import { FillableFormClient } from '@/components/fillable-form-client';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function FillableFormPage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-transparent border-0 shadow-none">
        <CardHeader className="px-0">
          <CardTitle className="text-3xl font-bold tracking-tight">AI Fillable Form Generator</CardTitle>
          <CardDescription className="text-lg">
            Upload an image of a form, and our AI will automatically detect its fields and generate an interactive, fillable version for you.
          </CardDescription>
        </CardHeader>
      </Card>
      <FillableFormClient />
    </div>
  );
}
