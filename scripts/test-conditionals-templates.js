/**
 * Test script for the new conditionals templates
 * Run with: node scripts/test-conditionals-templates.js
 */

const { ConditionalsTestTemplate } = require('../templates/conditionals_test.ts');
const { SimpleConditionalsTestTemplate } = require('../templates/simple_conditionals_test.ts');

console.log('Testing Conditionals Templates...\n');

try {
  // Test comprehensive conditionals template
  console.log('1. Testing ConditionalsTestTemplate...');
  const comprehensiveTemplate = ConditionalsTestTemplate.create();
  console.log(`   ✅ Name: ${comprehensiveTemplate.metadata.name}`);
  console.log(`   ✅ Sections: ${comprehensiveTemplate.sections.length}`);
  console.log(`   ✅ Total fields: ${comprehensiveTemplate.sections.reduce((acc, s) => acc + s.fields.length, 0)}`);
  
  // Count conditional fields
  const conditionalFields = comprehensiveTemplate.sections.reduce((acc, section) => {
    return acc + section.fields.filter(field => field.conditional).length;
  }, 0);
  console.log(`   ✅ Conditional fields: ${conditionalFields}`);
  
  // Test simple conditionals template
  console.log('\n2. Testing SimpleConditionalsTestTemplate...');
  const simpleTemplate = SimpleConditionalsTestTemplate.create();
  console.log(`   ✅ Name: ${simpleTemplate.metadata.name}`);
  console.log(`   ✅ Sections: ${simpleTemplate.sections.length}`);
  console.log(`   ✅ Total fields: ${simpleTemplate.sections.reduce((acc, s) => acc + s.fields.length, 0)}`);
  
  // Count conditional fields
  const simpleConditionalFields = simpleTemplate.sections.reduce((acc, section) => {
    return acc + section.fields.filter(field => field.conditional).length;
  }, 0);
  console.log(`   ✅ Conditional fields: ${simpleConditionalFields}`);
  
  console.log('\n✅ All conditionals templates created successfully!');
  
  // Show some example conditional logic
  console.log('\n📋 Sample Conditional Logic Examples:');
  
  const sampleField = comprehensiveTemplate.sections[0].fields.find(f => f.conditional);
  if (sampleField) {
    console.log(`   • Field "${sampleField.label}" depends on "${sampleField.conditional.dependsOn}"`);
    console.log(`   • Condition: ${sampleField.conditional.operator} [${sampleField.conditional.values.join(', ')}]`);
  }
  
  const simpleField = simpleTemplate.sections[0].fields.find(f => f.conditional);
  if (simpleField) {
    console.log(`   • Field "${simpleField.label}" depends on "${simpleField.conditional.dependsOn}"`);
    console.log(`   • Condition: ${simpleField.conditional.operator} [${simpleField.conditional.values.join(', ')}]`);
  }
  
} catch (error) {
  console.error('❌ Error testing conditionals templates:', error);
  process.exit(1);
}