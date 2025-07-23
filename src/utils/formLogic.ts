import { FormField, FormSection, FormInstance, FormFieldValue } from '../types/form';
import { evaluateConditional } from './formLogicEnhanced';
import { ConditionalLogic } from '../types/conditional';
import { getFieldValue, setFieldValue } from './field-keys';

// For backward compatibility, keep the old evaluateCondition function signature
// but use the enhanced logic internally
export const evaluateCondition = (
  condition: { dependsOn: string; values: string[]; operator: 'equals' | 'contains' | 'not_equals' } | ConditionalLogic,
  formData: Record<string, FormFieldValue>
): boolean => {
  // Use the enhanced evaluation logic which handles both single and compound conditions
  return evaluateConditional(condition as ConditionalLogic, formData);
};

export const getVisibleSections = (
  sections: FormSection[],
  formData: Record<string, FormFieldValue>
): FormSection[] => {
  return sections.filter(section => {
    if (!section.conditional) return true;
    return evaluateCondition(section.conditional, formData);
  });
};

export const getVisibleFields = (
  fields: FormField[],
  formData: Record<string, FormFieldValue>
): FormField[] => {
  return fields.filter(field => {
    if (!field.conditional) return true;
    return evaluateCondition(field.conditional, formData);
  });
};

export const calculateProgress = (
  sections: FormSection[],
  formData: Record<string, FormFieldValue>,
  visitedSections?: string[],
  naSections?: string[]
): number => {
  const visibleSections = getVisibleSections(sections, formData);
  if (visibleSections.length === 0) return 0;
  
  let totalRequiredFields = 0;
  let completedRequiredFields = 0;
  
  // Calculate total required fields from ALL visible sections (denominator)
  visibleSections.forEach(section => {
    const visibleFields = getVisibleFields(section.fields, formData);
    
    visibleFields.forEach(field => {
      if (field.required) {
        totalRequiredFields++;
      }
    });
  });
  
  // Calculate completed required fields from ONLY visited sections (numerator)
  const visitedVisibleSections = visitedSections 
    ? visibleSections.filter(section => visitedSections.includes(section.id))
    : visibleSections;
  
  visitedVisibleSections.forEach(section => {
    const visibleFields = getVisibleFields(section.fields, formData);
    
    // If this section is marked as N/A, count all its required fields as complete
    if (naSections && naSections.includes(section.id)) {
      visibleFields.forEach(field => {
        if (field.required) {
          completedRequiredFields++;
        }
      });
      return; // Skip to next section
    }
    
    visibleFields.forEach(field => {
      if (field.required) {
        const value = getFieldValue(formData, field.id, section.id);
        
        // Check if field has a value, default value, or is considered complete
        const hasValue = value !== undefined && value !== null && value !== '';
        const hasDefaultValue = field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== '';
        
        // For fields with default values, consider them complete if they have the default value or any value
        const isComplete = hasValue || (hasDefaultValue && (value === field.defaultValue || value === undefined));
        
        if (isComplete) {
          if (field.type === 'checkbox' && Array.isArray(value)) {
            if (value.length > 0) {
              completedRequiredFields++;
            } else if (hasDefaultValue && Array.isArray(field.defaultValue) && field.defaultValue.length > 0) {
              completedRequiredFields++;
            }
          } else {
            completedRequiredFields++;
          }
        }
      }
    });
  });
  
  return totalRequiredFields > 0 ? Math.round((completedRequiredFields / totalRequiredFields) * 100) : 100;
};

export const validateField = (field: FormField, value: FormFieldValue): string | null => {
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

/**
 * Get all conditional fields from a template that should be explicitly tracked
 */
export const getAllConditionalFields = (sections: FormSection[]): FormField[] => {
  const conditionalFields: FormField[] = [];
  
  sections.forEach(section => {
    // Add fields with conditional logic
    section.fields.forEach(field => {
      if (field.conditional) {
        conditionalFields.push(field);
      }
    });
  });
  
  return conditionalFields;
};

/**
 * Get all conditional sections from a template that should be explicitly tracked
 */
export const getAllConditionalSections = (sections: FormSection[]): FormSection[] => {
  return sections.filter(section => section.conditional);
};

/**
 * Update form data to explicitly set null values for conditional fields that aren't visible
 */
export const updateConditionalFieldsAsNull = (
  sections: FormSection[],
  formData: Record<string, FormFieldValue>
): Record<string, FormFieldValue> => {
  const updatedData = { ...formData };
  const visibleSections = getVisibleSections(sections, formData);
  const visibleSectionIds = new Set(visibleSections.map(s => s.id));
  
  // Process all sections to handle conditional fields
  sections.forEach(section => {
    const isSectionVisible = visibleSectionIds.has(section.id);
    
    if (!isSectionVisible && section.conditional) {
      // If entire section is hidden, null all its fields
      section.fields.forEach(field => {
        Object.assign(updatedData, setFieldValue(updatedData, field.id, null, section.id));
      });
    } else if (isSectionVisible) {
      // Section is visible, check individual conditional fields
      const visibleFields = getVisibleFields(section.fields, formData);
      const visibleFieldIds = new Set(visibleFields.map(f => f.id));
      
      section.fields.forEach(field => {
        if (field.conditional && !visibleFieldIds.has(field.id)) {
          // Field has conditional logic but is not visible
          Object.assign(updatedData, setFieldValue(updatedData, field.id, null, section.id));
        }
      });
    }
  });
  
  return updatedData;
};

/**
 * Get statistics about conditional field handling
 */
export const getConditionalFieldStats = (
  sections: FormSection[],
  formData: Record<string, FormFieldValue>
): {
  totalConditionalFields: number;
  visibleConditionalFields: number;
  nulledConditionalFields: number;
  conditionalSections: number;
  visibleConditionalSections: number;
  nulledConditionalSections: number;
} => {
  const allConditionalFields = getAllConditionalFields(sections);
  const allConditionalSections = getAllConditionalSections(sections);
  
  const visibleSections = getVisibleSections(sections, formData);
  const visibleSectionIds = new Set(visibleSections.map(s => s.id));
  
  let visibleConditionalFields = 0;
  let nulledConditionalFields = 0;
  
  // Count visible/nulled conditional fields
  allConditionalFields.forEach(field => {
    const fieldSection = sections.find(s => s.fields.some(f => f.id === field.id));
    if (fieldSection && visibleSectionIds.has(fieldSection.id)) {
      const visibleFields = getVisibleFields(fieldSection.fields, formData);
      if (visibleFields.some(f => f.id === field.id)) {
        visibleConditionalFields++;
      } else {
        nulledConditionalFields++;
      }
    } else {
      nulledConditionalFields++;
    }
  });
  
  const visibleConditionalSections = allConditionalSections.filter(section => 
    visibleSectionIds.has(section.id)
  ).length;
  
  return {
    totalConditionalFields: allConditionalFields.length,
    visibleConditionalFields,
    nulledConditionalFields,
    conditionalSections: allConditionalSections.length,
    visibleConditionalSections,
    nulledConditionalSections: allConditionalSections.length - visibleConditionalSections
  };
};