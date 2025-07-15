# Compound Conditionals Implementation Guide

## Overview

This guide explains how to implement compound conditionals (OR/AND logic) in the form_manager template system, specifically addressing the need for sections like MOP 2.1.9 to display when users have experience with EITHER "JCC2 Cyber Ops" OR "JCC2 Readiness".

## Current Limitation

The current system only supports single conditionals per field/section:
```typescript
.conditional("field_id", "operator", ["value"])
```

Multiple calls overwrite previous conditions rather than combining them.

## Proposed Solution

### 1. Extended Type System

Add new types while maintaining backward compatibility:

```typescript
// Single condition (existing)
interface SingleCondition {
  dependsOn: string;
  values: string[];
  operator: 'equals' | 'contains' | 'not_equals';
}

// Compound condition (new)
interface CompoundCondition {
  logic: 'and' | 'or';
  conditions: (SingleCondition | CompoundCondition)[];
}

// Union type for compatibility
type ConditionalLogic = SingleCondition | CompoundCondition;
```

### 2. Builder API Extensions

Add new methods to the builder:

```typescript
// OR condition
.conditionalOr([
  { dependsOn: "exp_app_jcc2_cyber_ops", operator: "not_equals", values: ["NA"] },
  { dependsOn: "exp_app_jcc2_readiness", operator: "not_equals", values: ["NA"] }
])

// AND condition
.conditionalAnd([
  { dependsOn: "field1", operator: "equals", values: ["yes"] },
  { dependsOn: "field2", operator: "equals", values: ["active"] }
])

// Complex nested conditions
.conditionalCompound({
  logic: 'and',
  conditions: [
    { logic: 'or', conditions: [...] },
    { dependsOn: "field3", operator: "equals", values: ["true"] }
  ]
})
```

### 3. Implementation Steps

1. **Update Type Definitions**
   - Add `src/types/conditional.ts` with new types
   - Update `FormField` and `FormSection` interfaces to use `ConditionalLogic`

2. **Extend Evaluation Logic**
   - Create `formLogicEnhanced.ts` with compound evaluation
   - Update existing `evaluateCondition` to handle both types
   - Add type guards for safe type checking

3. **Update Template Builder**
   - Add new methods to `FieldBuilder` and `SectionBuilder`
   - Maintain backward compatibility with existing `.conditional()`

4. **Update Form Renderer**
   - Import enhanced evaluation logic
   - No changes needed if evaluation function signature stays the same

5. **Test Thoroughly**
   - Unit tests for compound evaluation
   - Integration tests with form renderer
   - Regression tests for existing templates

## Quick Workaround (No Core Changes)

If you need immediate functionality without modifying the core:

```typescript
// Create a computed field that combines the logic
builder
  .field("hidden", "Has Either Experience")
  .id("has_either_experience_computed")
  .defaultValue("false")
  .end();

// In your form logic or a custom hook:
const updateComputedFields = (formData) => {
  const cyberOps = formData.exp_app_jcc2_cyber_ops;
  const readiness = formData.exp_app_jcc2_readiness;
  
  formData.has_either_experience_computed = 
    (cyberOps && cyberOps !== 'NA') || (readiness && readiness !== 'NA') 
      ? 'true' : 'false';
};

// Use the computed field for conditional
builder
  .section("MOP 2.1.9")
  .conditional("has_either_experience_computed", "equals", ["true"])
  .naable();
```

## Benefits

1. **Backward Compatible**: Existing templates continue to work
2. **Type Safe**: Full TypeScript support
3. **Flexible**: Supports nested conditions of any complexity
4. **Intuitive API**: Natural extension of existing patterns
5. **Performant**: Minimal overhead with short-circuit evaluation

## Example: Fix MOP 2.1.9

```typescript
// Before (doesn't work - second conditional overwrites first)
builder
  .section("MOP 2.1.9: Joint forces to perform collaborative planning")
  .id("mop_2_1_9")
  .conditional("exp_app_jcc2_cyber_ops", "not_equals", ["NA"])
  .conditional("exp_app_jcc2_readiness", "not_equals", ["NA"]) // Overwrites!
  .naable();

// After (with compound conditionals)
builder
  .section("MOP 2.1.9: Joint forces to perform collaborative planning")
  .id("mop_2_1_9")
  .conditionalOr([
    { dependsOn: "exp_app_jcc2_cyber_ops", operator: "not_equals", values: ["NA"] },
    { dependsOn: "exp_app_jcc2_readiness", operator: "not_equals", values: ["NA"] }
  ])
  .naable();
```

## Next Steps

1. Review and approve the design
2. Implement core type changes
3. Update evaluation logic
4. Extend builder API
5. Update documentation
6. Migrate existing templates as needed