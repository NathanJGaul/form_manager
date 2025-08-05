#!/usr/bin/env tsx

/**
 * CSV Schema Rescue Script
 * 
 * This script fixes CSV files exported from JCC2 v4 forms that have "unknown" schemas.
 * It reads a CSV file, identifies fields with unknown schemas, and replaces them with
 * the correct schema definitions based on the field patterns.
 * 
 * Usage:
 *   npx tsx scripts/rescue-csv-schemas.ts <input-csv-file> [output-csv-file]
 * 
 * If no output file is specified, the script will create a new file with "_fixed" suffix.
 */

import * as fs from 'fs';
import * as path from 'path';
import Papa from 'papaparse';

// Define the schema mappings based on field patterns
const SCHEMA_MAPPINGS = {
  // Task-related radio fields
  task_performance: 'radio|required|options:Yes,N/A,No',
  task_workaround: 'radio|required|options:Yes,N/A,No',
  problem_occurrence: 'radio|required|options:Yes,N/A,No',
  task_outcome: 'radio|required|options:Yes,N/A,No',
  
  // Task-related detail fields (textareas)
  task_performance_details: 'textarea|optional',
  task_workaround_details: 'textarea|optional',
  problem_occurrence_details: 'textarea|optional',
  task_outcome_details: 'textarea|optional',
  additional_observations: 'textarea|optional',
  
  // Interview section radio fields
  workarounds_use: 'radio|required|options:Yes,No',
  tasc_apps_adequate: 'radio|required|options:Yes,No',
  jcc2_apps_easier: 'radio|required|options:Yes,No',
  jcc2_apps_faster: 'radio|required|options:Yes,No',
  jcc2_apps_future_use: 'radio|required|options:Yes,No',
  jcc2_recommend: 'radio|required|options:Yes,No',
  
  // Interview section detail fields
  workarounds_use_details: 'textarea|optional',
  tasc_apps_adequate_details: 'textarea|optional',
  jcc2_apps_easier_details: 'textarea|optional',
  jcc2_apps_faster_details: 'textarea|optional',
  jcc2_apps_future_use_details: 'textarea|optional',
  jcc2_recommend_details: 'textarea|optional',
  final_thoughts: 'textarea|optional',
  
  // Checkbox fields
  workarounds_use_reasons: 'checkbox|optional|options:Missing capabilities,Partial functional capabilities,External application works better,Other? (Explain)|multiple',
  workarounds_use_other: 'textarea|optional|depends_on:workarounds_use_reasons',
  
  // Data table fields (observation runs)
  '_runs': 'datatable|columns:varies|minRows:1|maxRows:10|allowAddRows:true|allowDeleteRows:true'
};

/**
 * Determines the correct schema for a field based on its header name
 */
function getCorrectSchema(header: string): string | null {
  // Remove section prefix to get field ID
  const parts = header.split('.');
  const fieldId = parts[parts.length - 1];
  
  // Check for exact matches first
  if (SCHEMA_MAPPINGS[fieldId as keyof typeof SCHEMA_MAPPINGS]) {
    return SCHEMA_MAPPINGS[fieldId as keyof typeof SCHEMA_MAPPINGS];
  }
  
  // Check for pattern matches
  for (const [pattern, schema] of Object.entries(SCHEMA_MAPPINGS)) {
    if (fieldId.endsWith(pattern)) {
      return schema;
    }
  }
  
  // Special handling for datatable fields
  if (fieldId.endsWith('_runs')) {
    // For datatable fields, we need to determine the specific columns
    // For now, return a generic datatable schema
    return 'datatable|columns:varies|minRows:1|maxRows:10|allowAddRows:true|allowDeleteRows:true';
  }
  
  return null;
}

/**
 * Main function to rescue the CSV file
 */
async function rescueCSV(inputFile: string, outputFile: string) {
  console.log('🔧 CSV Schema Rescue Script');
  console.log('===========================\n');
  
  // Check if input file exists
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Error: Input file '${inputFile}' does not exist.`);
    process.exit(1);
  }
  
  console.log(`📖 Reading input file: ${inputFile}`);
  
  // Read the CSV file
  const csvContent = fs.readFileSync(inputFile, 'utf-8');
  
  // Parse the CSV to get rows
  const lines = csvContent.split('\n');
  
  if (lines.length < 2) {
    console.error('❌ Error: CSV file must have at least 2 rows (headers and schemas).');
    process.exit(1);
  }
  
  // Parse headers and schemas
  const headerLine = lines[0];
  const schemaLine = lines[1];
  
  // Parse using Papa Parse to handle complex CSV properly
  const headersParsed = Papa.parse(headerLine, { 
    delimiter: ',',
    quoteChar: '"',
    escapeChar: '"'
  });
  
  const schemasParsed = Papa.parse(schemaLine, {
    delimiter: ',',
    quoteChar: '"',
    escapeChar: '"'
  });
  
  if (!headersParsed.data || !headersParsed.data[0]) {
    console.error('❌ Error: Could not parse headers.');
    process.exit(1);
  }
  
  if (!schemasParsed.data || !schemasParsed.data[0]) {
    console.error('❌ Error: Could not parse schemas.');
    process.exit(1);
  }
  
  const headers = headersParsed.data[0] as string[];
  const schemas = schemasParsed.data[0] as string[];
  
  console.log(`\n📊 Found ${headers.length} columns`);
  
  // Track changes
  let fixedCount = 0;
  const fixes: { header: string, oldSchema: string, newSchema: string }[] = [];
  
  // Fix unknown schemas and incorrect radio field schemas
  const fixedSchemas = schemas.map((schema, index) => {
    const header = headers[index];
    
    // Fix unknown schemas
    if (schema === 'unknown') {
      const correctSchema = getCorrectSchema(header);
      
      if (correctSchema) {
        fixes.push({
          header,
          oldSchema: schema,
          newSchema: correctSchema
        });
        fixedCount++;
        return correctSchema;
      }
    }
    
    // Fix radio fields that incorrectly have "multiple" attribute
    // Radio buttons cannot be multiple by definition
    if (schema.startsWith('radio') && schema.includes('|multiple')) {
      const fixedSchema = schema.replace('|multiple', '');
      fixes.push({
        header,
        oldSchema: schema,
        newSchema: fixedSchema
      });
      fixedCount++;
      return fixedSchema;
    }
    
    return schema;
  });
  
  console.log(`\n🔍 Found ${fixedCount} schemas to fix (unknown or incorrect)`);
  
  if (fixedCount > 0) {
    console.log('\n📝 Fixed schemas:');
    fixes.forEach(fix => {
      console.log(`   ✅ ${fix.header}`);
      console.log(`      Old: ${fix.oldSchema}`);
      console.log(`      New: ${fix.newSchema}`);
    });
  }
  
  // Rebuild the CSV with fixed schemas
  console.log(`\n💾 Writing output file: ${outputFile}`);
  
  // Create the new schema line
  const newSchemaLine = Papa.unparse([fixedSchemas], {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    delimiter: ','
  });
  
  // Rebuild the CSV
  const outputLines = [
    headerLine,
    newSchemaLine,
    ...lines.slice(2)
  ];
  
  // Write the output file
  fs.writeFileSync(outputFile, outputLines.join('\n'));
  
  console.log(`\n✨ Success! Fixed ${fixedCount} schemas.`);
  console.log(`📄 Output saved to: ${outputFile}`);
  
  // Summary statistics
  const totalUnknown = schemas.filter(s => s === 'unknown').length;
  const totalIncorrectRadio = schemas.filter(s => s.startsWith('radio') && s.includes('|multiple')).length;
  const remainingUnknown = fixedSchemas.filter(s => s === 'unknown').length;
  const remainingIncorrectRadio = fixedSchemas.filter(s => s.startsWith('radio') && s.includes('|multiple')).length;
  
  console.log('\n📈 Summary:');
  console.log(`   Total columns: ${headers.length}`);
  console.log(`   Unknown schemas found: ${totalUnknown}`);
  console.log(`   Incorrect radio schemas found: ${totalIncorrectRadio}`);
  console.log(`   Total schemas fixed: ${fixedCount}`);
  console.log(`   Remaining unknown: ${remainingUnknown}`);
  console.log(`   Remaining incorrect: ${remainingIncorrectRadio}`);
  
  if (remainingUnknown > 0) {
    console.log('\n⚠️  Warning: Some schemas could not be automatically fixed.');
    console.log('   These may require manual review:');
    fixedSchemas.forEach((schema, index) => {
      if (schema === 'unknown') {
        console.log(`   - ${headers[index]}`);
      }
    });
  }
}

// Command line interface
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('CSV Schema Rescue Script');
    console.log('========================\n');
    console.log('This script fixes CSV files with "unknown" schemas from JCC2 v4 forms.\n');
    console.log('Usage:');
    console.log('  npx tsx scripts/rescue-csv-schemas.ts <input-csv> [output-csv]\n');
    console.log('Examples:');
    console.log('  npx tsx scripts/rescue-csv-schemas.ts data.csv');
    console.log('  npx tsx scripts/rescue-csv-schemas.ts data.csv data_fixed.csv\n');
    console.log('If no output file is specified, "_fixed" will be added to the input filename.');
    process.exit(0);
  }
  
  const inputFile = args[0];
  let outputFile = args[1];
  
  // Generate output filename if not provided
  if (!outputFile) {
    const dir = path.dirname(inputFile);
    const ext = path.extname(inputFile);
    const basename = path.basename(inputFile, ext);
    outputFile = path.join(dir, `${basename}_fixed${ext}`);
  }
  
  // Run the rescue operation
  rescueCSV(inputFile, outputFile).catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
}

// Run the script
main();