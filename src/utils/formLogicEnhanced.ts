/**
 * Enhanced form logic utilities with compound conditional support
 * This module extends the basic form logic to support OR/AND operations
 */

import { FormFieldValue } from '../types/form';
import { 
  ConditionalLogic, 
  SingleCondition, 
  CompoundCondition,
  isCompoundCondition, 
  isSingleCondition 
} from '../types/conditional';
import { getFieldValue } from './field-keys';

/**
 * Evaluates a single condition
 * Supports both simple field IDs (e.g., "field1") and section.field format (e.g., "section1.field1")
 */
export const evaluateSingleCondition = (
  condition: SingleCondition,
  formData: Record<string, FormFieldValue>
): boolean => {
  let dependentValue: FormFieldValue;
  
  // Check if dependsOn is in section.field format
  if (condition.dependsOn.includes('.')) {
    const parts = condition.dependsOn.split('.');
    if (parts.length === 2) {
      const [sectionId, fieldId] = parts;
      // Try section-scoped key first, then fall back to field ID only
      dependentValue = getFieldValue(formData, fieldId, sectionId);
    } else {
      dependentValue = formData[condition.dependsOn];
    }
  } else {
    // Simple field ID - check both scoped and unscoped keys
    dependentValue = getFieldValue(formData, condition.dependsOn);
  }
  
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

/**
 * Evaluates a conditional that can be either single or compound
 */
export const evaluateConditional = (
  conditional: ConditionalLogic,
  formData: Record<string, FormFieldValue>
): boolean => {
  // Handle single condition
  if (isSingleCondition(conditional)) {
    return evaluateSingleCondition(conditional, formData);
  }
  
  // Handle compound condition
  if (isCompoundCondition(conditional)) {
    const results = conditional.conditions.map(cond => 
      evaluateConditional(cond, formData)
    );
    
    if (conditional.logic === 'or') {
      return results.some(result => result);
    } else if (conditional.logic === 'and') {
      return results.every(result => result);
    }
  }
  
  return false;
};

/**
 * Helper function to create an OR condition
 */
export const createOrCondition = (
  ...conditions: SingleCondition[]
): CompoundCondition => {
  return {
    logic: 'or',
    conditions
  };
};

/**
 * Helper function to create an AND condition
 */
export const createAndCondition = (
  ...conditions: SingleCondition[]
): CompoundCondition => {
  return {
    logic: 'and',
    conditions
  };
};

/**
 * Converts legacy conditional format to new format for backward compatibility
 */
export const normalizeLegacyConditional = (
  conditional: any
): ConditionalLogic | undefined => {
  if (!conditional) return undefined;
  
  // If it already has the new structure, return as-is
  if ('logic' in conditional || 'dependsOn' in conditional) {
    return conditional as ConditionalLogic;
  }
  
  // Handle any other legacy formats here
  return undefined;
};