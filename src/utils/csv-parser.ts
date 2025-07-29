/**
 * Parse CSV string into array of arrays, handling quoted values with commas
 */
export function parseCSV(csvString: string): string[][] {
  const lines = csvString.split('\n').filter(line => line.trim());
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Don't forget the last value
    result.push(current.trim());
    
    return result;
  });
}