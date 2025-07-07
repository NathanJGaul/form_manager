// Core types for the Programmatic Template System
export interface TemplateMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  extends?: string; // Template inheritance
  created: Date;
  updated: Date;
}

export interface TemplateSchema {
  validation: 'strict' | 'loose' | 'none';
  requiredFields: string[];
  constraints?: Record<string, any>;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  custom?: (value: any) => boolean | string;
}

export interface StylingConfig {
  theme: string;
  layout: 'fixed' | 'fluid' | 'adaptive';
  spacing: 'compact' | 'normal' | 'comfortable';
  colors?: string[];
  animations?: boolean;
  conditionalStyling?: ConditionalStyling[];
}

export interface ConditionalStyling {
  if: string;
  then: Record<string, any>;
  else?: Record<string, any>;
}

export interface BehaviorConfig {
  autoSave: boolean;
  autoSaveInterval?: number;
  showProgress: boolean;
  conditionalLogic?: ConditionalLogic[];
  functions?: Record<string, string>;
}

export interface ConditionalLogic {
  if: string;
  then: string | string[];
  elseIf?: { condition: string; then: string | string[] }[];
  else?: string | string[];
}

// Control Flow Types
export interface Condition {
  type: 'expression' | 'function' | 'variable' | 'comparison';
  expression?: string;
  function?: (context: TemplateContext) => boolean;
  variable?: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value?: any;
}

export interface ConditionalBlock {
  if: Condition;
  then: TemplateAction[];
  elseIf?: { condition: Condition; then: TemplateAction[] }[];
  else?: TemplateAction[];
}

export interface LoopBlock {
  type: 'forEach' | 'repeat' | 'while';
  array?: any[];
  count?: number;
  condition?: Condition;
  body: TemplateAction[];
  variable?: string; // Loop variable name
}

export interface TemplateAction {
  type: 'createField' | 'createSection' | 'setVariable' | 'callFunction' | 'conditional' | 'loop';
  data?: any;
  conditional?: ConditionalBlock;
  loop?: LoopBlock;
}

export interface TemplateContext {
  variables: Record<string, any>;
  scope: Record<string, any>;
  parent?: TemplateContext;
  functions: Record<string, Function>;
  breakLoop?: boolean;
  continueLoop?: boolean;
}

// Control Flow Configuration
export interface ControlFlowConfig {
  if?: Condition;
  then?: TemplateAction[] | ProgrammaticField[];
  elseIf?: { condition: Condition; then: TemplateAction[] | ProgrammaticField[] }[];
  else?: TemplateAction[] | ProgrammaticField[];
  forEach?: {
    array: string | any[];
    variable: string;
    do: TemplateAction[] | ProgrammaticField[];
  };
  repeat?: {
    count: number | string;
    variable?: string;
    do: TemplateAction[] | ProgrammaticField[];
  };
  while?: {
    condition: Condition;
    do: TemplateAction[] | ProgrammaticField[];
  };
}

// Extended field and section types with control flow
export interface ProgrammaticField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'file' | 'email' | 'tel' | 'range';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[] | { value: string; label: string }[];
  multiple?: boolean;
  validation?: ValidationRules;
  conditional?: {
    dependsOn: string;
    values: string[];
    operator: 'equals' | 'contains' | 'not_equals';
  };
  controlFlow?: ControlFlowConfig;
  // Additional programmatic properties
  variables?: Record<string, any>;
  dynamic?: boolean;
  defaultValue?: any;
}

export interface ProgrammaticSection {
  id: string;
  title: string;
  fields: ProgrammaticField[];
  conditional?: {
    dependsOn: string;
    values: string[];
    operator: 'equals' | 'contains' | 'not_equals';
  };
  controlFlow?: ControlFlowConfig;
  // Additional programmatic properties
  variables?: Record<string, any>;
  dynamic?: boolean;
}

export interface ProgrammaticTemplate {
  metadata: TemplateMetadata;
  schema: TemplateSchema;
  sections: ProgrammaticSection[];
  validation: ValidationRules;
  styling: StylingConfig;
  behavior: BehaviorConfig;
  variables?: Record<string, any>;
  controlFlow?: ControlFlowConfig;
}

// Template Registry Types
export interface TemplateVersion {
  version: string;
  template: ProgrammaticTemplate;
  changelog: string;
  author: string;
  created: Date;
}

export interface SearchCriteria {
  name?: string;
  tags?: string[];
  author?: string;
  version?: string;
  dateRange?: { from: Date; to: Date };
}

export interface CommonTemplates {
  contact: ProgrammaticTemplate;
  survey: ProgrammaticTemplate;
  registration: ProgrammaticTemplate;
  feedback: ProgrammaticTemplate;
}

export interface IndustryTemplates {
  healthcare: ProgrammaticTemplate[];
  education: ProgrammaticTemplate[];
  business: ProgrammaticTemplate[];
  government: ProgrammaticTemplate[];
}

export interface PatternTemplates {
  multiStep: ProgrammaticTemplate;
  conditional: ProgrammaticTemplate;
  repeating: ProgrammaticTemplate;
  dynamic: ProgrammaticTemplate;
}

// Builder API Types
export interface BuilderContext {
  template: Partial<ProgrammaticTemplate>;
  currentSection?: ProgrammaticSection;
  currentField?: ProgrammaticField;
  variables: Record<string, any>;
  conditionalStack: ConditionalBlock[];
  loopStack: LoopBlock[];
}

export interface FluentBuilderOptions {
  strict?: boolean;
  validateOnBuild?: boolean;
  autoId?: boolean;
  defaultRequired?: boolean;
}

// Error Types
export interface TemplateError {
  type: 'validation' | 'parsing' | 'runtime' | 'controlFlow';
  message: string;
  path?: string;
  line?: number;
  column?: number;
  context?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: TemplateError[];
  warnings: TemplateError[];
}

// Conversion Types
export interface ConversionOptions {
  preserveIds?: boolean;
  generateMetadata?: boolean;
  strict?: boolean;
  includeControlFlow?: boolean;
}

export interface ConversionResult {
  success: boolean;
  result?: ProgrammaticTemplate;
  errors: TemplateError[];
  warnings: TemplateError[];
}

// Migration Types
export interface MigrationStep {
  from: string;
  to: string;
  migrate: (template: any) => any;
  validate: (template: any) => ValidationResult;
}

export interface MigrationPlan {
  steps: MigrationStep[];
  rollback: MigrationStep[];
}