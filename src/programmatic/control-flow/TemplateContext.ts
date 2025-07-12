import { TemplateContext, TemplateError } from '../types';

export class TemplateContextManager {
  private context: TemplateContext;
  private contextStack: TemplateContext[] = [];

  constructor(initialVariables: Record<string, unknown> = {}) {
    this.context = {
      variables: { ...initialVariables },
      scope: {},
      functions: {},
      breakLoop: false,
      continueLoop: false,
    };
  }

  /**
   * Create a new scope for nested execution (loops, conditionals)
   */
  createScope(variables: Record<string, unknown> = {}): TemplateContext {
    const newContext: TemplateContext = {
      variables: { ...this.context.variables, ...variables },
      scope: { ...variables },
      parent: this.context,
      functions: { ...this.context.functions },
      breakLoop: false,
      continueLoop: false,
    };

    this.contextStack.push(this.context);
    this.context = newContext;
    return newContext;
  }

  /**
   * Exit current scope and return to parent
   */
  exitScope(): TemplateContext | null {
    if (this.contextStack.length === 0) {
      return null;
    }

    const parentContext = this.contextStack.pop();
    if (parentContext) {
      // Preserve loop control flags
      const { breakLoop, continueLoop } = this.context;
      this.context = parentContext;
      this.context.breakLoop = breakLoop;
      this.context.continueLoop = continueLoop;
      return this.context;
    }

    return null;
  }

  /**
   * Get current context
   */
  getContext(): TemplateContext {
    return this.context;
  }

  /**
   * Set a variable in the current scope
   */
  setVariable(name: string, value: unknown): void {
    this.context.variables[name] = value;
    this.context.scope[name] = value;
  }

  /**
   * Get a variable value with scope resolution
   */
  getVariable(name: string): unknown {
    // First check current scope
    if (name in this.context.scope) {
      return this.context.scope[name];
    }

    // Then check variables
    if (name in this.context.variables) {
      return this.context.variables[name];
    }

    // Finally check parent contexts
    let parentContext = this.context.parent;
    while (parentContext) {
      if (name in parentContext.scope) {
        return parentContext.scope[name];
      }
      if (name in parentContext.variables) {
        return parentContext.variables[name];
      }
      parentContext = parentContext.parent;
    }

    return undefined;
  }

  /**
   * Check if a variable exists in current scope chain
   */
  hasVariable(name: string): boolean {
    return this.getVariable(name) !== undefined;
  }

  /**
   * Register a function for use in templates
   */
  registerFunction(name: string, func: Function): void {
    this.context.functions[name] = func;
  }

  /**
   * Call a registered function
   */
  callFunction(name: string, ...args: unknown[]): unknown {
    if (name in this.context.functions) {
      return this.context.functions[name].apply(this.context, args);
    }

    // Check parent contexts
    let parentContext = this.context.parent;
    while (parentContext) {
      if (name in parentContext.functions) {
        return parentContext.functions[name].apply(this.context, args);
      }
      parentContext = parentContext.parent;
    }

    throw new Error(`Function '${name}' not found`);
  }

  /**
   * Set loop control flags
   */
  setBreakLoop(): void {
    this.context.breakLoop = true;
  }

  setContinueLoop(): void {
    this.context.continueLoop = true;
  }

  clearLoopControls(): void {
    this.context.breakLoop = false;
    this.context.continueLoop = false;
  }

  /**
   * Check loop control flags
   */
  shouldBreakLoop(): boolean {
    return this.context.breakLoop === true;
  }

  shouldContinueLoop(): boolean {
    return this.context.continueLoop === true;
  }

  /**
   * Resolve template variables in a string (e.g., "${variable}")
   */
  resolveVariables(template: string): string {
    return template.replace(/\$\{([^}]+)\}/g, (match, varName) => {
      const value = this.evaluateExpression(varName);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Evaluate a simple expression with variable resolution
   */
  evaluateExpression(expression: string): unknown {
    try {
      // Handle simple variable references
      if (expression.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        return this.getVariable(expression);
      }

      // Handle property access (e.g., variables.categories)
      if (expression.startsWith('variables.')) {
        const varName = expression.substring(10);
        return this.getVariable(varName);
      }

      // Handle array access (e.g., categories[0])
      if (expression.includes('[') && expression.includes(']')) {
        const [arrayName, indexExpr] = expression.split('[');
        const index = parseInt(indexExpr.replace(']', ''));
        const array = this.getVariable(arrayName);
        if (Array.isArray(array)) {
          return array[index];
        }
      }

      // Handle simple property access (e.g., user.name)
      if (expression.includes('.')) {
        const parts = expression.split('.');
        let value = this.getVariable(parts[0]);
        for (let i = 1; i < parts.length; i++) {
          if (value && typeof value === 'object') {
            value = value[parts[i]];
          } else {
            return undefined;
          }
        }
        return value;
      }

      // For more complex expressions, use Function constructor (be careful with security)
      const func = new Function(...Object.keys(this.context.variables), `return ${expression}`);
      return func(...Object.values(this.context.variables));
    } catch (error) {
      console.warn(`Failed to evaluate expression: ${expression}`, error);
      return undefined;
    }
  }

  /**
   * Validate the current context
   */
  validate(): TemplateError[] {
    const errors: TemplateError[] = [];

    // Check for circular references
    const visited = new Set<TemplateContext>();
    let current: TemplateContext | undefined = this.context;
    while (current) {
      if (visited.has(current)) {
        errors.push({
          type: 'runtime',
          message: 'Circular reference detected in template context',
          context: current,
        });
        break;
      }
      visited.add(current);
      current = current.parent;
    }

    return errors;
  }

  /**
   * Get debug information about current context
   */
  getDebugInfo(): Record<string, unknown> {
    return {
      variables: this.context.variables,
      scope: this.context.scope,
      functions: Object.keys(this.context.functions),
      hasParent: !!this.context.parent,
      stackDepth: this.contextStack.length,
      breakLoop: this.context.breakLoop,
      continueLoop: this.context.continueLoop,
    };
  }

  /**
   * Reset context to initial state
   */
  reset(initialVariables: Record<string, unknown> = {}): void {
    this.contextStack = [];
    this.context = {
      variables: { ...initialVariables },
      scope: {},
      functions: {},
      breakLoop: false,
      continueLoop: false,
    };
  }
}