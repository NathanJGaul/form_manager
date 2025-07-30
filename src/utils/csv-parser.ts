import Papa from 'papaparse';

/**
 * Parse CSV string into array of arrays, handling quoted values with commas
 * Now uses Papa Parse for robust, battle-tested CSV parsing
 */
export function parseCSV(csvString: string): string[][] {
  const result = Papa.parse<string[]>(csvString, {
    header: false,
    skipEmptyLines: true,
    // Automatically detect and handle different delimiters if needed
    delimiter: ',',
    // Handle different line endings automatically
    newline: undefined,
    // Preserve quotes in data
    quoteChar: '"',
    // Use standard CSV escaping
    escapeChar: '"',
    // Transform values to maintain consistency with previous implementation
    transform: (value: string, field: number | string): string => {
      // Papa Parse already handles quoted fields properly, 
      // so we just return the value as-is
      return value;
    }
  });

  if (result.errors.length > 0) {
    // Log parsing errors but don't throw - Papa Parse is quite forgiving
    console.warn('CSV parsing warnings:', result.errors);
  }

  return result.data;
}

/**
 * Convert array of arrays back to CSV string with proper escaping
 * Uses Papa Parse for consistent formatting
 */
export function arrayToCSV(data: string[][]): string {
  return Papa.unparse(data, {
    header: false,
    delimiter: ',',
    newline: '\n',
    quoteChar: '"',
    escapeChar: '"',
    // Quote fields that need it (containing delimiter, quotes, or newlines)
    quotes: (value: any, field: any): boolean => {
      const str = String(value);
      return str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');
    }
  });
}

/**
 * Parse CSV with headers, returning an array of objects
 * Useful for working with structured data
 */
export function parseCSVWithHeaders<T = any>(csvString: string): T[] {
  const result = Papa.parse<T>(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // Keep all values as strings for form data
    transformHeader: (header: string): string => {
      // Trim whitespace from headers
      return header.trim();
    }
  });

  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
  }

  return result.data;
}

/**
 * Convert array of objects to CSV string with headers
 */
export function objectsToCSV<T extends Record<string, any>>(data: T[], headers?: string[]): string {
  return Papa.unparse(data, {
    header: true,
    columns: headers, // Optionally specify column order
    delimiter: ',',
    newline: '\n'
  });
}