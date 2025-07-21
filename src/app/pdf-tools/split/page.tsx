import { ToolPageLayout } from '@/components/tool-page-layout';

export default function SplitPdfPage() {
  return (
    <ToolPageLayout
      title="Split PDF"
      description="Extract specific pages or page ranges from your PDF file. Ideal for creating smaller documents or separating chapters."
      buttonText="Split PDF"
    />
  );
}
