import { 
  ProgrammaticTemplate, 
  ProgrammaticSection, 
  ProgrammaticField, 
  TemplateError, 
  ValidationResult, 
  ControlFlowConfig,
  Condition 
} from '../types';

export interface TDLDocument {
  metadata: {
    name: string;
    version: string;
    description: string;
    author: string;
    tags: string[];
    extends?: string;
  };
  variables?: Record<string, any>;
  schema?: {
    validation: 'strict' | 'loose' | 'none';
    requiredFields: string[];
  };
  sections: TDLSection[];
  behavior?: {
    autoSave?: boolean;
    autoSaveInterval?: number;
    showProgress?: boolean;
    conditionalLogic?: any[];
    functions?: Record<string, string>;
  };
  styling?: {
    theme?: string;
    layout?: 'fixed' | 'fluid' | 'adaptive';
    spacing?: 'compact' | 'normal' | 'comfortable';
    colors?: string[];
    animations?: boolean;
    conditionalStyling?: any[];
  };
}

export interface TDLSection {
  id: string;
  title: string;
  fields?: TDLField[];
  conditional?: {
    dependsOn: string;
    values: string[];
    operator: 'equals' | 'contains' | 'not_equals';
  };
  controlFlow?: TDLControlFlow;
}

export interface TDLField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  multiple?: boolean;
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  conditional?: {
    dependsOn: string;
    values: string[];
    operator: 'equals' | 'contains' | 'not_equals';
  };
  controlFlow?: TDLControlFlow;
}

export interface TDLControlFlow {
  if?: {
    condition: string;
    then: TDLField[] | any[];
  };
  elseIf?: {
    condition: string;
    then: TDLField[] | any[];
  }[];
  else?: {
    fields?: TDLField[];
  } | TDLField[];
  forEach?: {
    array: string;
    variable: string;
    do: TDLField[] | any[];
  };
  repeat?: {
    count: number | string;
    variable?: string;
    do: TDLField[] | any[];
  };
  while?: {
    condition: string;
    do: TDLField[] | any[];
  };
}

export class TDLParser {
  /**
   * Parse TDL document (JSON/YAML) into ProgrammaticTemplate
   */
  parse(tdlDocument: TDLDocument): ProgrammaticTemplate {
    const now = new Date();
    
    const template: ProgrammaticTemplate = {
      metadata: {
        name: tdlDocument.metadata.name,
        version: tdlDocument.metadata.version || '1.0.0',
        description: tdlDocument.metadata.description || '',
        author: tdlDocument.metadata.author || 'unknown',
        tags: tdlDocument.metadata.tags || [],
        extends: tdlDocument.metadata.extends,
        created: now,
        updated: now
      },
      schema: {
        validation: tdlDocument.schema?.validation || 'loose',
        requiredFields: tdlDocument.schema?.requiredFields || []
      },
      sections: this.parseSections(tdlDocument.sections),
      validation: {}, // Will be populated from field validations
      styling: {
        theme: tdlDocument.styling?.theme || 'default',
        layout: tdlDocument.styling?.layout || 'fluid',
        spacing: tdlDocument.styling?.spacing || 'normal',
        colors: tdlDocument.styling?.colors,
        animations: tdlDocument.styling?.animations || false,
        conditionalStyling: tdlDocument.styling?.conditionalStyling || []
      },
      behavior: {
        autoSave: tdlDocument.behavior?.autoSave || false,
        autoSaveInterval: tdlDocument.behavior?.autoSaveInterval,
        showProgress: tdlDocument.behavior?.showProgress || false,
        conditionalLogic: tdlDocument.behavior?.conditionalLogic || [],
        functions: tdlDocument.behavior?.functions || {}
      },
      variables: tdlDocument.variables || {}
    };

    return template;
  }

  /**
   * Parse sections from TDL
   */
  private parseSections(tdlSections: TDLSection[]): ProgrammaticSection[] {
    return tdlSections.map(tdlSection => this.parseSection(tdlSection));
  }

  /**
   * Parse a single section
   */
  private parseSection(tdlSection: TDLSection): ProgrammaticSection {
    const section: ProgrammaticSection = {
      id: tdlSection.id,
      title: tdlSection.title,
      fields: tdlSection.fields ? this.parseFields(tdlSection.fields) : [],
      conditional: tdlSection.conditional
    };

    // Parse control flow if present
    if (tdlSection.controlFlow) {
      section.controlFlow = this.parseControlFlow(tdlSection.controlFlow);
    }

    return section;
  }

  /**
   * Parse fields from TDL
   */
  private parseFields(tdlFields: TDLField[]): ProgrammaticField[] {
    return tdlFields.map(tdlField => this.parseField(tdlField));
  }

  /**
   * Parse a single field
   */
  private parseField(tdlField: TDLField): ProgrammaticField {
    const field: ProgrammaticField = {
      id: tdlField.id,
      type: this.parseFieldType(tdlField.type),
      label: tdlField.label,
      placeholder: tdlField.placeholder,
      required: tdlField.required || false,
      options: tdlField.options,
      multiple: tdlField.multiple,
      validation: tdlField.validation,
      conditional: tdlField.conditional
    };

    // Parse control flow if present
    if (tdlField.controlFlow) {
      field.controlFlow = this.parseControlFlow(tdlField.controlFlow);
    }

    return field;
  }

  /**
   * Parse field type with validation
   */
  private parseFieldType(type: string): ProgrammaticField['type'] {
    const validTypes: ProgrammaticField['type'][] = [
      'text', 'textarea', 'select', 'radio', 'checkbox', 'number', 'date', 'file', 'range'
    ];

    if (validTypes.includes(type as ProgrammaticField['type'])) {
      return type as ProgrammaticField['type'];
    }

    console.warn(`Unknown field type: ${type}, defaulting to 'text'`);
    return 'text';
  }

  /**
   * Parse control flow configuration
   */
  private parseControlFlow(tdlControlFlow: TDLControlFlow): ControlFlowConfig {
    const controlFlow: ControlFlowConfig = {};

    // Parse conditional logic
    if (tdlControlFlow.if) {
      controlFlow.if = this.parseConditionString(tdlControlFlow.if.condition);
      controlFlow.then = this.parseControlFlowActions(tdlControlFlow.if.then);
      
      if (tdlControlFlow.elseIf) {
        controlFlow.elseIf = tdlControlFlow.elseIf.map(branch => ({
          condition: this.parseConditionString(branch.condition),
          then: this.parseControlFlowActions(branch.then)
        }));
      }
      
      if (tdlControlFlow.else) {
        if (Array.isArray(tdlControlFlow.else)) {
          controlFlow.else = this.parseControlFlowActions(tdlControlFlow.else);
        } else if (tdlControlFlow.else.fields) {
          controlFlow.else = this.parseControlFlowActions(tdlControlFlow.else.fields);
        }
      }
    }

    // Parse forEach loop
    if (tdlControlFlow.forEach) {
      controlFlow.forEach = {
        array: tdlControlFlow.forEach.array,
        variable: tdlControlFlow.forEach.variable,
        do: this.parseControlFlowActions(tdlControlFlow.forEach.do)
      };
    }

    // Parse repeat loop
    if (tdlControlFlow.repeat) {
      controlFlow.repeat = {
        count: tdlControlFlow.repeat.count,
        variable: tdlControlFlow.repeat.variable,
        do: this.parseControlFlowActions(tdlControlFlow.repeat.do)
      };
    }

    // Parse while loop
    if (tdlControlFlow.while) {
      controlFlow.while = {
        condition: this.parseConditionString(tdlControlFlow.while.condition),
        do: this.parseControlFlowActions(tdlControlFlow.while.do)
      };
    }

    return controlFlow;
  }

  /**
   * Parse condition string into Condition object
   */
  private parseConditionString(conditionStr: string): Condition {
    // Handle simple variable references
    if (conditionStr.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      return {
        type: 'variable',
        variable: conditionStr
      };
    }

    // Handle comparison operators
    const comparisonMatch = conditionStr.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
    if (comparisonMatch) {
      const [, left, op, right] = comparisonMatch;
      return {
        type: 'comparison',
        variable: left.trim(),
        operator: this.mapOperator(op),
        value: this.parseValue(right.trim())
      };
    }

    // Handle 'in' operator
    const inMatch = conditionStr.match(/^(.+?)\s+in\s+(.+)$/);
    if (inMatch) {
      const [, left, right] = inMatch;
      return {
        type: 'comparison',
        variable: left.trim(),
        operator: 'in',
        value: this.parseArrayValue(right.trim())
      };
    }

    // Handle 'contains' operator
    const containsMatch = conditionStr.match(/^(.+?)\s+contains\s+(.+)$/);
    if (containsMatch) {
      const [, left, right] = containsMatch;
      return {
        type: 'comparison',
        variable: left.trim(),
        operator: 'contains',
        value: this.parseValue(right.trim())
      };
    }

    // Default to expression
    return {
      type: 'expression',
      expression: conditionStr
    };
  }

  /**
   * Parse control flow actions
   */
  private parseControlFlowActions(actions: any[]): any[] {
    return actions.map(action => {
      if (action.type) {
        // Already a template action
        return action;
      } else if (action.id && action.label) {
        // It's a field definition
        return this.parseField(action);
      } else {
        // Convert to template action
        return {
          type: 'createField',
          data: action
        };
      }
    });
  }

  /**
   * Map string operators to condition operators
   */
  private mapOperator(op: string): Condition['operator'] {
    const operatorMap: Record<string, Condition['operator']> = {
      '==': 'eq',
      '!=': 'neq',
      '>': 'gt',
      '>=': 'gte',
      '<': 'lt',
      '<=': 'lte'
    };
    return operatorMap[op] || 'eq';
  }

  /**
   * Parse a value string into appropriate type
   */
  private parseValue(valueStr: string): any {
    valueStr = valueStr.trim();

    // Handle quoted strings
    if ((valueStr.startsWith('"') && valueStr.endsWith('"')) ||
        (valueStr.startsWith("'") && valueStr.endsWith("'"))) {
      return valueStr.slice(1, -1);
    }

    // Handle numbers
    if (!isNaN(Number(valueStr))) {
      return Number(valueStr);
    }

    // Handle booleans
    if (valueStr === 'true') return true;
    if (valueStr === 'false') return false;

    // Handle null/undefined
    if (valueStr === 'null') return null;
    if (valueStr === 'undefined') return undefined;

    // Default to string
    return valueStr;
  }

  /**
   * Parse array value string
   */
  private parseArrayValue(valueStr: string): any[] {
    valueStr = valueStr.trim();

    // Handle array literal
    if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
      try {
        return JSON.parse(valueStr);
      } catch {
        // If JSON parsing fails, try simple comma-separated values
        const items = valueStr.slice(1, -1).split(',').map(item => this.parseValue(item.trim()));
        return items;
      }
    }

    // Handle comma-separated values
    if (valueStr.includes(',')) {
      return valueStr.split(',').map(item => this.parseValue(item.trim()));
    }

    // Single value as array
    return [this.parseValue(valueStr)];
  }

  /**
   * Convert ProgrammaticTemplate back to TDL document
   */
  serialize(template: ProgrammaticTemplate): TDLDocument {
    const tdlDocument: TDLDocument = {
      metadata: {
        name: template.metadata.name,
        version: template.metadata.version,
        description: template.metadata.description,
        author: template.metadata.author,
        tags: template.metadata.tags,
        extends: template.metadata.extends
      },
      sections: this.serializeSections(template.sections)
    };

    // Add optional properties
    if (template.variables && Object.keys(template.variables).length > 0) {
      tdlDocument.variables = template.variables;
    }

    if (template.schema.validation !== 'loose' || template.schema.requiredFields.length > 0) {
      tdlDocument.schema = {
        validation: template.schema.validation,
        requiredFields: template.schema.requiredFields
      };
    }

    if (template.behavior.autoSave || template.behavior.showProgress || 
        template.behavior.conditionalLogic?.length || Object.keys(template.behavior.functions || {}).length) {
      tdlDocument.behavior = {
        autoSave: template.behavior.autoSave,
        autoSaveInterval: template.behavior.autoSaveInterval,
        showProgress: template.behavior.showProgress,
        conditionalLogic: template.behavior.conditionalLogic,
        functions: template.behavior.functions
      };
    }

    if (template.styling.theme !== 'default' || template.styling.layout !== 'fluid' || 
        template.styling.spacing !== 'normal' || template.styling.colors || 
        template.styling.animations || template.styling.conditionalStyling?.length) {
      tdlDocument.styling = {
        theme: template.styling.theme,
        layout: template.styling.layout,
        spacing: template.styling.spacing,
        colors: template.styling.colors,
        animations: template.styling.animations,
        conditionalStyling: template.styling.conditionalStyling
      };
    }

    return tdlDocument;
  }

  /**
   * Serialize sections to TDL format
   */
  private serializeSections(sections: ProgrammaticSection[]): TDLSection[] {
    return sections.map(section => this.serializeSection(section));
  }

  /**
   * Serialize a single section
   */
  private serializeSection(section: ProgrammaticSection): TDLSection {
    const tdlSection: TDLSection = {
      id: section.id,
      title: section.title
    };

    if (section.fields && section.fields.length > 0) {
      tdlSection.fields = this.serializeFields(section.fields);
    }

    if (section.conditional) {
      tdlSection.conditional = section.conditional;
    }

    if (section.controlFlow) {
      tdlSection.controlFlow = this.serializeControlFlow(section.controlFlow);
    }

    return tdlSection;
  }

  /**
   * Serialize fields to TDL format
   */
  private serializeFields(fields: ProgrammaticField[]): TDLField[] {
    return fields.map(field => this.serializeField(field));
  }

  /**
   * Serialize a single field
   */
  private serializeField(field: ProgrammaticField): TDLField {
    const tdlField: TDLField = {
      id: field.id,
      type: field.type,
      label: field.label
    };

    // Add optional properties
    if (field.placeholder) tdlField.placeholder = field.placeholder;
    if (field.required) tdlField.required = field.required;
    if (field.options) tdlField.options = field.options;
    if (field.multiple) tdlField.multiple = field.multiple;
    if (field.validation) tdlField.validation = field.validation;
    if (field.conditional) tdlField.conditional = field.conditional;
    if (field.controlFlow) tdlField.controlFlow = this.serializeControlFlow(field.controlFlow);

    return tdlField;
  }

  /**
   * Serialize control flow configuration
   */
  private serializeControlFlow(controlFlow: ControlFlowConfig): TDLControlFlow {
    const tdlControlFlow: TDLControlFlow = {};

    if (controlFlow.if) {
      tdlControlFlow.if = {
        condition: this.serializeCondition(controlFlow.if),
        then: controlFlow.then || []
      };

      if (controlFlow.elseIf) {
        tdlControlFlow.elseIf = controlFlow.elseIf.map(branch => ({
          condition: this.serializeCondition(branch.condition),
          then: branch.then || []
        }));
      }

      if (controlFlow.else) {
        tdlControlFlow.else = controlFlow.else;
      }
    }

    if (controlFlow.forEach) {
      tdlControlFlow.forEach = {
        array: controlFlow.forEach.array,
        variable: controlFlow.forEach.variable,
        do: controlFlow.forEach.do
      };
    }

    if (controlFlow.repeat) {
      tdlControlFlow.repeat = {
        count: controlFlow.repeat.count,
        variable: controlFlow.repeat.variable,
        do: controlFlow.repeat.do
      };
    }

    if (controlFlow.while) {
      tdlControlFlow.while = {
        condition: this.serializeCondition(controlFlow.while.condition),
        do: controlFlow.while.do
      };
    }

    return tdlControlFlow;
  }

  /**
   * Serialize condition to string
   */
  private serializeCondition(condition: Condition): string {
    switch (condition.type) {
      case 'variable':
        return condition.variable || '';
      case 'expression':
        return condition.expression || '';
      case 'comparison':
        const op = this.reverseMapOperator(condition.operator);
        return `${condition.variable} ${op} ${JSON.stringify(condition.value)}`;
      default:
        return '';
    }
  }

  /**
   * Reverse map condition operators to string
   */
  private reverseMapOperator(operator: Condition['operator']): string {
    const operatorMap: Record<string, string> = {
      'eq': '==',
      'neq': '!=',
      'gt': '>',
      'gte': '>=',
      'lt': '<',
      'lte': '<=',
      'in': 'in',
      'contains': 'contains'
    };
    return operatorMap[operator!] || '==';
  }
}