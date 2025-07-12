// Simple test to verify progress calculation is working
const { JCC2UserQuestionnaireV2 } = require('../templates/jcc2_questionnaire_v2.ts');

// Mock form data with just the required fields filled
const mockFormData = {
  event: 'Test Event',
  date: '2024-01-15',
  rank_name: 'Test User SSgt',
  email: 'test@example.com',
  current_role_status: 'Active Duty',
  is_cyber_operator: 'No',
  echelon: 'Operational',
  duties: ['Defensive Cyber Operations']
};

console.log('Testing progress calculation...');
console.log('Mock form data:', mockFormData);

// Create the template
const template = JCC2UserQuestionnaireV2.create();
console.log(`Template has ${template.sections.length} sections`);

// Count required fields
let totalRequiredFields = 0;
template.sections.forEach(section => {
  section.fields.forEach(field => {
    if (field.required) {
      totalRequiredFields++;
      console.log(`Required field: ${field.id} (${field.type})`);
    }
  });
});

console.log(`Total required fields: ${totalRequiredFields}`);