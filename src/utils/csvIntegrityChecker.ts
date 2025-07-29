import { FormTemplate, FormField, FormFieldValue, DataTableValue } from '../types/form';

export interface ValidationError {
  field: string;
  error: string;
  expected?: string;
  actual?: string;
}

export interface CSVIntegrityResult {
  isValid: boolean;
  completeness: {
    expectedFieldCount: number;
    presentFieldCount: number;
    missingFields: string[];
    extraFields: string[];
  };
  accuracy: {
    dataTypeErrors: ValidationError[];
    constraintViolations: ValidationError[];
    valueDiscrepancies: ValidationError[];
  };
  integrity: {
    totalRecords: number;
    validRecords: number;
    corruptedRecords: ValidationError[];
    nullFieldsHandled: boolean;
  };
  summary: {
    overallScore: number; // 0-100
    completenessScore: number; // 0-100
    accuracyScore: number; // 0-100
    integrityScore: number; // 0-100
  };
}

/**
 * Validates CSV export data against original form data for completeness and accuracy
 * @param template - The form template used to generate the data
 * @param originalData - The original form data before export
 * @param csvData - The exported CSV data as a string
 * @returns Comprehensive validation results
 */
export function validateCSVIntegrity(
  template: FormTemplate,
  originalData: Record<string, FormFieldValue>,
  csvData: string
): CSVIntegrityResult {
  const result: CSVIntegrityResult = {
    isValid: true,
    completeness: {
      expectedFieldCount: 0,
      presentFieldCount: 0,
      missingFields: [],
      extraFields: []
    },
    accuracy: {
      dataTypeErrors: [],
      constraintViolations: [],
      valueDiscrepancies: []
    },
    integrity: {
      totalRecords: 0,
      validRecords: 0,
      corruptedRecords: [],
      nullFieldsHandled: false
    },
    summary: {
      overallScore: 0,
      completenessScore: 0,
      accuracyScore: 0,
      integrityScore: 0
    }
  };

  try {
    // Parse CSV data
    const csvRows = csvData.split('\n').filter(row => row.trim());
    if (csvRows.length < 2) {
      result.isValid = false;
      result.integrity.corruptedRecords.push({
        field: 'csv_structure',
        error: 'CSV must contain at least headers and one data row'
      });
      return result;
    }

    const headers = parseCSVRow(csvRows[0]);
    const schemaRow = csvRows.length > 1 ? parseCSVRow(csvRows[1]) : [];
    const dataRows = csvRows.slice(2).map(row => parseCSVRow(row));

    result.integrity.totalRecords = dataRows.length;

    // Validate completeness
    validateCompleteness(template, originalData, headers, result);

    // Validate accuracy for each data row
    dataRows.forEach((row, index) => {
      validateAccuracy(template, originalData, headers, row, schemaRow, index, result);
    });

    // Validate integrity
    validateIntegrity(template, originalData, dataRows, result);

    // Calculate summary scores
    calculateSummaryScores(result);

  } catch (error) {
    result.isValid = false;
    result.integrity.corruptedRecords.push({
      field: 'csv_parsing',
      error: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }

  return result;
}

/**
 * Parses a CSV row handling quoted fields and escaped quotes
 */
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < row.length) {
    const char = row[i];
    
    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (i + 1 < row.length && row[i + 1] === '"') {
        current += '"';
        i++; // Skip the next quote
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
    i++;
  }
  
  result.push(current);
  return result;
}

/**
 * Validates that all expected fields are present in the CSV
 */
function validateCompleteness(
  template: FormTemplate,
  originalData: Record<string, FormFieldValue>,
  headers: string[],
  result: CSVIntegrityResult
): void {
  // Expected system fields
  const expectedSystemFields = ['id', 'status', 'progress', 'created_at', 'updated_at', 'last_saved'];
  
  // Expected form fields with dot notation
  const expectedFormFields: string[] = [];
  template.sections.forEach(section => {
    section.fields.forEach(field => {
      expectedFormFields.push(`${section.id}.${field.id}`);
    });
  });

  const allExpectedFields = [...expectedSystemFields, ...expectedFormFields];
  result.completeness.expectedFieldCount = allExpectedFields.length;
  result.completeness.presentFieldCount = headers.length;

  // Find missing fields
  allExpectedFields.forEach(field => {
    if (!headers.includes(field)) {
      result.completeness.missingFields.push(field);
    }
  });

  // Find extra fields
  headers.forEach(header => {
    if (!allExpectedFields.includes(header)) {
      result.completeness.extraFields.push(header);
    }
  });

  // Calculate completeness score
  const missingCount = result.completeness.missingFields.length;
  const extraCount = result.completeness.extraFields.length;
  const totalExpected = allExpectedFields.length;
  
  result.summary.completenessScore = Math.max(0, 
    ((totalExpected - missingCount) / totalExpected) * 100 - (extraCount * 5)
  );
}

/**
 * Validates data accuracy for a single row
 */
function validateAccuracy(
  template: FormTemplate,
  originalData: Record<string, FormFieldValue>,
  headers: string[],
  dataRow: string[],
  schemaRow: string[],
  rowIndex: number,
  result: CSVIntegrityResult
): void {
  // Create field lookup map
  const fieldLookup = new Map<string, FormField>();
  template.sections.forEach(section => {
    section.fields.forEach(field => {
      fieldLookup.set(`${section.id}.${field.id}`, field);
    });
  });

  headers.forEach((header, colIndex) => {
    const cellValue = dataRow[colIndex] || '';
    const schemaInfo = schemaRow[colIndex] || '';
    
    // Skip system fields for now
    if (['id', 'status', 'progress', 'created_at', 'updated_at', 'last_saved'].includes(header)) {
      return;
    }

    const field = fieldLookup.get(header);
    if (!field) {
      result.accuracy.dataTypeErrors.push({
        field: header,
        error: `Field not found in template`,
        actual: cellValue
      });
      return;
    }

    // Get original field value - use the header which includes section ID
    const originalValue = originalData[header];
    
    // Validate data type consistency
    validateDataType(field, cellValue, header, result);
    
    // Validate constraints
    validateConstraints(field, cellValue, header, result);
    
    // Validate value consistency (comparing with original data)
    validateValueConsistency(field, originalValue, cellValue, header, result);
  });
}

/**
 * Validates data type consistency
 */
function validateDataType(
  field: FormField,
  cellValue: string,
  fieldName: string,
  result: CSVIntegrityResult
): void {
  // Skip empty/null values
  if (!cellValue || cellValue.toLowerCase() === 'null') {
    return;
  }

  switch (field.type) {
    case 'number':
    case 'range':
      if (isNaN(Number(cellValue))) {
        result.accuracy.dataTypeErrors.push({
          field: fieldName,
          error: `Expected number, got: ${cellValue}`,
          expected: 'number',
          actual: cellValue
        });
      }
      break;
    
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(cellValue)) {
        result.accuracy.dataTypeErrors.push({
          field: fieldName,
          error: `Expected date format YYYY-MM-DD, got: ${cellValue}`,
          expected: 'YYYY-MM-DD',
          actual: cellValue
        });
      }
      break;
      
    case 'email':
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cellValue)) {
        result.accuracy.dataTypeErrors.push({
          field: fieldName,
          error: `Expected valid email format, got: ${cellValue}`,
          expected: 'email format',
          actual: cellValue
        });
      }
      break;
      
    case 'checkbox':
      // Should be array-like format or comma-separated values
      if (cellValue && !cellValue.includes(',') && !cellValue.startsWith('[')) {
        // Single values are acceptable for checkboxes
      }
      break;
      
    case 'datatable':
      // DataTable values should be valid JSON (already unescaped by CSV parser)
      try {
        const parsed = JSON.parse(cellValue);
        if (!parsed.columns || !Array.isArray(parsed.columns) || 
            !parsed.rows || !Array.isArray(parsed.rows)) {
          result.accuracy.dataTypeErrors.push({
            field: fieldName,
            error: `Invalid DataTable structure`,
            expected: 'object with columns and rows arrays',
            actual: cellValue
          });
        }
      } catch (e) {
        result.accuracy.dataTypeErrors.push({
          field: fieldName,
          error: `Expected valid JSON for DataTable, got: ${cellValue}`,
          expected: 'valid JSON',
          actual: cellValue
        });
      }
      break;
  }
}

/**
 * Validates field constraints
 */
function validateConstraints(
  field: FormField,
  cellValue: string,
  fieldName: string,
  result: CSVIntegrityResult
): void {
  if (!field.validation || !cellValue || cellValue.toLowerCase() === 'null') {
    return;
  }

  const validation = field.validation;

  // String length validation
  if (validation.minLength && cellValue.length < validation.minLength) {
    result.accuracy.constraintViolations.push({
      field: fieldName,
      error: `Value too short (${cellValue.length} chars, min: ${validation.minLength})`,
      expected: `min ${validation.minLength} characters`,
      actual: `${cellValue.length} characters`
    });
  }

  if (validation.maxLength && cellValue.length > validation.maxLength) {
    result.accuracy.constraintViolations.push({
      field: fieldName,
      error: `Value too long (${cellValue.length} chars, max: ${validation.maxLength})`,
      expected: `max ${validation.maxLength} characters`,
      actual: `${cellValue.length} characters`
    });
  }

  // Numeric validation
  if (field.type === 'number' && !isNaN(Number(cellValue))) {
    const numValue = Number(cellValue);
    
    if (validation.min !== undefined && numValue < validation.min) {
      result.accuracy.constraintViolations.push({
        field: fieldName,
        error: `Value too small (${numValue}, min: ${validation.min})`,
        expected: `min ${validation.min}`,
        actual: numValue.toString()
      });
    }

    if (validation.max !== undefined && numValue > validation.max) {
      result.accuracy.constraintViolations.push({
        field: fieldName,
        error: `Value too large (${numValue}, max: ${validation.max})`,
        expected: `max ${validation.max}`,
        actual: numValue.toString()
      });
    }
  }

  // Pattern validation
  if (validation.pattern) {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(cellValue)) {
        result.accuracy.constraintViolations.push({
          field: fieldName,
          error: `Value doesn't match pattern: ${validation.pattern}`,
          expected: validation.pattern,
          actual: cellValue
        });
      }
    } catch (e) {
      result.accuracy.constraintViolations.push({
        field: fieldName,
        error: `Invalid pattern in field validation: ${validation.pattern}`,
        expected: 'valid regex pattern',
        actual: validation.pattern
      });
    }
  }
}

/**
 * Validates value consistency between original and exported data
 */
function validateValueConsistency(
  field: FormField,
  originalValue: FormFieldValue,
  csvValue: string,
  fieldName: string,
  result: CSVIntegrityResult
): void {
  // Handle null/empty values
  if (originalValue === null || originalValue === undefined || originalValue === '') {
    if (csvValue && csvValue.toLowerCase() !== 'null') {
      result.accuracy.valueDiscrepancies.push({
        field: fieldName,
        error: `Original value was null/empty but CSV contains: ${csvValue}`,
        expected: 'null or empty',
        actual: csvValue
      });
    }
    return;
  }

  // Convert original value to string for comparison
  let expectedCsvValue: string;
  
  if (field.type === 'checkbox' && Array.isArray(originalValue)) {
    expectedCsvValue = originalValue.join(',');
  } else if (typeof originalValue === 'boolean') {
    expectedCsvValue = originalValue.toString();
  } else if (field.type === 'datatable' && typeof originalValue === 'object' && 'columns' in originalValue && 'rows' in originalValue) {
    // Handle DataTable values - serialize as JSON
    // The CSV parser already removes quotes and unescapes, so we compare the JSON directly
    const dataTableValue = originalValue as DataTableValue;
    expectedCsvValue = JSON.stringify(dataTableValue);
  } else {
    expectedCsvValue = originalValue.toString();
  }

  // Compare values (accounting for CSV escaping)
  if (csvValue !== expectedCsvValue) {
    result.accuracy.valueDiscrepancies.push({
      field: fieldName,
      error: `Value mismatch`,
      expected: expectedCsvValue,
      actual: csvValue
    });
  }
}

/**
 * Validates overall data integrity
 */
function validateIntegrity(
  template: FormTemplate,
  originalData: Record<string, FormFieldValue>,
  dataRows: string[][],
  result: CSVIntegrityResult
): void {
  // For dev tool purposes, we expect exactly 1 record
  if (dataRows.length !== 1) {
    result.integrity.corruptedRecords.push({
      field: 'record_count',
      error: `Expected 1 record, found ${dataRows.length}`,
      expected: '1',
      actual: dataRows.length.toString()
    });
  }

  // Check if conditional fields are properly handled (set to null when hidden)
  // This is a simplified check - a full implementation would need to evaluate
  // all conditional logic
  result.integrity.nullFieldsHandled = true; // Assume handled for now

  // Count valid records (those without corruption issues)
  result.integrity.validRecords = dataRows.length - result.integrity.corruptedRecords.length;

  // Calculate integrity score
  const corruptionCount = result.integrity.corruptedRecords.length;
  result.summary.integrityScore = Math.max(0, 
    ((result.integrity.totalRecords - corruptionCount) / Math.max(1, result.integrity.totalRecords)) * 100
  );
}

/**
 * Calculates summary scores
 */
function calculateSummaryScores(result: CSVIntegrityResult): void {
  // Accuracy score based on errors with more sensitive scoring for dev tool
  const dataTypeErrors = result.accuracy.dataTypeErrors.length;
  const constraintViolations = result.accuracy.constraintViolations.length;
  const valueDiscrepancies = result.accuracy.valueDiscrepancies.length;
  const totalErrors = dataTypeErrors + constraintViolations + valueDiscrepancies;
  
  // For dev tool, use more sensitive scoring:
  // - Data type errors are critical (deduct 20 points each)
  // - Constraint violations are important (deduct 15 points each)
  // - Value discrepancies are significant (deduct 10 points each)
  const errorPenalty = (dataTypeErrors * 20) + (constraintViolations * 15) + (valueDiscrepancies * 10);
  result.summary.accuracyScore = Math.max(0, 100 - errorPenalty);

  // Overall score (weighted average)
  result.summary.overallScore = Math.round(
    (result.summary.completenessScore * 0.3) +
    (result.summary.accuracyScore * 0.4) +
    (result.summary.integrityScore * 0.3)
  );

  // Set overall validity - stricter criteria for dev tool
  result.isValid = result.summary.overallScore >= 90 && 
                  result.completeness.missingFields.length === 0 &&
                  result.accuracy.dataTypeErrors.length === 0 &&
                  result.accuracy.valueDiscrepancies.length === 0;
}