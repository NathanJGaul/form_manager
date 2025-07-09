import { CommonTemplates } from './src/programmatic/library/CommonTemplates.js';

console.log('Testing default templates...');

try {
  // Test JCC2 template
  const jcc2Template = CommonTemplates.getTemplate('jcc2-questionnaire');
  console.log('\n✅ JCC2 Template loaded successfully:');
  console.log(`  Name: ${jcc2Template.metadata.name}`);
  console.log(`  Description: ${jcc2Template.metadata.description}`);
  console.log(`  Sections: ${jcc2Template.sections.length}`);
  console.log(`  Total fields: ${jcc2Template.sections.reduce((sum, s) => sum + s.fields.length, 0)}`);
  
  // List all templates
  console.log('\n📋 Available templates:');
  CommonTemplates.listTemplates().forEach(name => {
    try {
      const template = CommonTemplates.getTemplate(name);
      console.log(`  - ${name}: "${template.metadata.name}"`);
    } catch (e) {
      console.log(`  - ${name}: ERROR - ${e.message}`);
    }
  });
  
} catch (error) {
  console.error('❌ Error testing templates:', error.message);
}