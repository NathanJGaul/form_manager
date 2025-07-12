// Test script to verify JCC2 template default values

import { JCC2UserQuestionnaire } from '../src/programmatic/examples/JCC2UserQuestionnaire';

console.log('Testing JCC2 template default values...\n');

try {
  const template = JCC2UserQuestionnaire.create();
  
  console.log('✓ JCC2 Template created successfully');
  console.log(`✓ Template name: ${template.metadata.name}`);
  console.log(`✓ Template version: ${template.metadata.version}`);
  console.log(`✓ Number of sections: ${template.sections.length}\n`);
  
  // Check the first two sections for fields with default values
  template.sections.slice(0, 2).forEach((section, sectionIndex) => {
    console.log(`Section ${sectionIndex + 1}: ${section.title}`);
    
    section.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        console.log(`  ✓ Field "${field.label}" has default value: ${JSON.stringify(field.defaultValue)}`);
      } else {
        console.log(`  - Field "${field.label}" has no default value`);
      }
    });
    console.log('');
  });
  
  console.log('✓ JCC2 template default values test completed successfully!');
  
} catch (error) {
  console.error('✗ Error testing JCC2 template default values:', error.message);
  process.exit(1);
}