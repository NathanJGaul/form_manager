// Test script to verify default value functionality

import { DefaultValueExample } from '../dist/programmatic/index.js';

console.log('Testing default value functionality...\n');

try {
  const template = DefaultValueExample.create();
  
  console.log('✓ Template created successfully');
  console.log(`✓ Template name: ${template.metadata.name}`);
  console.log(`✓ Template version: ${template.metadata.version}`);
  console.log(`✓ Number of sections: ${template.sections.length}\n`);
  
  // Check each section for fields with default values
  template.sections.forEach((section, sectionIndex) => {
    console.log(`Section ${sectionIndex + 1}: ${section.title}`);
    
    section.fields.forEach((field, fieldIndex) => {
      if (field.defaultValue !== undefined) {
        console.log(`  ✓ Field "${field.label}" has default value: ${JSON.stringify(field.defaultValue)}`);
      } else {
        console.log(`  - Field "${field.label}" has no default value`);
      }
    });
    console.log('');
  });
  
  console.log('✓ Default value functionality test completed successfully!');
  
} catch (error) {
  console.error('✗ Error testing default values:', error.message);
  process.exit(1);
}