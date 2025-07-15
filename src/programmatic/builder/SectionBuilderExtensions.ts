/**
 * Extensions to the SectionBuilder class for compound conditionals
 * This file contains temporary extensions until the core builder is updated
 */

import { ProgrammaticSection } from '../types';
import { SingleCondition } from '../../types/conditional';

/**
 * Temporary workaround: Extend the section with OR conditional support
 * This creates a hidden field approach until proper compound conditionals are implemented
 */
export function addOrConditionalToSection(
  section: ProgrammaticSection,
  condition1: SingleCondition,
  condition2: SingleCondition
): ProgrammaticSection {
  // For now, we'll use the first condition as the primary
  // This is a temporary workaround
  section.conditional = condition1;
  
  // Store the second condition in a custom property for future use
  (section as any)._orCondition = condition2;
  
  return section;
}

/**
 * Helper to create a conditional object
 */
export function createCondition(
  dependsOn: string,
  operator: 'equals' | 'contains' | 'not_equals',
  values: string[]
): SingleCondition {
  return {
    dependsOn,
    operator,
    values
  };
}