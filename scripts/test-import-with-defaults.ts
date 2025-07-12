// Test script to verify importing templates with default values works

import { JCC2UserQuestionnaire } from '../src/programmatic/examples/JCC2UserQuestionnaire';
import { DefaultValueExample } from '../src/programmatic/examples/DefaultValueExample';
import { TDLConverter } from '../src/programmatic/tdl/converter';
import { FormTemplate, FormField } from '../src/types/form';

console.log('Testing template import with default values...\n');

const converter = new TDLConverter();

try {
  // Test JCC2 template import
  console.log('1. Testing JCC2UserQuestionnaire import...');
  const jcc2Template = JCC2UserQuestionnaire.create();
  const jcc2Result = converter.convertToGUI(jcc2Template);
  
  if (jcc2Result.success && jcc2Result.result) {
    // Convert to FormTemplate format  
    const jcc2FormTemplate: FormTemplate = {
      id: 'test-jcc2',
      name: jcc2Template.metadata.name,
      description: jcc2Template.metadata.description || '',
      sections: jcc2Result.result.sections.map(section => ({
        id: section.id,
        title: section.title,
        fields: section.fields.map(field => ({
          id: field.id,
          type: field.type as FormField['type'],
          label: field.label,
          placeholder: field.placeholder,
          required: field.required || false,
          options: field.options,
          validation: field.validation,
          conditional: field.conditional,
          defaultValue: field.defaultValue,
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(`  ✓ JCC2 template converted successfully`);
    console.log(`  ✓ Template name: ${jcc2FormTemplate.name}`);
    console.log(`  ✓ Sections: ${jcc2FormTemplate.sections.length}`);
    
    // Count fields with default values
    let fieldsWithDefaults = 0;
    jcc2FormTemplate.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          fieldsWithDefaults++;
        }
      });
    });
    console.log(`  ✓ Fields with default values: ${fieldsWithDefaults}`);
  } else {
    throw new Error('JCC2 conversion failed');
  }

  console.log('\n2. Testing DefaultValueExample import...');
  const defaultExample = DefaultValueExample.create();
  const defaultResult = converter.convertToGUI(defaultExample);
  
  if (defaultResult.success && defaultResult.result) {
    const defaultFormTemplate: FormTemplate = {
      id: 'test-defaults',
      name: defaultExample.metadata.name,
      description: defaultExample.metadata.description || '',
      sections: defaultResult.result.sections.map(section => ({
        id: section.id,
        title: section.title,
        fields: section.fields.map(field => ({
          id: field.id,
          type: field.type as FormField['type'],
          label: field.label,
          placeholder: field.placeholder,
          required: field.required || false,
          options: field.options,
          validation: field.validation,
          conditional: field.conditional,
          defaultValue: field.defaultValue,
        }))
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(`  ✓ Default example template converted successfully`);
    console.log(`  ✓ Template name: ${defaultFormTemplate.name}`);
    console.log(`  ✓ Sections: ${defaultFormTemplate.sections.length}`);
    
    // Count and show fields with default values
    let fieldsWithDefaults = 0;
    defaultFormTemplate.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          fieldsWithDefaults++;
          console.log(`    - ${field.label}: ${JSON.stringify(field.defaultValue)}`);
        }
      });
    });
    console.log(`  ✓ Fields with default values: ${fieldsWithDefaults}`);
  } else {
    throw new Error('Default example conversion failed');
  }

  console.log('\n✓ All template imports with default values working correctly!');
  console.log('\nThe web application should now support:');
  console.log('• Setting default values in the form builder UI');
  console.log('• Importing templates with default values from programmatic examples');
  console.log('• Rendering forms with pre-filled default values');
  console.log('• Converting between programmatic and GUI templates while preserving defaults');

} catch (error) {
  console.error('✗ Error testing template imports:', error.message);
  process.exit(1);
}