import { faker } from '@faker-js/faker';
import type { FormField, FormFieldValue, FormTemplate } from '../types/form';
import { evaluateCondition } from './formLogic';

export interface MockDataConfig {
  fillPercentage?: number;
  requiredOnly?: boolean;
  useRealisticData?: boolean;
  seed?: number;
  fieldOverrides?: Record<string, FormFieldValue>;
}

export class MockDataGenerator {
  constructor(private config: MockDataConfig = {}) {
    if (config.seed) {
      faker.seed(config.seed);
    }
  }

  generateMockFormData(
    template: FormTemplate,
    currentFormData: Record<string, FormFieldValue> = {}
  ): Record<string, FormFieldValue> {
    const mockData: Record<string, FormFieldValue> = { ...currentFormData };
    const fillPercentage = this.config.fillPercentage ?? 100;

    template.sections.forEach(section => {
      if (section.conditional && !evaluateCondition(section.conditional, mockData)) {
        return;
      }

      if (section.naable && mockData[`__na_section_${section.id}`]) {
        return;
      }

      section.fields.forEach(field => {
        if (this.config.fieldOverrides?.[field.id] !== undefined) {
          mockData[field.id] = this.config.fieldOverrides[field.id];
          return;
        }

        if (mockData[field.id] !== undefined && mockData[field.id] !== null && mockData[field.id] !== '') {
          return;
        }

        if (field.conditional && !evaluateCondition(field.conditional, mockData)) {
          return;
        }

        if (this.config.requiredOnly && !field.required) {
          return;
        }

        if (!field.required && faker.number.int({ min: 1, max: 100 }) > fillPercentage) {
          return;
        }

        const value = this.generateFieldValue(field);
        if (value !== null) {
          mockData[field.id] = value;
        }
      });
    });

    return mockData;
  }

  private generateFieldValue(field: FormField): FormFieldValue {
    switch (field.type) {
      case 'text':
        return this.generateTextValue(field);
      case 'email':
        return faker.internet.email();
      case 'tel':
        return faker.phone.number();
      case 'url':
        return faker.internet.url();
      case 'textarea':
        return this.generateTextareaValue(field);
      case 'number':
        return this.generateNumberValue(field);
      case 'date':
        return this.generateDateValue();
      case 'select':
      case 'radio':
        return this.generateSelectValue(field);
      case 'checkbox':
        return this.generateCheckboxValue(field);
      case 'time':
        return this.generateTimeValue();
      case 'range':
        return this.generateNumberValue(field);
      case 'file':
        return null;
      default:
        return field.defaultValue || '';
    }
  }

  private generateTextValue(field: FormField): string {
    if (!this.config.useRealisticData) {
      return faker.lorem.words(3);
    }

    const label = field.label.toLowerCase();
    const id = field.id.toLowerCase();

    if (label.includes('name') || id.includes('name')) {
      if (label.includes('first')) return faker.person.firstName();
      if (label.includes('last')) return faker.person.lastName();
      if (label.includes('full')) return faker.person.fullName();
      if (label.includes('company')) return faker.company.name();
      return faker.person.fullName();
    }

    if (label.includes('address')) return faker.location.streetAddress();
    if (label.includes('city')) return faker.location.city();
    if (label.includes('state')) return faker.location.state();
    if (label.includes('country')) return faker.location.country();
    if (label.includes('zip') || label.includes('postal')) return faker.location.zipCode();
    if (label.includes('company')) return faker.company.name();
    if (label.includes('job') || label.includes('position')) return faker.person.jobTitle();
    if (label.includes('department')) return faker.commerce.department();
    if (label.includes('description')) return faker.lorem.paragraph();
    if (label.includes('title')) return faker.lorem.sentence(4);
    if (label.includes('event')) return faker.lorem.words(3);
    if (label.includes('unit')) return faker.helpers.arrayElement(['Unit A', 'Unit B', 'Unit C', 'Unit 101']);
    if (label.includes('rank')) return faker.helpers.arrayElement(['Private', 'Corporal', 'Sergeant', 'Lieutenant', 'Captain', 'Major', 'Colonel']);

    return faker.lorem.words(3);
  }

  private generateTextareaValue(field: FormField): string {
    const minLength = field.validation?.minLength || 50;
    const maxLength = field.validation?.maxLength || 200;
    const text = faker.lorem.paragraph();
    const targetLength = faker.number.int({ min: minLength, max: Math.min(text.length, maxLength) });
    return text.substring(0, targetLength);
  }

  private generateNumberValue(field: FormField): number {
    const min = field.validation?.min ?? 0;
    const max = field.validation?.max ?? 100;
    return faker.number.int({ min, max });
  }

  private generateDateValue(): string {
    const date = faker.date.between({ 
      from: '2020-01-01', 
      to: '2025-12-31' 
    });
    return date.toISOString().split('T')[0];
  }

  private generateSelectValue(field: FormField): string {
    if (!field.options || field.options.length === 0) return '';

    const options = field.options.map(opt => 
      typeof opt === 'string' ? opt : opt.value
    );

    const nonNaOptions = options.filter(opt => 
      !opt.toLowerCase().includes('n/a') && 
      !opt.toLowerCase().includes('not applicable')
    );

    const availableOptions = nonNaOptions.length > 0 ? nonNaOptions : options;
    return faker.helpers.arrayElement(availableOptions);
  }

  private generateCheckboxValue(field: FormField): string[] {
    if (!field.options || field.options.length === 0) return [];

    const options = field.options.map(opt => 
      typeof opt === 'string' ? opt : opt.value
    );

    const nonNaOptions = options.filter(opt => 
      !opt.toLowerCase().includes('n/a') && 
      !opt.toLowerCase().includes('not applicable')
    );

    const availableOptions = nonNaOptions.length > 0 ? nonNaOptions : options;
    const numSelections = faker.number.int({ min: 1, max: Math.min(3, availableOptions.length) });
    return faker.helpers.arrayElements(availableOptions, numSelections);
  }

  private generateTimeValue(): string {
    const hour = faker.number.int({ min: 0, max: 23 }).toString().padStart(2, '0');
    const minute = faker.number.int({ min: 0, max: 59 }).toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  private applyValidation(value: FormFieldValue, field: FormField): FormFieldValue {
    if (!field.validation || value === null) return value;

    if (typeof value === 'string' && field.validation) {
      if (field.validation.minLength && value.length < field.validation.minLength) {
        value = value.padEnd(field.validation.minLength, ' ');
      }
      if (field.validation.maxLength && value.length > field.validation.maxLength) {
        value = value.substring(0, field.validation.maxLength);
      }
      if (field.validation.pattern) {
        try {
          if (!new RegExp(field.validation.pattern).test(value)) {
            value = this.generatePatternCompliantValue(field.validation.pattern);
          }
        } catch {
          console.warn('Invalid pattern:', field.validation.pattern);
        }
      }
    }

    return value;
  }

  private generatePatternCompliantValue(pattern: string): string {
    if (pattern.includes('\\d{3}-\\d{3}-\\d{4}')) {
      return faker.phone.number('###-###-####');
    }
    if (pattern.includes('\\d{5}')) {
      return faker.location.zipCode('#####');
    }
    return 'ABC123';
  }
}