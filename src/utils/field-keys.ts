import { FormData } from '../types/FormInstance';
import { FormValue } from '../types/field-types';

/**
 * Generate a section-scoped field key for storing field values
 * @param fieldId - The field ID
 * @param sectionId - The section ID (optional)
 * @returns A composite key if sectionId is provided, otherwise just the fieldId
 */
export function getFieldKey(fieldId: string, sectionId?: string): string {
  return sectionId ? `${sectionId}.${fieldId}` : fieldId;
}

/**
 * Parse a field key to extract section and field IDs
 * @param key - The field key to parse
 * @returns An object with fieldId and optional sectionId
 */
export function parseFieldKey(key: string): { sectionId?: string; fieldId: string } {
  const parts = key.split('.');
  if (parts.length === 2) {
    return { sectionId: parts[0], fieldId: parts[1] };
  }
  return { fieldId: key };
}

/**
 * Get a field value from form data, checking both scoped and unscoped keys
 * @param formData - The form data object
 * @param fieldId - The field ID
 * @param sectionId - The section ID (optional)
 * @returns The field value or undefined
 */
export function getFieldValue(
  formData: FormData,
  fieldId: string,
  sectionId?: string
): FormValue | undefined {
  // Try section-scoped key first
  if (sectionId) {
    const scopedKey = getFieldKey(fieldId, sectionId);
    if (scopedKey in formData) {
      return formData[scopedKey];
    }
  }
  
  // Fall back to unscoped key for backward compatibility
  return formData[fieldId];
}

/**
 * Set a field value in form data using appropriate key
 * @param formData - The form data object
 * @param fieldId - The field ID
 * @param value - The value to set
 * @param sectionId - The section ID (optional)
 * @returns Updated form data
 */
export function setFieldValue(
  formData: FormData,
  fieldId: string,
  value: FormValue,
  sectionId?: string
): FormData {
  const key = getFieldKey(fieldId, sectionId);
  
  // If we're setting a scoped value and an unscoped value exists,
  // remove the unscoped value to prevent conflicts
  if (sectionId && fieldId in formData) {
    const { [fieldId]: _, ...restData } = formData;
    return {
      ...restData,
      [key]: value,
    };
  }
  
  return {
    ...formData,
    [key]: value,
  };
}

/**
 * Check if a field has a value in form data
 * @param formData - The form data object
 * @param fieldId - The field ID
 * @param sectionId - The section ID (optional)
 * @returns True if the field has a value
 */
export function hasFieldValue(
  formData: FormData,
  fieldId: string,
  sectionId?: string
): boolean {
  const value = getFieldValue(formData, fieldId, sectionId);
  return value !== undefined && value !== null && value !== '';
}

/**
 * Migrate form data from flat structure to section-scoped structure
 * @param formData - The form data to migrate
 * @param sections - The form sections to use for migration
 * @returns Migrated form data
 */
export function migrateFormData(
  formData: FormData,
  sections: Array<{ id: string; fields: Array<{ id: string }> }>
): FormData {
  const migratedData: FormData = {};
  const processedFields = new Set<string>();
  
  // First, process all fields within sections
  sections.forEach(section => {
    section.fields.forEach(field => {
      if (field.id in formData) {
        const scopedKey = getFieldKey(field.id, section.id);
        migratedData[scopedKey] = formData[field.id];
        processedFields.add(field.id);
      }
    });
  });
  
  // Then, copy over any remaining fields that aren't in sections
  Object.entries(formData).forEach(([key, value]) => {
    if (!processedFields.has(key) && !key.includes('.')) {
      migratedData[key] = value;
    }
  });
  
  return migratedData;
}