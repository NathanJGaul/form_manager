import { FormField, FormSection, FormInstance } from '../types/form';

export const evaluateCondition = (
  condition: { dependsOn: string; values: string[]; operator: 'equals' | 'contains' | 'not_equals' },
  formData: Record<string, any>
): boolean => {
  const dependentValue = formData[condition.dependsOn];
  
  if (dependentValue === undefined || dependentValue === null) {
    return false;
  }
  
  const valueString = String(dependentValue).toLowerCase();
  
  switch (condition.operator) {
    case 'equals':
      return condition.values.some(val => val.toLowerCase() === valueString);
    case 'contains':
      return condition.values.some(val => valueString.includes(val.toLowerCase()));
    case 'not_equals':
      return !condition.values.some(val => val.toLowerCase() === valueString);
    default:
      return false;
  }
};

export const getVisibleSections = (
  sections: FormSection[],
  formData: Record<string, any>
): FormSection[] => {
  return sections.filter(section => {
    if (!section.conditional) return true;
    return evaluateCondition(section.conditional, formData);
  });
};

export const getVisibleFields = (
  fields: FormField[],
  formData: Record<string, any>
): FormField[] => {
  return fields.filter(field => {
    if (!field.conditional) return true;
    return evaluateCondition(field.conditional, formData);
  });
};

export const calculateProgress = (
  sections: FormSection[],
  formData: Record<string, any>
): number => {
  const visibleSections = getVisibleSections(sections, formData);
  if (visibleSections.length === 0) return 0;
  
  let totalFields = 0;
  let completedFields = 0;
  
  visibleSections.forEach(section => {
    const visibleFields = getVisibleFields(section.fields, formData);
    totalFields += visibleFields.length;
    
    visibleFields.forEach(field => {
      const value = formData[field.id];
      if (value !== undefined && value !== null && value !== '') {
        if (field.type === 'checkbox' && Array.isArray(value)) {
          if (value.length > 0) completedFields++;
        } else {
          completedFields++;
        }
      }
    });
  });
  
  return totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
};

export const validateField = (field: FormField, value: any): string | null => {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`;
  }
  
  if (field.validation) {
    const { min, max, pattern } = field.validation;
    
    if (min !== undefined && typeof value === 'string' && value.length < min) {
      return `${field.label} must be at least ${min} characters`;
    }
    
    if (max !== undefined && typeof value === 'string' && value.length > max) {
      return `${field.label} must be no more than ${max} characters`;
    }
    
    if (min !== undefined && typeof value === 'number' && value < min) {
      return `${field.label} must be at least ${min}`;
    }
    
    if (max !== undefined && typeof value === 'number' && value > max) {
      return `${field.label} must be no more than ${max}`;
    }
    
    if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
      return `${field.label} format is invalid`;
    }
  }
  
  return null;
};