// Debug script to check JCC2 form structure
const fs = require('fs');
const path = require('path');

// Import the JCC2 template
const jcc2Template = `
const { TemplateBuilder } = require('../src/programmatic/index');

// Basic required fields test
const builder = new TemplateBuilder()
  .create('JCC2 User Questionnaire V2 Debug')
  .description('Debug version to test required fields')
  .author('Debug')
  .version('1.0.0');

// Add just the essential required fields from the template
builder.section('User Information')
  .field('text', 'Event').id('event').required().end()
  .field('date', 'Date').id('date').required().defaultValue(new Date().toISOString().split('T')[0]).end()
  .field('text', 'Rank/Name').id('rank_name').required().end()
  .field('text', 'Unit').id('unit').end()
  .field('email', 'Email').id('email').required().end()
  .field('tel', 'Phone').id('phone').end();

builder.section('Role and Echelon')
  .field('radio', 'Status of Current Role').id('current_role_status').required().options(['Active Duty', 'Guard/Reserve', 'DoD Civilian', 'Contractor']).layout('horizontal').defaultValue('Active Duty').end()
  .field('radio', 'Current Cyber Operator').id('is_cyber_operator').required().options(['Yes', 'No']).layout('horizontal').defaultValue('No').end()
  .field('radio', 'Echelon You Work Within').id('echelon').required().options(['Strategic', 'Operational', 'Tactical']).layout('horizontal').defaultValue('Operational').end()
  .field('checkbox', 'Duties You Perform').id('duties').multiple().required().options(['Offensive Cyber Operations', 'Defensive Cyber Operations', 'Mission Planning', 'Internal Defense Measures', 'Ticket Creation', 'Other(s)']).layout('horizontal').end();

const template = builder.build();

console.log('Debug JCC2 Template Structure:');
console.log('Total sections:', template.sections.length);

template.sections.forEach((section, sectionIndex) => {
  console.log(\`\\nSection \${sectionIndex + 1}: \${section.title}\`);
  section.fields.forEach((field, fieldIndex) => {
    console.log(\`  Field \${fieldIndex + 1}: \${field.id} (\${field.type}) - Required: \${field.required}\`);
    if (field.defaultValue) {
      console.log(\`    Default value: \${field.defaultValue}\`);
    }
  });
});

// Test progress calculation with minimal data
const mockData = {
  event: 'Test Event',
  date: '2024-01-15', 
  rank_name: 'Test User',
  email: 'test@example.com',
  current_role_status: 'Active Duty',
  is_cyber_operator: 'No',
  echelon: 'Operational',
  duties: ['Defensive Cyber Operations']
};

console.log('\\nMock form data:', mockData);
console.log('\\nRequired fields analysis:');

let totalRequired = 0;
let filledRequired = 0;

template.sections.forEach(section => {
  section.fields.forEach(field => {
    if (field.required) {
      totalRequired++;
      console.log(\`Required field: \${field.id} - Has value: \${mockData[field.id] !== undefined}\`);
      if (mockData[field.id] !== undefined) {
        filledRequired++;
      }
    }
  });
});

console.log(\`\\nProgress: \${filledRequired}/\${totalRequired} required fields filled (\${Math.round((filledRequired/totalRequired)*100)}%)\`);
`;

fs.writeFileSync(path.join(__dirname, 'debug-template.js'), jcc2Template);
console.log('Debug template written to debug-template.js');