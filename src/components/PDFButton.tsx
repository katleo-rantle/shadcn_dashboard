"use client";

import { pdf, DocumentProps } from "@react-pdf/renderer";
import { ReactElement } from "react";
import { Button } from "@/components/ui/button";

interface PDFButtonProps {
  pdfDocument: ReactElement<DocumentProps>;
  fileName: string;
  onBeforeDownload?: () => void;
}

export default function PDFButton({
  pdfDocument,
  fileName,
  onBeforeDownload,
}: PDFButtonProps) {
  const generateAndDownload = async () => {
    if (onBeforeDownload) onBeforeDownload();

    const blob = await pdf(pdfDocument).toBlob();
    const url = URL.createObjectURL(blob);

    const a = window.document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Button className="font-semibold" onClick={generateAndDownload}>
      Download PDF & Lock Tasks
    </Button>
  );
}
