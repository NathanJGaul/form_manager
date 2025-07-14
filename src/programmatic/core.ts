/**
 * Core exports for programmatic template system
 * This file contains only the essential exports needed by template files
 * to avoid circular dependencies
 */

// Export the main TemplateBuilder class and related builders
export { 
  TemplateBuilder, 
  SectionBuilder, 
  FieldBuilder, 
  ConditionalBuilder, 
  ConditionalLogicBuilder 
} from './builder/TemplateBuilder';

// Export only the essential types needed by templates
export type { 
  ProgrammaticTemplate,
  FormField,
  FormSection,
  ConditionalLogic,
  FieldValidation,
  TemplateMetadata
} from './types';