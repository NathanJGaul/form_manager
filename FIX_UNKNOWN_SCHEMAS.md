# Fix for Unknown Schemas in JCC2 CSV Export

## Issue Summary

When exporting JCC2 v4 form data to CSV, many field schemas show as "unknown" instead of their proper type definitions. This affects fields like:
- `task_performance` 
- `task_performance_details`
- `task_workaround`
- `task_workaround_details`
- `problem_occurrence`
- `problem_occurrence_details`
- `task_outcome`
- `task_outcome_details`
- `additional_observations`

## Root Cause

The issue is a mismatch between how fields are created and how they're looked up during CSV export:

1. **Field Creation**: In `addTaskQuestions()` function (line 833), fields are created with simple IDs:
   ```typescript
   .id(`${question.id}`)  // Creates ID: "task_performance"
   ```

2. **CSV Export Lookup**: The CSV export expects fields with section-prefixed IDs:
   ```typescript
   header === `${section.id}.${f.id}`  // Looks for: "mop111.task_performance"
   ```

3. **Result**: Fields can't be found, so schema defaults to "unknown"

## Solutions

### Option 1: Fix the Template (RECOMMENDED)

Update the `addTaskQuestions` function to create fields with section-aware IDs:

```typescript
// In addTaskQuestions function, change:
.id(`${question.id}`)
// To:
.id(`${question.id}`)  // Keep the same - the issue is elsewhere
```

Actually, the real issue is that the CSV export is generating headers with the section prefix, but the fields are stored without it. The template is working correctly.

### Option 2: Fix the CSV Export Logic

Update the CSV export in `src/utils/storage.ts` to handle fields that are part of sections but don't have the section prefix in their ID. The generateSchemaRow function needs to:

1. First try the current lookup (section.field)
2. If not found, try looking for just the field ID within the section
3. Build the schema string correctly

### Option 3: Quick Script to Fix Existing CSVs

Create a script that:
1. Reads the CSV file
2. Identifies all "unknown" schemas
3. Maps them to their correct types based on the field name patterns
4. Writes a corrected CSV

## Field Type Mappings

Based on the JCC2 v4 template, here are the correct schemas:

- `task_performance`: `radio|required|options:Yes,N/A,No`
- `task_performance_details`: `textarea|optional`
- `task_workaround`: `radio|required|options:Yes,N/A,No`
- `task_workaround_details`: `textarea|optional`
- `problem_occurrence`: `radio|required|options:Yes,N/A,No`
- `problem_occurrence_details`: `textarea|optional`
- `task_outcome`: `radio|required|options:Yes,N/A,No`
- `task_outcome_details`: `textarea|optional`
- `additional_observations`: `textarea|optional`

## Immediate Workaround

For now, you can manually fix the CSV by replacing all instances of "unknown" in the schema row with the appropriate type definitions listed above.