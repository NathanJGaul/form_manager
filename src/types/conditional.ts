// Extended conditional types supporting compound logic

export interface SingleCondition {
  dependsOn: string;
  values: string[];
  operator: 'equals' | 'contains' | 'not_equals';
}

export interface CompoundCondition {
  logic: 'and' | 'or';
  conditions: (SingleCondition | CompoundCondition)[];
}

// Union type that maintains backward compatibility
export type ConditionalLogic = SingleCondition | CompoundCondition;

// Type guard to check if a condition is compound
export function isCompoundCondition(
  condition: ConditionalLogic
): condition is CompoundCondition {
  return 'logic' in condition && 'conditions' in condition;
}

// Type guard to check if a condition is single
export function isSingleCondition(
  condition: ConditionalLogic
): condition is SingleCondition {
  return 'dependsOn' in condition;
}