# CSV Parsing Fix for Multi-line Fields

## Problem
The current CSV parsing implementation in `src/utils/csvProcessing.ts` has a critical bug where it splits the entire content by newlines first (`content.trim().split('\n')`), which breaks RFC 4180 compliant CSV files that contain multi-line quoted fields.

## Test Evidence
Running `npx vitest run src/__tests__/unit/utils/csvProcessing.test.ts` shows:

```
FAIL  src/__tests__/unit/utils/csvProcessing.test.ts > parseCSV > should handle multi-line fields within quotes (RFC 4180)
AssertionError: expected [ [ 'John', …(1) ], …(2) ] to deeply equal [ [ 'John', …(2) ] ]

- Expected: [['John', 'This is a long comment\nthat spans multiple\nlines with detailed feedback', 'Active']]
+ Received: Multiple broken rows
```

## Root Cause
Line 21 in `csvProcessing.ts`: `const lines = content.trim().split('\n').filter(line => line.trim());`

This splits by newlines BEFORE the parseRow function can handle quotes, so multi-line quoted fields get broken into separate lines.

## Solution
Replace the line-based parsing with a character-by-character state machine that:
1. Tracks whether we're inside quotes
2. Only treats newlines as row delimiters when NOT inside quotes
3. Preserves newlines inside quoted fields as part of the field content

## Implementation
```typescript
export function parseCSV(content: string): ParsedCSV {
  const trimmedContent = content.trim();
  
  if (!trimmedContent) {
    throw new Error('CSV content is empty');
  }

  // Parse CSV character by character to handle multi-line quoted fields
  const parseCSVContent = (csv: string): string[][] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < csv.length) {
      const char = csv[i];
      const nextChar = csv[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote - add single quote to field
          currentField += '"';
          i += 2;
          continue;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
          continue;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        currentRow.push(currentField);
        currentField = '';
        i++;
        continue;
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        // End of row (handle both \n and \r\n)
        currentRow.push(currentField);
        if (currentRow.some(field => field.trim() !== '')) {
          // Only add non-empty rows
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
        
        // Skip \r\n combination
        if (char === '\r' && nextChar === '\n') {
          i += 2;
        } else {
          i++;
        }
        continue;
      } else {
        // Regular character (including newlines inside quotes)
        currentField += char;
        i++;
      }
    }
    
    // Add last field and row if present
    if (currentField || currentRow.length > 0) {
      currentRow.push(currentField);
      if (currentRow.some(field => field.trim() !== '')) {
        rows.push(currentRow);
      }
    }
    
    return rows;
  };

  const rows = parseCSVContent(trimmedContent);
  
  if (rows.length < 2) {
    throw new Error('CSV must have at least header and schema rows');
  }

  const headers = rows[0].map(h => h.trim());
  const schema = rows[1].map(s => s.trim());
  const data = rows.slice(2);

  return { headers, schema, data };
}
```

## Alternative: Use PapaParse
Since PapaParse is already installed in the project, an alternative solution would be to use it:

```typescript
import Papa from 'papaparse';

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

## Testing
After implementing either solution, the test should pass and CSV files with multi-line quoted fields will be properly handled.