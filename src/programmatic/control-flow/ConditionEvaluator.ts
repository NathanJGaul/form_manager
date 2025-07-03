import { Condition, TemplateContext, TemplateError } from '../types';
import { TemplateContextManager } from './TemplateContext';

export class ConditionEvaluator {
  private contextManager: TemplateContextManager;

  constructor(contextManager: TemplateContextManager) {
    this.contextManager = contextManager;
  }

  /**
   * Evaluate a condition and return boolean result
   */
  evaluate(condition: Condition): boolean {
    try {
      switch (condition.type) {
        case 'expression':
          return this.evaluateExpression(condition.expression!);
        case 'function':
          return this.evaluateFunction(condition.function!);
        case 'variable':
          return this.evaluateVariable(condition.variable!);
        case 'comparison':
          return this.evaluateComparison(condition);
        default:
          throw new Error(`Unknown condition type: ${(condition as any).type}`);
      }
    } catch (error) {
      console.warn('Error evaluating condition:', error);
      return false;
    }
  }

  /**
   * Evaluate an expression string
   */
  private evaluateExpression(expression: string): boolean {
    const result = this.contextManager.evaluateExpression(expression);
    return this.toBooleanValue(result);
  }

  /**
   * Evaluate a function condition
   */
  private evaluateFunction(func: (context: TemplateContext) => boolean): boolean {
    try {
      return func(this.contextManager.getContext());
    } catch (error) {
      console.warn('Error evaluating function condition:', error);
      return false;
    }
  }

  /**
   * Evaluate a variable condition
   */
  private evaluateVariable(variableName: string): boolean {
    const value = this.contextManager.getVariable(variableName);
    return this.toBooleanValue(value);
  }

  /**
   * Evaluate a comparison condition
   */
  private evaluateComparison(condition: Condition): boolean {
    const { variable, operator, value } = condition;
    
    if (!variable || !operator) {
      return false;
    }

    const leftValue = this.contextManager.getVariable(variable);
    const rightValue = value;

    switch (operator) {
      case 'eq':
        return leftValue === rightValue;
      case 'neq':
        return leftValue !== rightValue;
      case 'gt':
        return this.toNumberValue(leftValue) > this.toNumberValue(rightValue);
      case 'gte':
        return this.toNumberValue(leftValue) >= this.toNumberValue(rightValue);
      case 'lt':
        return this.toNumberValue(leftValue) < this.toNumberValue(rightValue);
      case 'lte':
        return this.toNumberValue(leftValue) <= this.toNumberValue(rightValue);
      case 'in':
        return Array.isArray(rightValue) && rightValue.includes(leftValue);
      case 'contains':
        if (typeof leftValue === 'string' && typeof rightValue === 'string') {
          return leftValue.includes(rightValue);
        }
        if (Array.isArray(leftValue)) {
          return leftValue.includes(rightValue);
        }
        return false;
      default:
        return false;
    }
  }

  /**
   * Convert value to boolean
   */
  private toBooleanValue(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value.length > 0;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object') {
      return value !== null && Object.keys(value).length > 0;
    }
    return !!value;
  }

  /**
   * Convert value to number
   */
  private toNumberValue(value: any): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (Array.isArray(value)) {
      return value.length;
    }
    return 0;
  }

  /**
   * Parse condition string into Condition object
   */
  static parseConditionString(conditionStr: string): Condition {
    // Handle simple variable references
    if (conditionStr.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      return {
        type: 'variable',
        variable: conditionStr,
      };
    }

    // Handle comparison operators
    const comparisonMatch = conditionStr.match(/^(.+?)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
    if (comparisonMatch) {
      const [, left, op, right] = comparisonMatch;
      const operator = this.mapOperator(op);
      return {
        type: 'comparison',
        variable: left.trim(),
        operator,
        value: this.parseValue(right.trim()),
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
        value: this.parseArrayValue(right.trim()),
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
        value: this.parseValue(right.trim()),
      };
    }

    // Default to expression
    return {
      type: 'expression',
      expression: conditionStr,
    };
  }

  /**
   * Map string operators to condition operators
   */
  private static mapOperator(op: string): Condition['operator'] {
    switch (op) {
      case '==': return 'eq';
      case '!=': return 'neq';
      case '>': return 'gt';
      case '>=': return 'gte';
      case '<': return 'lt';
      case '<=': return 'lte';
      default: return 'eq';
    }
  }

  /**
   * Parse a value string into appropriate type
   */
  private static parseValue(valueStr: string): any {
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
  private static parseArrayValue(valueStr: string): any[] {
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
   * Validate condition structure
   */
  validateCondition(condition: Condition): TemplateError[] {
    const errors: TemplateError[] = [];

    switch (condition.type) {
      case 'expression':
        if (!condition.expression) {
          errors.push({
            type: 'validation',
            message: 'Expression condition must have expression property',
          });
        }
        break;
      case 'function':
        if (!condition.function) {
          errors.push({
            type: 'validation',
            message: 'Function condition must have function property',
          });
        }
        break;
      case 'variable':
        if (!condition.variable) {
          errors.push({
            type: 'validation',
            message: 'Variable condition must have variable property',
          });
        }
        break;
      case 'comparison':
        if (!condition.variable) {
          errors.push({
            type: 'validation',
            message: 'Comparison condition must have variable property',
          });
        }
        if (!condition.operator) {
          errors.push({
            type: 'validation',
            message: 'Comparison condition must have operator property',
          });
        }
        if (condition.value === undefined) {
          errors.push({
            type: 'validation',
            message: 'Comparison condition must have value property',
          });
        }
        break;
      default:
        errors.push({
          type: 'validation',
          message: `Unknown condition type: ${(condition as any).type}`,
        });
    }

    return errors;
  }
}