import { ConditionalLogic } from './conditional';

// DataTable specific types
export interface DataTableColumn {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'radio' | 'date' | 'email' | 'tel' | 'url';
  options?: string[] | { value: string; label: string }[]; // For select/radio columns
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface DataTableRow {
  [columnId: string]: string | number | boolean | string[];
}

export interface DataTableValue {
  columns: DataTableColumn[];
  rows: DataTableRow[];
}

export type FormFieldValue = string | number | boolean | string[] | DataTableValue;

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'file' | 'email' | 'tel' | 'url' | 'time' | 'range' | 'datatable';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[] | { value: string; label: string }[];
  multiple?: boolean;
  layout?: 'vertical' | 'horizontal';
  grouping?: {
    enabled: boolean;
    groupKey?: string;
    label?: string;
  };
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minRows?: number; // For datatable
    maxRows?: number; // For datatable
  };
  conditional?: ConditionalLogic;
  defaultValue?: FormFieldValue;
  content?: string; // For text type fields
  
  // DataTable specific properties
  columns?: DataTableColumn[]; // Column definitions for datatable
  allowAddRows?: boolean; // Whether users can add new rows (default: true)
  allowDeleteRows?: boolean; // Whether users can delete rows (default: true)
  minRows?: number; // Minimum number of rows required
  maxRows?: number; // Maximum number of rows allowed
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  content?: string[]; // Array of text content for display-only sections
  conditional?: ConditionalLogic;
  naable?: boolean;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  sections: FormSection[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FormInstance {
  id: string;
  templateId: string;
  templateName: string;
  data: Record<string, FormFieldValue>;
  progress: number;
  completed: boolean;
  visitedSections?: string[];
  naSections?: string[];
  createdAt: Date;
  updatedAt: Date;
  lastSaved: Date;
}

export interface FormSubmission {
  id: string;
  formInstanceId: string;
  templateId: string;
  templateName: string;
  data: Record<string, FormFieldValue>;
  submittedAt: Date;
}

export interface ExportableFormInstance extends FormInstance {
  embeddedTemplate?: FormTemplate;
}