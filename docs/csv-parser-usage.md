# CSV Parser Usage with Papa Parse

## Overview
The form manager now uses Papa Parse for robust CSV parsing. This provides better handling of edge cases and follows RFC 4180 CSV standards.

## Basic Usage

### Parsing CSV Data
```typescript
import { parseCSV, parseCSVWithHeaders } from '../utils/csv-parser';

// Parse CSV without headers (returns array of arrays)
const csvString = `name,age,city
"Smith, John",30,"New York"
"Jane ""JD"" Doe",25,Boston`;

const data = parseCSV(csvString);
// Result: [
//   ['name', 'age', 'city'],
//   ['Smith, John', '30', 'New York'],
//   ['Jane "JD" Doe', '25', 'Boston']
// ]

// Parse CSV with headers (returns array of objects)
const dataWithHeaders = parseCSVWithHeaders(csvString);
// Result: [
//   { name: 'Smith, John', age: '30', city: 'New York' },
//   { name: 'Jane "JD" Doe', age: '25', city: 'Boston' }
// ]
```

### Converting Data to CSV
```typescript
import { arrayToCSV, objectsToCSV } from '../utils/csv-parser';

// Convert array of arrays to CSV
const arrayData = [
  ['name', 'description', 'value'],
  ['Item 1', 'Contains, comma', '100'],
  ['Item 2', 'Has "quotes"', '200']
];
const csv = arrayToCSV(arrayData);
// Result:
// name,description,value
// Item 1,"Contains, comma",100
// Item 2,"Has ""quotes""",200

// Convert objects to CSV
const objectData = [
  { name: 'Item 1', description: 'Contains, comma', value: '100' },
  { name: 'Item 2', description: 'Has "quotes"', value: '200' }
];
const csvFromObjects = objectsToCSV(objectData);
```

## Features Handled by Papa Parse

1. **Quoted Fields**: Fields containing commas, quotes, or newlines are automatically quoted
2. **Escaped Quotes**: Double quotes within fields are properly escaped as `""`
3. **Multi-line Fields**: Fields can contain newlines when properly quoted
4. **Different Line Endings**: Handles Windows (CRLF), Unix (LF), and Mac (CR) line endings
5. **Empty Fields**: Properly handles empty fields and preserves their position
6. **Whitespace**: Preserves whitespace in quoted fields, trims unquoted fields

## Integration with Form Manager

The CSV integrity checker and form data export features now use Papa Parse internally:

```typescript
import { checkCSVIntegrity } from '../utils/csvIntegrityChecker';

// The integrity checker now uses Papa Parse for parsing
const result = await checkCSVIntegrity(template, originalData, csvContent);
```

## Error Handling

Papa Parse provides detailed error information:

```typescript
const result = parseCSV(malformedCSV);
// Errors are logged to console but parsing continues
// Check console for warnings about any parsing issues
```

## Migration from Custom Parser

The API remains the same for `parseCSV()` and `arrayToCSV()`, so existing code should work without changes. The main improvements are:

- More robust handling of edge cases
- Better performance on large files
- Consistent behavior across browsers
- Standards-compliant CSV formatting