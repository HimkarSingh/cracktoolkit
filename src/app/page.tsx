import { FeatureCard } from '@/components/feature-card';
import {
  Combine,
  Split,
  Minimize2,
  Lock,
  FileImage,
  Image as ImageIcon,
  FileSignature,
} from 'lucide-react';

const features = [
  {
    title: 'Merge PDF',
    description: 'Combine multiple PDF files into one single document.',
    href: '/pdf-tools/merge',
    icon: <Combine className="w-8 h-8 text-accent" />,
  },
  {
    title: 'Split PDF',
    description: 'Extract one or more pages from a PDF file.',
    href: '/pdf-tools/split',
    icon: <Split className="w-8 h-8 text-accent" />,
  },
  {
    title: 'Compress PDF',
    description: 'Reduce the file size of your PDF while maintaining quality.',
    href: '/pdf-tools/compress',
    icon: <Minimize2 className="w-8 h-8 text-accent" />,
  },
  {
    title: 'Secure PDF',
    description: 'Add a password and set permissions for your PDF.',
    href: '/pdf-tools/secure',
    icon: <Lock className="w-8 h-8 text-accent" />,
  },
  {
    title: 'PDF to Image',
    description: 'Convert pages of a PDF into JPG or PNG images.',
    href: '/pdf-to-image',
    icon: <FileImage className="w-8 h-8 text-accent" />,
  },
  {
    title: 'Image to PDF',
    description: 'Convert JPG, PNG, and other images to a PDF file.',
    href: '/image-to-pdf',
    icon: <ImageIcon className="w-8 h-8 text-accent" />,
  },
  {
    title: 'AI Fillable Form',
    description: 'Create a fillable form from an image automatically.',
    href: '/fillable-form',
    icon: <FileSignature className="w-8 h-8 text-accent" />,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome to VectorFlow</h1>
        <p className="text-muted-foreground mt-2">
          Your all-in-one solution for PDF and image management.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature) => (
          <FeatureCard
            key={feature.href}
            href={feature.href}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
          />
        ))}
      </div>
    </div>
  );
}
