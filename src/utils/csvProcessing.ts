export interface CSVValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  columnCount: number;
  rowCount: number;
}

export interface ParsedCSV {
  headers: string[];
  schema: string[];
  data: string[][];
}

/**
 * Parse CSV content into structured data
 */
export function parseCSV(content: string): ParsedCSV {
  const lines = content.trim().split('\n').filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV must have at least header and schema rows');
  }

  // Parse using a simple state machine to handle quoted fields
  const parseRow = (row: string): string[] => {
    const fields: string[] = [];
    let currentField = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      const nextChar = row[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          currentField += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        fields.push(currentField);
        currentField = '';
      } else {
        currentField += char;
      }
    }
    
    // Add last field
    fields.push(currentField);
    
    return fields;
  };

  const headers = parseRow(lines[0]);
  const schema = parseRow(lines[1]);
  const data = lines.slice(2).map(line => parseRow(line));

  return { headers, schema, data };
}

/**
 * Validate CSV structure and data against schema
 */
export function validateCSV(content: string): CSVValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const { headers, schema, data } = parseCSV(content);
    
    // Check header/schema alignment
    if (headers.length !== schema.length) {
      errors.push(`Header columns (${headers.length}) don't match schema columns (${schema.length})`);
    }

    // Validate each data row
    data.forEach((row, rowIndex) => {
      if (row.length !== headers.length) {
        errors.push(`Row ${rowIndex + 3} has ${row.length} fields, expected ${headers.length}`);
        return;
      }

      // Validate each field against schema
      row.forEach((value, colIndex) => {
        if (colIndex >= schema.length) return;
        
        const fieldName = headers[colIndex];
        const fieldSchema = schema[colIndex];
        const lineNum = rowIndex + 3;
        
        // Parse schema rules
        const schemaParts = fieldSchema.split('|');
        const fieldType = schemaParts[0];
        const rules = schemaParts.slice(1);
        
        // Type validation
        if (fieldType === 'system|identifier' && value) {
          if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(value)) {
            warnings.push(`Line ${lineNum}, field '${fieldName}': Invalid UUID format`);
          }
        } else if (fieldType === 'system|datetime' && value) {
          if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)) {
            warnings.push(`Line ${lineNum}, field '${fieldName}': Invalid datetime format`);
          }
        } else if (fieldType === 'system|number' && value) {
          if (!/^-?\d+(\.\d+)?$/.test(value)) {
            warnings.push(`Line ${lineNum}, field '${fieldName}': Invalid number format`);
          }
        } else if (fieldType === 'email' && value) {
          if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            warnings.push(`Line ${lineNum}, field '${fieldName}': Invalid email format`);
          }
        } else if (fieldType === 'date' && value) {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            warnings.push(`Line ${lineNum}, field '${fieldName}': Invalid date format`);
          }
        } else if (fieldType === 'tel' && value) {
          // Very lenient phone validation - just check for basic phone characters
          // Allow digits, spaces, dashes, parentheses, plus, dots, and extensions
          if (!/^[\+0-9\-\(\)\ \.\,ext\#]+$/i.test(value)) {
            warnings.push(`Line ${lineNum}, field '${fieldName}': Invalid phone format`);
          }
        }
        
        // Check required fields
        // Note: 'null' as a string value indicates the field was hidden by conditional logic
        if (rules.includes('required') && !value && value !== 'null') {
          errors.push(`Line ${lineNum}, field '${fieldName}': Required field is empty`);
        }
        
        // Check enum values
        const optionsRule = rules.find(r => r.startsWith('options:'));
        if (optionsRule && value && value !== 'null') {
          // Skip validation for 'null' values as they indicate hidden fields
          const options = optionsRule.replace('options:', '').split(',');
          const isMultiple = rules.includes('multiple');
          
          if (isMultiple) {
            // For multiple values, split by semicolon and check each value
            const values = value.split(';').map(v => v.trim());
            for (const val of values) {
              if (val && val !== 'null' && !options.includes(val)) {
                warnings.push(`Line ${lineNum}, field '${fieldName}': Value '${val}' not in allowed options`);
              }
            }
          } else {
            // Single value check
            if (!options.includes(value)) {
              warnings.push(`Line ${lineNum}, field '${fieldName}': Value '${value}' not in allowed options`);
            }
          }
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      columnCount: headers.length,
      rowCount: data.length
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Unknown parsing error'],
      warnings: [],
      columnCount: 0,
      rowCount: 0
    };
  }
}

/**
 * Combine multiple CSV files with the same structure
 */
export function combineCSVs(csvContents: string[], fileNames?: string[]): string {
  if (csvContents.length === 0) {
    throw new Error('No CSV files to combine');
  }

  let referenceHeaders: string[] | null = null;
  let referenceSchema: string[] | null = null;
  const allData: string[][] = [];
  const fileInfos: Array<{ headers: string[]; schema: string[]; index: number }> = [];

  for (let i = 0; i < csvContents.length; i++) {
    const { headers, schema, data } = parseCSV(csvContents[i]);
    fileInfos.push({ headers, schema, index: i + 1 });
    
    const fileName = fileNames?.[i] || `File ${i + 1}`;
    const referenceFileName = fileNames?.[0] || `File 1`;
    
    if (!referenceHeaders) {
      referenceHeaders = headers;
      referenceSchema = schema;
    } else {
      // Check structure matches with detailed error information
      if (headers.join(',') !== referenceHeaders.join(',')) {
        // Find differences
        const missing = referenceHeaders.filter(h => !headers.includes(h));
        const extra = headers.filter(h => !referenceHeaders.includes(h));
        const wrongOrder = headers.length === referenceHeaders.length && 
          headers.some((h, idx) => h !== referenceHeaders[idx]);
        
        let errorDetails = `Header mismatch in "${fileName}":\n`;
        errorDetails += `Expected ${referenceHeaders.length} headers (from "${referenceFileName}"), found ${headers.length}.\n\n`;
        
        if (missing.length > 0) {
          errorDetails += `Missing headers: ${missing.join(', ')}\n`;
        }
        if (extra.length > 0) {
          errorDetails += `Extra headers: ${extra.join(', ')}\n`;
        }
        if (wrongOrder && missing.length === 0 && extra.length === 0) {
          errorDetails += `Headers are in wrong order.\n`;
          errorDetails += `Expected: ${referenceHeaders.slice(0, 5).join(', ')}${referenceHeaders.length > 5 ? '...' : ''}\n`;
          errorDetails += `Found: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}\n`;
        }
        
        errorDetails += `\nFirst file: "${referenceFileName}"`;
        errorDetails += `\nCurrent file: "${fileName}"`;
        
        throw new Error(errorDetails);
      }
      
      if (schema.join(',') !== referenceSchema!.join(',')) {
        const schemaDiffs: string[] = [];
        for (let j = 0; j < Math.max(schema.length, referenceSchema!.length); j++) {
          if (schema[j] !== referenceSchema![j]) {
            const headerName = headers[j] || `Column ${j + 1}`;
            schemaDiffs.push(`${headerName}: expected '${referenceSchema![j] || 'missing'}', found '${schema[j] || 'missing'}'`);
          }
        }
        
        let errorDetails = `Schema mismatch in "${fileName}":\n`;
        errorDetails += schemaDiffs.slice(0, 5).join('\n');
        if (schemaDiffs.length > 5) {
          errorDetails += `\n... and ${schemaDiffs.length - 5} more differences`;
        }
        
        errorDetails += `\n\nFirst file: "${referenceFileName}"`;
        errorDetails += `\nCurrent file: "${fileName}"`;
        
        throw new Error(errorDetails);
      }
    }
    
    allData.push(...data);
  }

  // Build combined CSV
  const formatRow = (row: string[]): string => {
    return row.map(field => {
      // Quote fields that contain commas, quotes, or newlines
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    }).join(',');
  };

  const lines = [
    formatRow(referenceHeaders!),
    formatRow(referenceSchema!),
    ...allData.map(row => formatRow(row))
  ];

  return lines.join('\n');
}