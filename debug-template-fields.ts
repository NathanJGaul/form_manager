// Debug script to understand field structure in JCC2 v4 template
import { createJCC2DataCollectionFormV4 } from './templates/jcc2_data_collection_form_v4.ts';

const template = createJCC2DataCollectionFormV4();

console.log("=== JCC2 v4 Template Field Analysis ===\n");

// Find a specific section to analyze
const mop111Section = template.sections.find(s => s.id === 'mop111');
const mos112Section = template.sections.find(s => s.id === 'mos112');

if (mop111Section) {
  console.log("MOP 1.1.1 Section Fields:");
  mop111Section.fields.forEach(field => {
    console.log(`  - ID: "${field.id}", Type: ${field.type}`);
  });
}

if (mos112Section) {
  console.log("\nMOS 1.1.2 Section Fields:");
  mos112Section.fields.forEach(field => {
    console.log(`  - ID: "${field.id}", Type: ${field.type}`);
  });
}

// Check for task_performance fields
console.log("\n\nSearching for task_performance fields across all sections:");
template.sections.forEach(section => {
  const taskPerfField = section.fields.find(f => f.id === 'task_performance' || f.id.includes('task_performance'));
  if (taskPerfField) {
    console.log(`  - Section: ${section.id}, Field ID: "${taskPerfField.id}", Type: ${taskPerfField.type}`);
  }
});

// Check field count per section
console.log("\n\nField count by section:");
template.sections.slice(0, 10).forEach(section => {
  console.log(`  - ${section.id}: ${section.fields.length} fields`);
});