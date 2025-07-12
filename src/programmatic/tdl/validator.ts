import { 
  ProgrammaticTemplate, 
  ProgrammaticSection, 
  ProgrammaticField, 
  TemplateError, 
  ValidationResult, 
  ControlFlowConfig,
  Condition 
} from '../types';
import { TDLDocument } from './parser';

export class TDLValidator {
  /**
   * Validate a TDL document structure
   */
  validateTDL(tdlDocument: unknown): ValidationResult {
    const errors: TemplateError[] = [];
    const warnings: TemplateError[] = [];

    // Validate root structure
    if (typeof tdlDocument !== 'object' || tdlDocument === null) {
      errors.push({
        type: 'validation',
        message: 'TDL document must be an object'
      });
      return { valid: false, errors, warnings };
    }

    // Validate metadata
    this.validateMetadata(tdlDocument.metadata, errors, warnings);

    // Validate sections
    this.validateSections(tdlDocument.sections, errors, warnings);

    // Validate variables
    if (tdlDocument.variables) {
      this.validateVariables(tdlDocument.variables, errors, warnings);
    }

    // Validate schema
    if (tdlDocument.schema) {
      this.validateSchema(tdlDocument.schema, errors, warnings);
    }

    // Validate behavior
    if (tdlDocument.behavior) {
      this.validateBehavior(tdlDocument.behavior, errors, warnings);
    }

    // Validate styling
    if (tdlDocument.styling) {
      this.validateStyling(tdlDocument.styling, errors, warnings);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a ProgrammaticTemplate
   */
  validateTemplate(template: ProgrammaticTemplate): ValidationResult {
    const errors: TemplateError[] = [];
    const warnings: TemplateError[] = [];

    // Validate metadata
    this.validateTemplateMetadata(template.metadata, errors, warnings);

    // Validate schema
    this.validateTemplateSchema(template.schema, errors, warnings);

    // Validate sections
    this.validateTemplateSections(template.sections, errors, warnings);

    // Validate behavior
    this.validateTemplateBehavior(template.behavior, errors, warnings);

    // Validate styling
    this.validateTemplateStyling(template.styling, errors, warnings);

    // Cross-reference validation
    this.validateCrossReferences(template, errors, warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate TDL metadata
   */
  private validateMetadata(metadata: unknown, errors: TemplateError[], warnings: TemplateError[]): void {
    if (!metadata) {
      errors.push({
        type: 'validation',
        message: 'Metadata is required'
      });
      return;
    }

    // Required fields
    if (!metadata.name || typeof metadata.name !== 'string') {
      errors.push({
        type: 'validation',
        message: 'Metadata.name is required and must be a string'
      });
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      warnings.push({
        type: 'validation',
        message: 'Metadata.version should be specified'
      });
    }

    if (!metadata.description || typeof metadata.description !== 'string') {
      warnings.push({
        type: 'validation',
        message: 'Metadata.description should be provided'
      });
    }

    if (!metadata.author || typeof metadata.author !== 'string') {
      warnings.push({
        type: 'validation',
        message: 'Metadata.author should be specified'
      });
    }

    // Optional fields validation
    if (metadata.tags && !Array.isArray(metadata.tags)) {
      errors.push({
        type: 'validation',
        message: 'Metadata.tags must be an array'
      });
    }

    if (metadata.extends && typeof metadata.extends !== 'string') {
      errors.push({
        type: 'validation',
        message: 'Metadata.extends must be a string'
      });
    }
  }

  /**
   * Validate TDL sections
   */
  private validateSections(sections: unknown, errors: TemplateError[], warnings: TemplateError[]): void {
    if (!sections) {
      errors.push({
        type: 'validation',
        message: 'Sections are required'
      });
      return;
    }

    if (!Array.isArray(sections)) {
      errors.push({
        type: 'validation',
        message: 'Sections must be an array'
      });
      return;
    }

    if (sections.length === 0) {
      warnings.push({
        type: 'validation',
        message: 'Template has no sections'
      });
    }

    const sectionIds = new Set<string>();

    sections.forEach((section: unknown, index: number) => {
      this.validateSection(section, index, sectionIds, errors, warnings);
    });
  }

  /**
   * Validate a single section
   */
  private validateSection(
    section: unknown, 
    index: number, 
    sectionIds: Set<string>, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    const sectionPath = `sections[${index}]`;

    if (!section || typeof section !== 'object') {
      errors.push({
        type: 'validation',
        message: `${sectionPath} must be an object`,
        path: sectionPath
      });
      return;
    }

    // Validate required fields
    if (!section.id || typeof section.id !== 'string') {
      errors.push({
        type: 'validation',
        message: `${sectionPath}.id is required and must be a string`,
        path: `${sectionPath}.id`
      });
    } else if (sectionIds.has(section.id)) {
      errors.push({
        type: 'validation',
        message: `Duplicate section ID: ${section.id}`,
        path: `${sectionPath}.id`
      });
    } else {
      sectionIds.add(section.id);
    }

    if (!section.title || typeof section.title !== 'string') {
      errors.push({
        type: 'validation',
        message: `${sectionPath}.title is required and must be a string`,
        path: `${sectionPath}.title`
      });
    }

    // Validate fields
    if (section.fields) {
      if (!Array.isArray(section.fields)) {
        errors.push({
          type: 'validation',
          message: `${sectionPath}.fields must be an array`,
          path: `${sectionPath}.fields`
        });
      } else {
        const fieldIds = new Set<string>();
        section.fields.forEach((field: unknown, fieldIndex: number) => {
          this.validateField(field, `${sectionPath}.fields[${fieldIndex}]`, fieldIds, errors, warnings);
        });
      }
    }

    // Validate conditional
    if (section.conditional) {
      this.validateConditional(section.conditional, `${sectionPath}.conditional`, errors, warnings);
    }

    // Validate control flow
    if (section.controlFlow) {
      this.validateControlFlow(section.controlFlow, `${sectionPath}.controlFlow`, errors, warnings);
    }
  }

  /**
   * Validate a single field
   */
  private validateField(
    field: unknown, 
    fieldPath: string, 
    fieldIds: Set<string>, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (!field || typeof field !== 'object') {
      errors.push({
        type: 'validation',
        message: `${fieldPath} must be an object`,
        path: fieldPath
      });
      return;
    }

    // Validate required fields
    if (!field.id || typeof field.id !== 'string') {
      errors.push({
        type: 'validation',
        message: `${fieldPath}.id is required and must be a string`,
        path: `${fieldPath}.id`
      });
    } else if (fieldIds.has(field.id)) {
      errors.push({
        type: 'validation',
        message: `Duplicate field ID: ${field.id}`,
        path: `${fieldPath}.id`
      });
    } else {
      fieldIds.add(field.id);
    }

    if (!field.type || typeof field.type !== 'string') {
      errors.push({
        type: 'validation',
        message: `${fieldPath}.type is required and must be a string`,
        path: `${fieldPath}.type`
      });
    } else {
      const validTypes = ['text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date', 'file', 'range'];
      if (!validTypes.includes(field.type)) {
        warnings.push({
          type: 'validation',
          message: `Unknown field type: ${field.type}`,
          path: `${fieldPath}.type`
        });
      }
    }

    if (!field.label || typeof field.label !== 'string') {
      errors.push({
        type: 'validation',
        message: `${fieldPath}.label is required and must be a string`,
        path: `${fieldPath}.label`
      });
    }

    // Validate optional fields
    if (field.placeholder && typeof field.placeholder !== 'string') {
      errors.push({
        type: 'validation',
        message: `${fieldPath}.placeholder must be a string`,
        path: `${fieldPath}.placeholder`
      });
    }

    if (field.required && typeof field.required !== 'boolean') {
      errors.push({
        type: 'validation',
        message: `${fieldPath}.required must be a boolean`,
        path: `${fieldPath}.required`
      });
    }

    if (field.multiple && typeof field.multiple !== 'boolean') {
      errors.push({
        type: 'validation',
        message: `${fieldPath}.multiple must be a boolean`,
        path: `${fieldPath}.multiple`
      });
    }

    // Validate options for select/radio/checkbox fields
    if (field.options) {
      if (!Array.isArray(field.options)) {
        errors.push({
          type: 'validation',
          message: `${fieldPath}.options must be an array`,
          path: `${fieldPath}.options`
        });
      } else if (['select', 'radio', 'checkbox'].includes(field.type) && field.options.length === 0) {
        warnings.push({
          type: 'validation',
          message: `${field.type} field should have options`,
          path: `${fieldPath}.options`
        });
      }
    }

    // Validate validation rules
    if (field.validation) {
      this.validateFieldValidation(field.validation, `${fieldPath}.validation`, errors, warnings);
    }

    // Validate conditional
    if (field.conditional) {
      this.validateConditional(field.conditional, `${fieldPath}.conditional`, errors, warnings);
    }

    // Validate control flow
    if (field.controlFlow) {
      this.validateControlFlow(field.controlFlow, `${fieldPath}.controlFlow`, errors, warnings);
    }
  }

  /**
   * Validate field validation rules
   */
  private validateFieldValidation(
    validation: unknown, 
    validationPath: string, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (typeof validation !== 'object' || validation === null) {
      errors.push({
        type: 'validation',
        message: `${validationPath} must be an object`,
        path: validationPath
      });
      return;
    }

    // Validate numeric constraints
    ['min', 'max', 'minLength', 'maxLength'].forEach(prop => {
      if (validation[prop] !== undefined && typeof validation[prop] !== 'number') {
        errors.push({
          type: 'validation',
          message: `${validationPath}.${prop} must be a number`,
          path: `${validationPath}.${prop}`
        });
      }
    });

    // Validate pattern
    if (validation.pattern && typeof validation.pattern !== 'string') {
      errors.push({
        type: 'validation',
        message: `${validationPath}.pattern must be a string`,
        path: `${validationPath}.pattern`
      });
    }

    // Validate custom function
    if (validation.custom && typeof validation.custom !== 'function') {
      errors.push({
        type: 'validation',
        message: `${validationPath}.custom must be a function`,
        path: `${validationPath}.custom`
      });
    }
  }

  /**
   * Validate conditional logic
   */
  private validateConditional(
    conditional: unknown, 
    conditionalPath: string, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (typeof conditional !== 'object' || conditional === null) {
      errors.push({
        type: 'validation',
        message: `${conditionalPath} must be an object`,
        path: conditionalPath
      });
      return;
    }

    if (!conditional.dependsOn || typeof conditional.dependsOn !== 'string') {
      errors.push({
        type: 'validation',
        message: `${conditionalPath}.dependsOn is required and must be a string`,
        path: `${conditionalPath}.dependsOn`
      });
    }

    if (!conditional.values || !Array.isArray(conditional.values)) {
      errors.push({
        type: 'validation',
        message: `${conditionalPath}.values is required and must be an array`,
        path: `${conditionalPath}.values`
      });
    }

    if (!conditional.operator || typeof conditional.operator !== 'string') {
      errors.push({
        type: 'validation',
        message: `${conditionalPath}.operator is required and must be a string`,
        path: `${conditionalPath}.operator`
      });
    } else {
      const validOperators = ['equals', 'contains', 'not_equals'];
      if (!validOperators.includes(conditional.operator)) {
        errors.push({
          type: 'validation',
          message: `Invalid operator: ${conditional.operator}. Must be one of: ${validOperators.join(', ')}`,
          path: `${conditionalPath}.operator`
        });
      }
    }
  }

  /**
   * Validate control flow configuration
   */
  private validateControlFlow(
    controlFlow: unknown, 
    controlFlowPath: string, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (typeof controlFlow !== 'object' || controlFlow === null) {
      errors.push({
        type: 'validation',
        message: `${controlFlowPath} must be an object`,
        path: controlFlowPath
      });
      return;
    }

    // Validate if/else structure
    if (controlFlow.if) {
      this.validateControlFlowIf(controlFlow, `${controlFlowPath}.if`, errors, warnings);
    }

    // Validate forEach
    if (controlFlow.forEach) {
      this.validateControlFlowForEach(controlFlow.forEach, `${controlFlowPath}.forEach`, errors, warnings);
    }

    // Validate repeat
    if (controlFlow.repeat) {
      this.validateControlFlowRepeat(controlFlow.repeat, `${controlFlowPath}.repeat`, errors, warnings);
    }

    // Validate while
    if (controlFlow.while) {
      this.validateControlFlowWhile(controlFlow.while, `${controlFlowPath}.while`, errors, warnings);
    }
  }

  /**
   * Validate if/else control flow
   */
  private validateControlFlowIf(
    controlFlow: unknown, 
    ifPath: string, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (!controlFlow.if.condition || typeof controlFlow.if.condition !== 'string') {
      errors.push({
        type: 'validation',
        message: `${ifPath}.condition is required and must be a string`,
        path: `${ifPath}.condition`
      });
    }

    if (!controlFlow.if.then || !Array.isArray(controlFlow.if.then)) {
      errors.push({
        type: 'validation',
        message: `${ifPath}.then is required and must be an array`,
        path: `${ifPath}.then`
      });
    }

    // Validate elseIf branches
    if (controlFlow.elseIf) {
      if (!Array.isArray(controlFlow.elseIf)) {
        errors.push({
          type: 'validation',
          message: `${ifPath}.elseIf must be an array`,
          path: `${ifPath}.elseIf`
        });
      } else {
        controlFlow.elseIf.forEach((branch: unknown, index: number) => {
          const branchPath = `${ifPath}.elseIf[${index}]`;
          if (!branch.condition || typeof branch.condition !== 'string') {
            errors.push({
              type: 'validation',
              message: `${branchPath}.condition is required and must be a string`,
              path: `${branchPath}.condition`
            });
          }
          if (!branch.then || !Array.isArray(branch.then)) {
            errors.push({
              type: 'validation',
              message: `${branchPath}.then is required and must be an array`,
              path: `${branchPath}.then`
            });
          }
        });
      }
    }

    // Validate else branch
    if (controlFlow.else && !Array.isArray(controlFlow.else) && !controlFlow.else.fields) {
      errors.push({
        type: 'validation',
        message: `${ifPath}.else must be an array or have fields property`,
        path: `${ifPath}.else`
      });
    }
  }

  /**
   * Validate forEach control flow
   */
  private validateControlFlowForEach(
    forEach: unknown, 
    forEachPath: string, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (!forEach.array || typeof forEach.array !== 'string') {
      errors.push({
        type: 'validation',
        message: `${forEachPath}.array is required and must be a string`,
        path: `${forEachPath}.array`
      });
    }

    if (!forEach.variable || typeof forEach.variable !== 'string') {
      errors.push({
        type: 'validation',
        message: `${forEachPath}.variable is required and must be a string`,
        path: `${forEachPath}.variable`
      });
    }

    if (!forEach.do || !Array.isArray(forEach.do)) {
      errors.push({
        type: 'validation',
        message: `${forEachPath}.do is required and must be an array`,
        path: `${forEachPath}.do`
      });
    }
  }

  /**
   * Validate repeat control flow
   */
  private validateControlFlowRepeat(
    repeat: unknown, 
    repeatPath: string, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (repeat.count === undefined || (typeof repeat.count !== 'number' && typeof repeat.count !== 'string')) {
      errors.push({
        type: 'validation',
        message: `${repeatPath}.count is required and must be a number or string`,
        path: `${repeatPath}.count`
      });
    }

    if (repeat.variable && typeof repeat.variable !== 'string') {
      errors.push({
        type: 'validation',
        message: `${repeatPath}.variable must be a string`,
        path: `${repeatPath}.variable`
      });
    }

    if (!repeat.do || !Array.isArray(repeat.do)) {
      errors.push({
        type: 'validation',
        message: `${repeatPath}.do is required and must be an array`,
        path: `${repeatPath}.do`
      });
    }
  }

  /**
   * Validate while control flow
   */
  private validateControlFlowWhile(
    whileLoop: unknown, 
    whilePath: string, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (!whileLoop.condition || typeof whileLoop.condition !== 'string') {
      errors.push({
        type: 'validation',
        message: `${whilePath}.condition is required and must be a string`,
        path: `${whilePath}.condition`
      });
    }

    if (!whileLoop.do || !Array.isArray(whileLoop.do)) {
      errors.push({
        type: 'validation',
        message: `${whilePath}.do is required and must be an array`,
        path: `${whilePath}.do`
      });
    }
  }

  /**
   * Validate variables
   */
  private validateVariables(
    variables: unknown, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (typeof variables !== 'object' || variables === null) {
      errors.push({
        type: 'validation',
        message: 'Variables must be an object',
        path: 'variables'
      });
    }
  }

  /**
   * Validate schema
   */
  private validateSchema(
    schema: unknown, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (typeof schema !== 'object' || schema === null) {
      errors.push({
        type: 'validation',
        message: 'Schema must be an object',
        path: 'schema'
      });
      return;
    }

    if (schema.validation && !['strict', 'loose', 'none'].includes(schema.validation)) {
      errors.push({
        type: 'validation',
        message: 'Schema.validation must be "strict", "loose", or "none"',
        path: 'schema.validation'
      });
    }

    if (schema.requiredFields && !Array.isArray(schema.requiredFields)) {
      errors.push({
        type: 'validation',
        message: 'Schema.requiredFields must be an array',
        path: 'schema.requiredFields'
      });
    }
  }

  /**
   * Validate behavior
   */
  private validateBehavior(
    behavior: unknown, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (typeof behavior !== 'object' || behavior === null) {
      errors.push({
        type: 'validation',
        message: 'Behavior must be an object',
        path: 'behavior'
      });
      return;
    }

    if (behavior.autoSave !== undefined && typeof behavior.autoSave !== 'boolean') {
      errors.push({
        type: 'validation',
        message: 'Behavior.autoSave must be a boolean',
        path: 'behavior.autoSave'
      });
    }

    if (behavior.autoSaveInterval !== undefined && typeof behavior.autoSaveInterval !== 'number') {
      errors.push({
        type: 'validation',
        message: 'Behavior.autoSaveInterval must be a number',
        path: 'behavior.autoSaveInterval'
      });
    }

    if (behavior.showProgress !== undefined && typeof behavior.showProgress !== 'boolean') {
      errors.push({
        type: 'validation',
        message: 'Behavior.showProgress must be a boolean',
        path: 'behavior.showProgress'
      });
    }
  }

  /**
   * Validate styling
   */
  private validateStyling(
    styling: unknown, 
    errors: TemplateError[], 
    warnings: TemplateError[]
  ): void {
    if (typeof styling !== 'object' || styling === null) {
      errors.push({
        type: 'validation',
        message: 'Styling must be an object',
        path: 'styling'
      });
      return;
    }

    if (styling.layout && !['fixed', 'fluid', 'adaptive'].includes(styling.layout)) {
      errors.push({
        type: 'validation',
        message: 'Styling.layout must be "fixed", "fluid", or "adaptive"',
        path: 'styling.layout'
      });
    }

    if (styling.spacing && !['compact', 'normal', 'comfortable'].includes(styling.spacing)) {
      errors.push({
        type: 'validation',
        message: 'Styling.spacing must be "compact", "normal", or "comfortable"',
        path: 'styling.spacing'
      });
    }
  }

  // Additional validation methods for ProgrammaticTemplate would follow similar patterns
  private validateTemplateMetadata(metadata: unknown, errors: TemplateError[], warnings: TemplateError[]): void {
    // Similar to validateMetadata but for ProgrammaticTemplate
  }

  private validateTemplateSchema(schema: unknown, errors: TemplateError[], warnings: TemplateError[]): void {
    // Similar to validateSchema but for ProgrammaticTemplate
  }

  private validateTemplateSections(sections: unknown, errors: TemplateError[], warnings: TemplateError[]): void {
    // Similar to validateSections but for ProgrammaticTemplate
  }

  private validateTemplateBehavior(behavior: unknown, errors: TemplateError[], warnings: TemplateError[]): void {
    // Similar to validateBehavior but for ProgrammaticTemplate
  }

  private validateTemplateStyling(styling: unknown, errors: TemplateError[], warnings: TemplateError[]): void {
    // Similar to validateStyling but for ProgrammaticTemplate
  }

  private validateCrossReferences(template: ProgrammaticTemplate, errors: TemplateError[], warnings: TemplateError[]): void {
    // Validate that referenced field IDs exist, etc.
    const fieldIds = new Set<string>();
    
    // Collect all field IDs
    for (const section of template.sections) {
      for (const field of section.fields) {
        fieldIds.add(field.id);
      }
    }

    // Check conditional dependencies
    for (const section of template.sections) {
      if (section.conditional?.dependsOn && !fieldIds.has(section.conditional.dependsOn)) {
        warnings.push({
          type: 'validation',
          message: `Section '${section.title}' depends on non-existent field: ${section.conditional.dependsOn}`
        });
      }

      for (const field of section.fields) {
        if (field.conditional?.dependsOn && !fieldIds.has(field.conditional.dependsOn)) {
          warnings.push({
            type: 'validation',
            message: `Field '${field.label}' depends on non-existent field: ${field.conditional.dependsOn}`
          });
        }
      }
    }
  }
}