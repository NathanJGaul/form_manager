/**
 * Builder extension for compound conditionals
 * This can be mixed into the existing FieldBuilder and SectionBuilder
 */

import { SingleCondition, CompoundCondition } from '../../types/conditional';

export class CompoundConditionalBuilder {
  /**
   * Sets an OR condition with multiple sub-conditions
   */
  static createOrConditional(conditions: SingleCondition[]): CompoundCondition {
    return {
      logic: 'or',
      conditions
    };
  }

  /**
   * Sets an AND condition with multiple sub-conditions
   */
  static createAndConditional(conditions: SingleCondition[]): CompoundCondition {
    return {
      logic: 'and',
      conditions
    };
  }

  /**
   * Creates a condition builder helper
   */
  static condition(
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
}

/**
 * Extension methods for SectionBuilder to support compound conditionals
 * These would be added to the existing SectionBuilder class
 */
export interface SectionBuilderExtensions {
  /**
   * Sets multiple conditions with OR logic
   * @example
   * .conditionalOr([
   *   { dependsOn: 'field1', operator: 'equals', values: ['yes'] },
   *   { dependsOn: 'field2', operator: 'not_equals', values: ['no'] }
   * ])
   */
  conditionalOr(conditions: SingleCondition[]): this;

  /**
   * Sets multiple conditions with AND logic
   * @example
   * .conditionalAnd([
   *   { dependsOn: 'field1', operator: 'equals', values: ['yes'] },
   *   { dependsOn: 'field2', operator: 'equals', values: ['active'] }
   * ])
   */
  conditionalAnd(conditions: SingleCondition[]): this;

  /**
   * Sets a compound conditional with full control
   * @example
   * .conditionalCompound({
   *   logic: 'or',
   *   conditions: [
   *     { dependsOn: 'exp_jcc2_cyber_ops', operator: 'not_equals', values: ['NA'] },
   *     { dependsOn: 'exp_jcc2_readiness', operator: 'not_equals', values: ['NA'] }
   *   ]
   * })
   */
  conditionalCompound(condition: CompoundCondition): this;
}

/**
 * Example implementation for a section builder
 */
export class EnhancedSectionBuilder {
  private section: any = {};

  conditionalOr(conditions: SingleCondition[]): this {
    this.section.conditional = CompoundConditionalBuilder.createOrConditional(conditions);
    return this;
  }

  conditionalAnd(conditions: SingleCondition[]): this {
    this.section.conditional = CompoundConditionalBuilder.createAndConditional(conditions);
    return this;
  }

  conditionalCompound(condition: CompoundCondition): this {
    this.section.conditional = condition;
    return this;
  }

  // For backward compatibility - this still works for simple conditions
  conditional(
    dependsOn: string, 
    operator: 'equals' | 'contains' | 'not_equals', 
    values: string[]
  ): this {
    this.section.conditional = {
      dependsOn,
      operator,
      values
    };
    return this;
  }
}