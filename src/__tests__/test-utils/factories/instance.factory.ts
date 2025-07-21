import { FormInstance } from '@/types/form';

export const instanceFactory = {
  build: (overrides?: Partial<FormInstance>): FormInstance => ({
    id: `instance-${Date.now()}`,
    templateId: 'test-template-1',
    templateName: 'Test Template',
    templateVersion: '1.0.0',
    data: {},
    progress: 0,
    completed: false,
    visitedSections: [],
    naSections: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSaved: new Date(),
    ...overrides,
  }),

  withData: (data: Record<string, any>): FormInstance => 
    instanceFactory.build({ data }),

  inProgress: (progress = 50): FormInstance =>
    instanceFactory.build({
      progress,
      data: {
        'field-1': 'Some value',
        'field-2': 'Another value',
      },
      visitedSections: ['section-1'],
    }),

  completed: (): FormInstance =>
    instanceFactory.build({
      progress: 100,
      completed: true,
      data: {
        'field-1': 'Complete value',
        'field-2': 'Another complete value',
        'field-3': 'Final value',
      },
      visitedSections: ['section-1', 'section-2'],
    }),

  withNASections: (naSections: string[]): FormInstance =>
    instanceFactory.build({
      naSections,
      visitedSections: naSections,
    }),
};