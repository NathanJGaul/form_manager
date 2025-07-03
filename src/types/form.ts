export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  multiple?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string;
    values: string[];
    operator: 'equals' | 'contains' | 'not_equals';
  };
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
  conditional?: {
    dependsOn: string;
    values: string[];
    operator: 'equals' | 'contains' | 'not_equals';
  };
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
  data: Record<string, any>;
  progress: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSaved: Date;
}

export interface FormSubmission {
  id: string;
  formInstanceId: string;
  templateId: string;
  templateName: string;
  data: Record<string, any>;
  submittedAt: Date;
}