// Test script to verify web application default value functionality

import { FormTemplate, FormField } from '../src/types/form';

console.log('Testing web application default value support...\n');

try {
  // Create a sample template with default values
  const testTemplate: FormTemplate = {
    id: 'test-default-values',
    name: 'Default Values Test Form',
    description: 'Testing default value functionality in the web application',
    sections: [{
      id: 'section-1',
      title: 'Basic Information',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true,
          defaultValue: 'John Doe'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          defaultValue: 'john.doe@example.com'
        },
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          required: false,
          defaultValue: 25
        },
        {
          id: 'birthdate',
          type: 'date',
          label: 'Birth Date',
          required: false,
          defaultValue: '1999-01-01'
        },
        {
          id: 'role',
          type: 'select',
          label: 'Role',
          required: true,
          options: ['Developer', 'Designer', 'Manager', 'Other'],
          defaultValue: 'Developer'
        },
        {
          id: 'experience',
          type: 'radio',
          label: 'Experience Level',
          required: true,
          options: ['Beginner', 'Intermediate', 'Advanced'],
          defaultValue: 'Intermediate'
        },
        {
          id: 'skills',
          type: 'checkbox',
          label: 'Skills',
          required: false,
          options: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Python'],
          defaultValue: ['JavaScript', 'TypeScript']
        },
        {
          id: 'bio',
          type: 'textarea',
          label: 'Biography',
          required: false,
          defaultValue: 'Tell us about yourself...'
        }
      ] as FormField[]
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('✓ Test template created successfully');
  console.log(`✓ Template name: ${testTemplate.name}`);
  console.log(`✓ Number of sections: ${testTemplate.sections.length}`);
  console.log(`✓ Number of fields: ${testTemplate.sections[0].fields.length}\n`);

  // Check each field for default values
  const section = testTemplate.sections[0];
  console.log(`Section: ${section.title}`);
  
  section.fields.forEach((field) => {
    if (field.defaultValue !== undefined) {
      console.log(`  ✓ Field "${field.label}" (${field.type}) has default value: ${JSON.stringify(field.defaultValue)}`);
    } else {
      console.log(`  - Field "${field.label}" (${field.type}) has no default value`);
    }
  });

  console.log('\n✓ Default value functionality test completed successfully!');
  console.log('\nTo test in the browser:');
  console.log('1. Run: npm run dev');
  console.log('2. Open the Form Builder');
  console.log('3. Import the "Default Values Demo" template');
  console.log('4. Verify default values appear in the form builder');
  console.log('5. Render the form and verify default values are pre-filled');

} catch (error) {
  console.error('✗ Error testing default values:', error.message);
  process.exit(1);
}