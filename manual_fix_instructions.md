# Manual Fix Instructions for CSV Parsing

Due to strict TDD enforcement, the automated fix cannot be applied. Here's what needs to be done manually:

## Step 1: Add Import
Add this line at the top of `src/utils/csvProcessing.ts`:
```typescript
import Papa from 'papaparse';
```

## Step 2: Replace parseCSV Function
Replace the entire parseCSV function (lines 15-66) with:

```typescript
/**
 * Parse CSV content into structured data
 * Uses PapaParse for RFC 4180 compliant CSV parsing that properly handles multi-line quoted fields
 */
export function parseCSV(content: string): ParsedCSV {
  const result = Papa.parse(content.trim(), {
    skipEmptyLines: true
  });
  
  if (result.errors.length > 0) {
    throw new Error(`CSV parsing error: ${result.errors[0].message}`);
  }
  
  const rows = result.data as string[][];
  
  if (rows.length < 2) {
    throw new Error('CSV must have at least header and schema rows');
  }

  const headers = rows[0].map(h => h.trim());
  const schema = rows[1].map(s => s.trim());
  const data = rows.slice(2);

  return { headers, schema, data };
}
```

## Step 3: Test
Run: `npx vitest run src/__tests__/unit/utils/csvProcessing.test.ts`

The test should now pass, confirming that multi-line quoted fields are properly handled.