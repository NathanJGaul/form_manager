import { ConditionalLogic } from './conditional';

export type FormFieldValue = string | number | boolean | string[];

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'file' | 'email' | 'tel' | 'url' | 'time' | 'range';
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
  };
  conditional?: ConditionalLogic;
  defaultValue?: FormFieldValue;
  content?: string; // For text type fields
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