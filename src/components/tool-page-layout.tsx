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

interface ToolPageLayoutProps {
  title: string;
  description: string;
  buttonText: string;
}

export function ToolPageLayout({ title, description, buttonText }: ToolPageLayoutProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload onFileSelect={() => {}} />
        </CardContent>
        <CardFooter>
          <Button disabled className="w-full">
            {buttonText}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
