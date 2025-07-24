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

## Section-Based Field References

### Overview

The conditional system now supports referencing fields using section.field notation. This provides clearer semantics when dealing with complex forms with multiple sections.

### Syntax

```typescript
// Traditional format (still supported)
.conditional("field_id", "equals", ["value"])

// New section.field format
.conditional("section_id.field_id", "equals", ["value"])
```

### Implementation Details

1. **Backward Compatible**: All existing templates continue to work with simple field IDs
2. **Automatic Resolution**: If a field isn't found with the full section.field ID, the system automatically tries the field ID alone
3. **FormData Structure**: FormData remains flat (field IDs as keys), the section prefix is only used for clearer conditional dependencies

### Example Usage

```typescript
// Helper function using section.field references
function addStandardTaskQuestions(builder: TemplateBuilder, sectionId: string) {
  standardTaskQuestions.forEach((question) => {
    builder
      .field("radio", question.label)
      .id(`${question.id}`)
      .options(question.options)
      .layout("horizontal")
      .required()
      .end();

    // Add conditional follow-up for "No" answers
    if (question.options.includes("No")) {
      builder
        .field("textarea", question.followUpPrompt)
        .id(`${question.id}_details`)
        .required()
        .conditional(`${sectionId}.${question.id}`, "equals", [question.followUpOption])
        .end();
    }
  });
}

// Usage in template
builder
  .section("Experience")
  .id("experience")
  .fields((section) => {
    addStandardTaskQuestions(section, "experience");
  })
  .end();
```

### Benefits

1. **Clearer Intent**: Makes it obvious which section a field belongs to
2. **Reduced Naming Conflicts**: Fields can have simpler IDs when section context is clear
3. **Better Organization**: Encourages thinking in terms of section/field hierarchy
4. **Template Reusability**: Helper functions can generate fields with proper section context

### Combining with Compound Conditionals

Section.field notation works seamlessly with compound conditionals:

```typescript
.conditionalOr([
  { dependsOn: "experience.has_clearance", operator: "equals", values: ["No"] },
  { dependsOn: "eligibility.requires_sponsorship", operator: "equals", values: ["Yes"] }
])
```

## Next Steps

1. Review and approve the design
2. Implement core type changes
3. Update evaluation logic
4. Extend builder API
5. Update documentation
6. Migrate existing templates as needed