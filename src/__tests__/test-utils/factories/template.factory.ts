import { FormTemplate, FormSection, FormField } from '@/types/form';

export const templateFactory = {
  build: (overrides?: Partial<FormTemplate>): FormTemplate => ({
    id: `test-template-${Date.now()}`,
    name: 'Test Template',
    description: 'A test template',
    version: '1.0.0',
    author: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'section-1',
        title: 'Test Section',
        fields: [],
      },
    ],
    ...overrides,
  }),

  withFields: (fields: FormField[]): FormTemplate => {
    const template = templateFactory.build();
    template.sections[0].fields = fields;
    return template;
  },

  withSections: (sections: FormSection[]): FormTemplate => {
    const template = templateFactory.build();
    template.sections = sections;
    return template;
  },

  minimal: (): FormTemplate => ({
    id: 'minimal-template',
    name: 'Minimal Template',
    description: 'A minimal test template',
    sections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),

  complex: (): FormTemplate => {
    return templateFactory.build({
      name: 'Complex Template',
      sections: [
        {
          id: 'section-1',
          title: 'Basic Information',
          fields: [
            fieldFactory.text({ id: 'Full Name', label: 'Full Name', required: true }),
            fieldFactory.email({ id: 'Email Address', label: 'Email Address', required: true }),
            fieldFactory.select({
              id: 'Department',
              label: 'Department',
              options: ['Sales', 'Engineering', 'Marketing'],
              required: true,
            }),
          ],
        },
        {
          id: 'section-2',
          title: 'Additional Details',
          fields: [
            fieldFactory.textarea({ id: 'Comments', label: 'Comments' }),
            fieldFactory.checkbox({
              id: 'Subscribe to newsletter',
              label: 'Subscribe to newsletter',
              defaultValue: true,
            }),
          ],
          conditional: {
            dependsOn: 'Department',
            values: ['Marketing'],
            operator: 'equals',
          },
        },
      ],
    });
  },
};

export const fieldFactory = {
  base: (overrides?: Partial<FormField>): FormField => ({
    id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'text',
    label: 'Test Field',
    required: false,
    placeholder: '',
    ...overrides,
  }),

  text: (overrides?: Partial<FormField>): FormField => 
    fieldFactory.base({ type: 'text', ...overrides }),

  textarea: (overrides?: Partial<FormField>): FormField =>
    fieldFactory.base({ type: 'textarea', ...overrides }),

  email: (overrides?: Partial<FormField>): FormField =>
    fieldFactory.base({ type: 'email', placeholder: 'email@example.com', ...overrides }),

  number: (overrides?: Partial<FormField>): FormField =>
    fieldFactory.base({ type: 'number', ...overrides }),

  select: (overrides?: Partial<FormField> & { options?: string[] }): FormField => {
    const { options = ['Option 1', 'Option 2', 'Option 3'], ...rest } = overrides || {};
    return fieldFactory.base({ 
      type: 'select', 
      options,
      ...rest 
    });
  },

  radio: (overrides?: Partial<FormField> & { options?: string[] }): FormField => {
    const { options = ['Yes', 'No'], ...rest } = overrides || {};
    return fieldFactory.base({ 
      type: 'radio', 
      options,
      ...rest 
    });
  },

  checkbox: (overrides?: Partial<FormField>): FormField =>
    fieldFactory.base({ type: 'checkbox', ...overrides }),

  date: (overrides?: Partial<FormField>): FormField =>
    fieldFactory.base({ type: 'date', ...overrides }),

  withConditional: (
    field: FormField,
    conditional: FormField['conditional']
  ): FormField => ({
    ...field,
    conditional,
  }),
};

export const sectionFactory = {
  build: (overrides?: Partial<FormSection>): FormSection => ({
    id: `section-${Date.now()}`,
    title: 'Test Section',
    fields: [],
    ...overrides,
  }),

  withFields: (fields: FormField[]): FormSection => ({
    id: `section-${Date.now()}`,
    title: 'Section with Fields',
    fields,
  }),

  withConditional: (
    section: FormSection,
    conditional: FormSection['conditional']
  ): FormSection => ({
    ...section,
    conditional,
  }),
};