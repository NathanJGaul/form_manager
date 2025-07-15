import { 
  ProgrammaticTemplate, 
  ProgrammaticSection, 
  ProgrammaticField, 
  TemplateMetadata, 
  TemplateSchema, 
  ValidationRules, 
  StylingConfig, 
  BehaviorConfig, 
  Condition, 
  ConditionalBlock, 
  LoopBlock, 
  BuilderContext, 
  FluentBuilderOptions,
  TemplateError,
  ValidationResult 
} from '../types';
import { FormFieldValue } from '../../types/form';
import { 
  ConditionalLogic, 
  SingleCondition, 
  CompoundCondition 
} from '../../types/conditional';
import { TemplateContextManager } from '../control-flow/TemplateContext';
import { ControlFlowEngine } from '../control-flow/ControlFlowEngine';
import { ConditionEvaluator } from '../control-flow/ConditionEvaluator';

export class TemplateBuilder {
  private context: BuilderContext;
  private options: FluentBuilderOptions;
  private controlFlowEngine: ControlFlowEngine;
  private contextManager: TemplateContextManager;

  constructor(options: FluentBuilderOptions = {}) {
    this.options = {
      strict: false,
      validateOnBuild: true,
      autoId: true,
      defaultRequired: false,
      ...options
    };

    this.contextManager = new TemplateContextManager();
    this.controlFlowEngine = new ControlFlowEngine(this.contextManager);

    this.context = {
      template: {
        metadata: {
          name: '',
          version: '1.0.0',
          description: '',
          author: 'system',
          tags: [],
          created: new Date(),
          updated: new Date()
        },
        schema: {
          validation: 'loose',
          requiredFields: []
        },
        sections: [],
        validation: {},
        styling: {
          theme: 'default',
          layout: 'fluid',
          spacing: 'normal'
        },
        behavior: {
          autoSave: true,
          showProgress: false
        },
        variables: {}
      },
      variables: {},
      conditionalStack: [],
      loopStack: []
    };
  }

  /**
   * Create a new template with the given name
   */
  create(name: string): TemplateBuilder {
    this.context.template.metadata!.name = name;
    return this;
  }

  /**
   * Set template description
   */
  description(desc: string): TemplateBuilder {
    this.context.template.metadata!.description = desc;
    return this;
  }

  /**
   * Set template version
   */
  version(version: string): TemplateBuilder {
    this.context.template.metadata!.version = version;
    return this;
  }

  /**
   * Set template author
   */
  author(author: string): TemplateBuilder {
    this.context.template.metadata!.author = author;
    return this;
  }

  /**
   * Add tags to template
   */
  tags(...tags: string[]): TemplateBuilder {
    this.context.template.metadata!.tags.push(...tags);
    return this;
  }

  /**
   * Set template variables
   */
  variables(variables: Record<string, unknown>): TemplateBuilder {
    this.context.template.variables = { ...this.context.template.variables, ...variables };
    this.context.variables = { ...this.context.variables, ...variables };
    this.contextManager.setVariable('variables', this.context.variables);
    return this;
  }

  /**
   * Set validation schema
   */
  schema(validation: 'strict' | 'loose' | 'none'): TemplateBuilder {
    this.context.template.schema!.validation = validation;
    return this;
  }

  /**
   * Add required fields
   */
  requiredFields(...fields: string[]): TemplateBuilder {
    this.context.template.schema!.requiredFields.push(...fields);
    return this;
  }

  /**
   * Create a new section
   */
  section(title: string): SectionBuilder {
    const section: ProgrammaticSection = {
      id: this.generateId('section'),
      title,
      fields: []
    };

    this.context.currentSection = section;
    this.context.template.sections!.push(section);
    
    return new SectionBuilder(this, section);
  }

  /**
   * Add field to current section
   */
  field(type: ProgrammaticField['type'], label: string): FieldBuilder {
    if (!this.context.currentSection) {
      throw new Error('Cannot add field without a section. Call section() first.');
    }

    const field: ProgrammaticField = {
      id: this.generateId('field'),
      type,
      label,
      required: this.options.defaultRequired || false
    };

    this.context.currentField = field;
    this.context.currentSection.fields.push(field);
    
    return new FieldBuilder(this, field);
  }

  /**
   * Conditional execution (if/else if/else)
   */
  if(condition: string | Condition): ConditionalBuilder {
    const parsedCondition = typeof condition === 'string' 
      ? ConditionEvaluator.parseConditionString(condition)
      : condition;

    const conditionalBlock: ConditionalBlock = {
      if: parsedCondition,
      then: []
    };

    this.context.conditionalStack.push(conditionalBlock);
    
    return new ConditionalBuilder(this, conditionalBlock);
  }

  /**
   * Loop execution - forEach
   */
  forEach(array: string | unknown[], callback: (item: unknown, index: number, builder: TemplateBuilder) => void): TemplateBuilder {
    const arrayValue = typeof array === 'string' ? this.contextManager.getVariable(array) : array;
    
    if (!Array.isArray(arrayValue)) {
      console.warn('forEach requires an array:', arrayValue);
      return this;
    }

    // Execute callback for each item
    arrayValue.forEach((item, index) => {
      // Create new scope for loop iteration
      this.contextManager.createScope({ 
        [array.toString()]: item, 
        index, 
        item,
        length: arrayValue.length 
      });

      try {
        callback(item, index, this);
      } finally {
        // Always exit scope
        this.contextManager.exitScope();
      }
    });

    return this;
  }

  /**
   * Loop execution - repeat
   */
  repeat(count: number, callback: (index: number, builder: TemplateBuilder) => void): TemplateBuilder {
    for (let i = 0; i < count; i++) {
      this.contextManager.createScope({ index: i, count });
      
      try {
        callback(i, this);
      } finally {
        this.contextManager.exitScope();
      }
    }

    return this;
  }

  /**
   * Loop execution - while
   */
  while(condition: string | Condition, callback: (builder: TemplateBuilder) => void): TemplateBuilder {
    const parsedCondition = typeof condition === 'string' 
      ? ConditionEvaluator.parseConditionString(condition)
      : condition;

    const conditionEvaluator = new ConditionEvaluator(this.contextManager);
    let iterations = 0;
    const maxIterations = 10000;

    while (conditionEvaluator.evaluate(parsedCondition) && iterations < maxIterations) {
      this.contextManager.createScope({ iteration: iterations });
      
      try {
        callback(this);
      } finally {
        this.contextManager.exitScope();
      }

      iterations++;
    }

    if (iterations >= maxIterations) {
      console.warn('While loop exceeded maximum iterations');
    }

    return this;
  }

  /**
   * Set auto-save behavior
   */
  autoSave(interval?: number): TemplateBuilder {
    this.context.template.behavior!.autoSave = true;
    if (interval) {
      this.context.template.behavior!.autoSaveInterval = interval;
    }
    return this;
  }

  /**
   * Enable progress display
   */
  showProgress(): TemplateBuilder {
    this.context.template.behavior!.showProgress = true;
    return this;
  }

  /**
   * Set styling configuration
   */
  styling(config: Partial<StylingConfig>): TemplateBuilder {
    this.context.template.styling = { ...this.context.template.styling, ...config };
    return this;
  }

  /**
   * Add conditional logic
   */
  conditionalLogic(): ConditionalLogicBuilder {
    return new ConditionalLogicBuilder(this);
  }

  /**
   * Extend another template
   */
  extend(templateId: string): TemplateBuilder {
    this.context.template.metadata!.extends = templateId;
    return this;
  }

  /**
   * Clone existing template
   */
  clone(templateId: string): TemplateBuilder {
    // Implementation would load and clone existing template
    console.warn('Clone functionality not yet implemented');
    return this;
  }

  /**
   * Build the final template
   */
  build(): ProgrammaticTemplate {
    const template = this.context.template as ProgrammaticTemplate;
    
    // Update metadata
    template.metadata.updated = new Date();
    
    // Validate if enabled
    if (this.options.validateOnBuild) {
      const validation = this.validate();
      if (!validation.valid && this.options.strict) {
        throw new Error(`Template validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
      }
    }

    return template;
  }

  /**
   * Validate current template
   */
  validate(): ValidationResult {
    const errors: TemplateError[] = [];
    const warnings: TemplateError[] = [];

    // Validate metadata
    if (!this.context.template.metadata?.name) {
      errors.push({
        type: 'validation',
        message: 'Template name is required'
      });
    }

    // Validate sections
    if (!this.context.template.sections || this.context.template.sections.length === 0) {
      warnings.push({
        type: 'validation',
        message: 'Template has no sections'
      });
    }

    // Validate fields
    for (const section of this.context.template.sections || []) {
      if (!section.fields || section.fields.length === 0) {
        warnings.push({
          type: 'validation',
          message: `Section '${section.title}' has no fields`
        });
      }

      for (const field of section.fields || []) {
        if (!field.id) {
          errors.push({
            type: 'validation',
            message: `Field '${field.label}' has no ID`
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(type: 'section' | 'field'): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${type}_${timestamp}_${random}`;
  }

  /**
   * Get current context for debugging
   */
  getContext(): BuilderContext {
    return this.context;
  }
}

/**
 * Section builder for fluent API
 */
export class SectionBuilder {
  constructor(private parent: TemplateBuilder, private section: ProgrammaticSection) {}

  /**
   * Set section ID
   */
  id(id: string): SectionBuilder {
    this.section.id = id;
    return this;
  }

  /**
   * Add field to this section
   */
  field(type: ProgrammaticField['type'], label: string): FieldBuilder {
    return this.parent.field(type, label);
  }

  /**
   * Set section conditional logic
   */
  conditional(dependsOn: string, operator: 'equals' | 'contains' | 'not_equals', values: string[]): SectionBuilder {
    this.section.conditional = { dependsOn, operator, values };
    return this;
  }

  /**
   * Set multiple conditions with OR logic
   * @example
   * .conditionalOr([
   *   { dependsOn: 'field1', operator: 'equals', values: ['yes'] },
   *   { dependsOn: 'field2', operator: 'not_equals', values: ['no'] }
   * ])
   */
  conditionalOr(conditions: SingleCondition[]): SectionBuilder {
    this.section.conditional = {
      logic: 'or',
      conditions
    } as CompoundCondition;
    return this;
  }

  /**
   * Set multiple conditions with AND logic
   * @example
   * .conditionalAnd([
   *   { dependsOn: 'field1', operator: 'equals', values: ['yes'] },
   *   { dependsOn: 'field2', operator: 'equals', values: ['active'] }
   * ])
   */
  conditionalAnd(conditions: SingleCondition[]): SectionBuilder {
    this.section.conditional = {
      logic: 'and',
      conditions
    } as CompoundCondition;
    return this;
  }

  /**
   * Set a compound conditional with full control
   * @example
   * .conditionalCompound({
   *   logic: 'or',
   *   conditions: [
   *     { dependsOn: 'exp_jcc2_cyber_ops', operator: 'not_equals', values: ['NA'] },
   *     { dependsOn: 'exp_jcc2_readiness', operator: 'not_equals', values: ['NA'] }
   *   ]
   * })
   */
  conditionalCompound(condition: CompoundCondition): SectionBuilder {
    this.section.conditional = condition;
    return this;
  }

  /**
   * Enable N/A option for this section
   */
  naable(enabled: boolean = true): SectionBuilder {
    this.section.naable = enabled;
    return this;
  }

  /**
   * Return to parent builder
   */
  end(): TemplateBuilder {
    return this.parent;
  }
}

/**
 * Field builder for fluent API
 */
export class FieldBuilder {
  constructor(private parent: TemplateBuilder, private field: ProgrammaticField) {}

  /**
   * Set field ID
   */
  id(id: string): FieldBuilder {
    this.field.id = id;
    return this;
  }

  /**
   * Make field required
   */
  required(required: boolean = true): FieldBuilder {
    this.field.required = required;
    return this;
  }

  /**
   * Make field optional
   */
  optional(): FieldBuilder {
    this.field.required = false;
    return this;
  }

  /**
   * Set field placeholder
   */
  placeholder(placeholder: string): FieldBuilder {
    this.field.placeholder = placeholder;
    return this;
  }

  /**
   * Set field options
   */
  options(options: string[] | { value: string; label: string }[]): FieldBuilder {
    this.field.options = options;
    return this;
  }

  /**
   * Enable multiple selection
   */
  multiple(multiple: boolean = true): FieldBuilder {
    this.field.multiple = multiple;
    return this;
  }

  /**
   * Set validation rules
   */
  validation(rules: ValidationRules): FieldBuilder {
    this.field.validation = { ...this.field.validation, ...rules };
    return this;
  }

  /**
   * Set minimum value/length
   */
  min(min: number): FieldBuilder {
    if (!this.field.validation) this.field.validation = {};
    this.field.validation.min = min;
    return this;
  }

  /**
   * Set maximum value/length
   */
  max(max: number): FieldBuilder {
    if (!this.field.validation) this.field.validation = {};
    this.field.validation.max = max;
    return this;
  }

  /**
   * Set minimum length
   */
  minLength(minLength: number): FieldBuilder {
    if (!this.field.validation) this.field.validation = {};
    this.field.validation.minLength = minLength;
    return this;
  }

  /**
   * Set maximum length
   */
  maxLength(maxLength: number): FieldBuilder {
    if (!this.field.validation) this.field.validation = {};
    this.field.validation.maxLength = maxLength;
    return this;
  }

  /**
   * Set pattern validation
   */
  pattern(pattern: string): FieldBuilder {
    if (!this.field.validation) this.field.validation = {};
    this.field.validation.pattern = pattern;
    return this;
  }

  /**
   * Set field default value
   */
  defaultValue(value: FormFieldValue): FieldBuilder {
    this.field.defaultValue = value;
    return this;
  }

  /**
   * Set conditional logic
   */
  conditional(dependsOn: string, operator: 'equals' | 'contains' | 'not_equals', values: string[]): FieldBuilder {
    this.field.conditional = { dependsOn, operator, values };
    return this;
  }

  /**
   * Set field layout
   */
  layout(layout: 'vertical' | 'horizontal'): FieldBuilder {
    // console.log(`Setting layout to ${layout} for field ${this.field.id || this.field.label}`);
    this.field.layout = layout;
    return this;
  }

  /**
   * Set field grouping configuration
   */
  grouping(enabled: boolean, groupKey?: string, label?: string): FieldBuilder {
    // console.log(`Setting grouping to ${enabled} with key ${groupKey} for field ${this.field.id || this.field.label}`);
    this.field.grouping = {
      enabled,
      groupKey,
      label
    };
    return this;
  }

  /**
   * Return to parent builder
   */
  end(): TemplateBuilder {
    return this.parent;
  }

  /**
   * Add another field to the same section
   */
  field(type: ProgrammaticField['type'], label: string): FieldBuilder {
    return this.parent.field(type, label);
  }

  /**
   * Add conditional logic after field
   */
  if(condition: string | Condition): ConditionalBuilder {
    return this.parent.if(condition);
  }
}

/**
 * Conditional builder for fluent API
 */
export class ConditionalBuilder {
  constructor(private parent: TemplateBuilder, private conditional: ConditionalBlock) {}

  /**
   * Execute actions if condition is true
   */
  then(callback: (builder: TemplateBuilder) => void): ConditionalBuilder {
    // Create temporary builder for actions
    const tempBuilder = new TemplateBuilder();
    callback(tempBuilder);
    
    // Convert builder actions to template actions
    const actions = this.convertBuilderToActions(tempBuilder);
    this.conditional.then = actions;
    
    return this;
  }

  /**
   * Add else-if condition
   */
  elseIf(condition: string | Condition): ConditionalBuilder {
    const parsedCondition = typeof condition === 'string' 
      ? ConditionEvaluator.parseConditionString(condition)
      : condition;

    if (!this.conditional.elseIf) {
      this.conditional.elseIf = [];
    }

    const elseIfBranch = { condition: parsedCondition, then: [] };
    this.conditional.elseIf.push(elseIfBranch);

    return this;
  }

  /**
   * Add else condition
   */
  else(callback: (builder: TemplateBuilder) => void): ConditionalBuilder {
    const tempBuilder = new TemplateBuilder();
    callback(tempBuilder);
    
    const actions = this.convertBuilderToActions(tempBuilder);
    this.conditional.else = actions;
    
    return this;
  }

  /**
   * End conditional block
   */
  endif(): TemplateBuilder {
    this.parent.getContext().conditionalStack.pop();
    return this.parent;
  }

  /**
   * Convert builder to template actions
   */
  private convertBuilderToActions(builder: TemplateBuilder): unknown[] {
    const context = builder.getContext();
    const actions: unknown[] = [];
    
    // Convert sections and fields to actions
    for (const section of context.template.sections || []) {
      actions.push({
        type: 'createSection',
        data: section
      });
    }

    return actions;
  }
}

/**
 * Conditional logic builder
 */
export class ConditionalLogicBuilder {
  constructor(private parent: TemplateBuilder) {}

  /**
   * Add conditional logic rule
   */
  if(condition: string): ConditionalLogicBuilder {
    // Implementation for conditional logic
    return this;
  }

  /**
   * Return to parent builder
   */
  end(): TemplateBuilder {
    return this.parent;
  }
}