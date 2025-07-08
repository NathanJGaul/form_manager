
export interface PdfExportOptions {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'Portrait' | 'Landscape';
  includeLabels: boolean;
  includeSectionHeaders: boolean;
  fieldSpacing: number;
  fontSize: number;
  fontFamily: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface PdfFieldLayout {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PdfFormField {
  id: string;
  name: string;
  type: 'text' | 'multiline' | 'dropdown' | 'radio' | 'checkbox';
  label?: string;
  layout: PdfFieldLayout;
  options?: string[];
  required?: boolean;
  defaultValue?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface PdfExportResult {
  success: boolean;
  pdfBytes?: Uint8Array;
  error?: string;
}

export const DEFAULT_PDF_OPTIONS: PdfExportOptions = {
  pageSize: 'A4',
  orientation: 'Portrait',
  includeLabels: true,
  includeSectionHeaders: true,
  fieldSpacing: 20,
  fontSize: 12,
  fontFamily: 'Helvetica',
  borderColor: '#000000',
  backgroundColor: '#ffffff',
  textColor: '#000000',
};

export const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};