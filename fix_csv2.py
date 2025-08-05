import re

# Read the file
with open("src/utils/csvProcessing.ts", "r") as f:
    content = f.read()

# Add import if not already there
if "import Papa" not in content:
    content = "import Papa from 'papaparse';

" + content

# Replace the parseCSV function
start = content.find("/**
 * Parse CSV content into structured data
 * ISSUE:")
if start \!= -1:
    # Find the end of the function
    end = content.find("
}", content.find("return { headers, schema, data };", start)) + 2
    if end > start:
        new_function = """/**
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
}"""
        content = content[:start] + new_function + content[end:]

# Write the file back
with open("src/utils/csvProcessing.ts", "w") as f:
    f.write(content)

print("CSV parsing fix applied successfully\!")
