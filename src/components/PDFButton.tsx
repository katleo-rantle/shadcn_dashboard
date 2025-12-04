'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

interface PDFButtonProps<T extends object> {
  documentComponent: React.ComponentType<T>;
  documentProps: T;
  fileName: string;
  onBeforeDownload?: () => void;
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function PDFButton<T extends object>({
  documentComponent: DocumentComponent,
  documentProps,
  fileName,
  onBeforeDownload,
  children = 'Download PDF',
  className,
  variant = 'default',
  size = 'default',
}: PDFButtonProps<T>) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (loading) return;
    onBeforeDownload?.();
    setLoading(true);

    try {
      // Import client-side only
      const mod = await import('@react-pdf/renderer');
      const pdfFn = (mod as any).pdf ?? (mod as any).default?.pdf;
      if (!pdfFn) throw new Error('pdf() not available on @react-pdf/renderer');

      // Create the React PDF document element
      const docElement = <DocumentComponent {...documentProps} />;

      // Generate blob and trigger download
      const blob: Blob = await pdfFn(docElement).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate/download PDF:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleDownload}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
}