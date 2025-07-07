import { FormTemplate, FormSection, FormField } from '../../types/form';
import { 
  ProgrammaticTemplate, 
  ProgrammaticSection, 
  ProgrammaticField, 
  ConversionOptions, 
  ConversionResult, 
  TemplateError 
} from '../types';

export class TDLConverter {
  /**
   * Convert GUI FormTemplate to ProgrammaticTemplate
   */
  convertFromGUI(
    guiTemplate: FormTemplate, 
    options: ConversionOptions = {}
  ): ConversionResult {
    const errors: TemplateError[] = [];
    const warnings: TemplateError[] = [];

    try {
      const programmaticTemplate: ProgrammaticTemplate = {
        metadata: {
          name: guiTemplate.name,
          version: '1.0.0',
          description: guiTemplate.description,
          author: 'gui-converter',
          tags: ['converted', 'gui'],
          created: guiTemplate.createdAt,
          updated: guiTemplate.updatedAt
        },
        schema: {
          validation: options.strict ? 'strict' : 'loose',
          requiredFields: this.extractRequiredFields(guiTemplate.sections)
        },
        sections: this.convertSectionsFromGUI(guiTemplate.sections, options),
        validation: {},
        styling: {
          theme: 'default',
          layout: 'fluid',
          spacing: 'normal'
        },
        behavior: {
          autoSave: false,
          showProgress: false
        },
        variables: {}
      };

      // Generate metadata if requested
      if (options.generateMetadata) {
        programmaticTemplate.metadata.tags.push(...this.generateTags(guiTemplate));
      }

      return {
        success: true,
        result: programmaticTemplate,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        type: 'runtime',
        message: `Failed to convert GUI template: ${error instanceof Error ? error.message : String(error)}`
      });

      return {
        success: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Convert ProgrammaticTemplate to GUI FormTemplate
   */
  convertToGUI(
    programmaticTemplate: ProgrammaticTemplate, 
    options: ConversionOptions = {}
  ): ConversionResult {
    const errors: TemplateError[] = [];
    const warnings: TemplateError[] = [];

    try {
      const guiTemplate: FormTemplate = {
        id: options.preserveIds ? programmaticTemplate.metadata.name : this.generateId(),
        name: programmaticTemplate.metadata.name,
        description: programmaticTemplate.metadata.description,
        sections: this.convertSectionsToGUI(programmaticTemplate.sections, options, errors, warnings),
        createdAt: programmaticTemplate.metadata.created,
        updatedAt: programmaticTemplate.metadata.updated
      };

      // Warn about lost features
      if (programmaticTemplate.variables && Object.keys(programmaticTemplate.variables).length > 0) {
        warnings.push({
          type: 'validation',
          message: 'Template variables will be lost in GUI conversion'
        });
      }

      if (programmaticTemplate.sections.some(s => s.controlFlow)) {
        warnings.push({
          type: 'validation',
          message: 'Control flow logic will be lost in GUI conversion'
        });
      }

      return {
        success: true,
        result: guiTemplate,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        type: 'runtime',
        message: `Failed to convert programmatic template: ${error instanceof Error ? error.message : String(error)}`
      });

      return {
        success: false,
        errors,
        warnings
      };
    }
  }

  /**
   * Convert GUI sections to programmatic sections
   */
  private convertSectionsFromGUI(
    guiSections: FormSection[], 
    options: ConversionOptions
  ): ProgrammaticSection[] {
    return guiSections.map(guiSection => this.convertSectionFromGUI(guiSection, options));
  }

  /**
   * Convert a single GUI section to programmatic section
   */
  private convertSectionFromGUI(
    guiSection: FormSection, 
    options: ConversionOptions
  ): ProgrammaticSection {
    const programmaticSection: ProgrammaticSection = {
      id: options.preserveIds ? guiSection.id : this.generateId('section'),
      title: guiSection.title,
      fields: this.convertFieldsFromGUI(guiSection.fields, options),
      conditional: guiSection.conditional
    };

    return programmaticSection;
  }

  /**
   * Convert GUI fields to programmatic fields
   */
  private convertFieldsFromGUI(
    guiFields: FormField[], 
    options: ConversionOptions
  ): ProgrammaticField[] {
    return guiFields.map(guiField => this.convertFieldFromGUI(guiField, options));
  }

  /**
   * Convert a single GUI field to programmatic field
   */
  private convertFieldFromGUI(
    guiField: FormField, 
    options: ConversionOptions
  ): ProgrammaticField {
    const programmaticField: ProgrammaticField = {
      id: options.preserveIds ? guiField.id : this.generateId('field'),
      type: this.convertFieldType(guiField.type),
      label: guiField.label,
      placeholder: guiField.placeholder,
      required: guiField.required,
      options: guiField.options,
      multiple: guiField.multiple,
      validation: guiField.validation,
      conditional: guiField.conditional,
      defaultValue: guiField.defaultValue
    };

    return programmaticField;
  }

  /**
   * Convert programmatic sections to GUI sections
   */
  private convertSectionsToGUI(
    programmaticSections: ProgrammaticSection[], 
    options: ConversionOptions,
    errors: TemplateError[],
    warnings: TemplateError[]
  ): FormSection[] {
    const guiSections: FormSection[] = [];

    for (const programmaticSection of programmaticSections) {
      // Skip sections with control flow if not including control flow
      if (programmaticSection.controlFlow && !options.includeControlFlow) {
        warnings.push({
          type: 'validation',
          message: `Section '${programmaticSection.title}' has control flow logic that will be skipped`
        });
        continue;
      }

      const guiSection = this.convertSectionToGUI(programmaticSection, options, errors, warnings);
      guiSections.push(guiSection);
    }

    return guiSections;
  }

  /**
   * Convert a single programmatic section to GUI section
   */
  private convertSectionToGUI(
    programmaticSection: ProgrammaticSection, 
    options: ConversionOptions,
    errors: TemplateError[],
    warnings: TemplateError[]
  ): FormSection {
    const guiSection: FormSection = {
      id: options.preserveIds ? programmaticSection.id : this.generateId('section'),
      title: programmaticSection.title,
      fields: this.convertFieldsToGUI(programmaticSection.fields, options, errors, warnings),
      conditional: programmaticSection.conditional
    };

    return guiSection;
  }

  /**
   * Convert programmatic fields to GUI fields
   */
  private convertFieldsToGUI(
    programmaticFields: ProgrammaticField[], 
    options: ConversionOptions,
    errors: TemplateError[],
    warnings: TemplateError[]
  ): FormField[] {
    const guiFields: FormField[] = [];

    for (const programmaticField of programmaticFields) {
      // Skip fields with control flow if not including control flow
      if (programmaticField.controlFlow && !options.includeControlFlow) {
        warnings.push({
          type: 'validation',
          message: `Field '${programmaticField.label}' has control flow logic that will be skipped`
        });
        continue;
      }

      const guiField = this.convertFieldToGUI(programmaticField, options);
      guiFields.push(guiField);
    }

    return guiFields;
  }

  /**
   * Convert a single programmatic field to GUI field
   */
  private convertFieldToGUI(
    programmaticField: ProgrammaticField, 
    options: ConversionOptions
  ): FormField {
    const guiField: FormField = {
      id: options.preserveIds ? programmaticField.id : this.generateId('field'),
      type: this.convertFieldTypeToGUI(programmaticField.type),
      label: programmaticField.label,
      placeholder: programmaticField.placeholder,
      required: programmaticField.required || false,
      options: programmaticField.options,
      multiple: programmaticField.multiple,
      validation: programmaticField.validation,
      conditional: programmaticField.conditional,
      defaultValue: programmaticField.defaultValue
    };

    return guiField;
  }

  /**
   * Convert GUI field type to programmatic field type
   */
  private convertFieldType(guiType: FormField['type']): ProgrammaticField['type'] {
    // Most types are the same, just add 'range' for programmatic
    if (guiType === 'text' || guiType === 'textarea' || guiType === 'select' || 
        guiType === 'radio' || guiType === 'checkbox' || guiType === 'number' || 
        guiType === 'date' || guiType === 'file') {
      return guiType;
    }
    
    // Default to text for unknown types
    return 'text';
  }

  /**
   * Convert programmatic field type to GUI field type
   */
  private convertFieldTypeToGUI(programmaticType: ProgrammaticField['type']): FormField['type'] {
    // Handle 'range' type that doesn't exist in GUI
    if (programmaticType === 'range') {
      return 'number';
    }
    
    // Most types are the same
    if (programmaticType === 'text' || programmaticType === 'textarea' || 
        programmaticType === 'select' || programmaticType === 'radio' || 
        programmaticType === 'checkbox' || programmaticType === 'number' || 
        programmaticType === 'date' || programmaticType === 'file') {
      return programmaticType;
    }
    
    // Default to text for unknown types
    return 'text';
  }

  /**
   * Extract required fields from GUI sections
   */
  private extractRequiredFields(sections: FormSection[]): string[] {
    const requiredFields: string[] = [];
    
    for (const section of sections) {
      for (const field of section.fields) {
        if (field.required) {
          requiredFields.push(field.id);
        }
      }
    }
    
    return requiredFields;
  }

  /**
   * Generate tags based on GUI template analysis
   */
  private generateTags(guiTemplate: FormTemplate): string[] {
    const tags: string[] = [];
    
    // Analyze field types
    const fieldTypes = new Set<string>();
    for (const section of guiTemplate.sections) {
      for (const field of section.fields) {
        fieldTypes.add(field.type);
      }
    }
    
    // Add tags based on field types
    if (fieldTypes.has('file')) tags.push('file-upload');
    if (fieldTypes.has('date')) tags.push('date-input');
    if (fieldTypes.has('select') || fieldTypes.has('radio') || fieldTypes.has('checkbox')) {
      tags.push('multiple-choice');
    }
    
    // Analyze structure
    if (guiTemplate.sections.length > 1) {
      tags.push('multi-section');
    }
    
    // Check for conditional logic
    const hasConditionals = guiTemplate.sections.some(s => 
      s.conditional || s.fields.some(f => f.conditional)
    );
    if (hasConditionals) {
      tags.push('conditional');
    }
    
    // Analyze complexity
    const totalFields = guiTemplate.sections.reduce((sum, s) => sum + s.fields.length, 0);
    if (totalFields > 10) {
      tags.push('complex');
    } else if (totalFields <= 3) {
      tags.push('simple');
    }
    
    return tags;
  }

  /**
   * Generate unique ID
   */
  private generateId(prefix: string = 'item'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Check compatibility between GUI and programmatic templates
   */
  checkCompatibility(guiTemplate: FormTemplate): { compatible: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // Check for features that won't convert well
    for (const section of guiTemplate.sections) {
      for (const field of section.fields) {
        // Check validation patterns that might be too complex
        if (field.validation?.pattern && field.validation.pattern.length > 50) {
          issues.push(`Field '${field.label}' has complex validation pattern`);
        }
        
        // Check for very long option lists
        if (field.options && field.options.length > 20) {
          issues.push(`Field '${field.label}' has many options (${field.options.length})`);
        }
      }
    }
    
    return {
      compatible: issues.length === 0,
      issues
    };
  }

  /**
   * Get conversion statistics
   */
  getConversionStats(template: FormTemplate | ProgrammaticTemplate): any {
    if ('sections' in template && Array.isArray(template.sections)) {
      const sections = template.sections as any[];
      const totalFields = sections.reduce((sum, s) => sum + (s.fields?.length || 0), 0);
      const conditionalFields = sections.reduce((sum, s) => 
        sum + (s.fields?.filter((f: any) => f.conditional)?.length || 0), 0
      );
      const conditionalSections = sections.filter(s => s.conditional).length;
      
      return {
        sections: sections.length,
        fields: totalFields,
        conditionalFields,
        conditionalSections,
        complexity: totalFields > 10 ? 'high' : totalFields > 5 ? 'medium' : 'low'
      };
    }
    
    return { error: 'Invalid template structure' };
  }
}