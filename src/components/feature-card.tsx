import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureCard({ href, title, description, icon }: FeatureCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all duration-200 ease-in-out hover:border-accent hover:shadow-lg hover:shadow-accent/10">
        <CardHeader>
          <div className="mb-4">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-sm font-medium text-accent">
            Go to tool <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
