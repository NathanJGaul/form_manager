// Simple test to verify CSV export functionality
// This file can be deleted after testing

const testTemplate = {
  id: 'test-template',
  name: 'Test Form',
  description: 'A test form for CSV export',
  sections: [
    {
      id: 'section-1',
      title: 'Personal Information',
      fields: [
        {
          id: 'full_name',
          type: 'text',
          label: 'Full Name',
          required: true,
          validation: {
            pattern: '^[a-zA-Z\\s\\-\\.]+$',
            minLength: 2,
            maxLength: 50
          }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          validation: {
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
          }
        }
      ]
    },
    {
      id: 'section-2',
      title: 'Event Preferences',
      fields: [
        {
          id: 'event_type',
          type: 'select',
          label: 'Event Type',
          required: true,
          options: ['conference', 'workshop', 'webinar']
        },
        {
          id: 'interests',
          type: 'checkbox',
          label: 'Areas of Interest',
          required: false,
          multiple: true,
          options: ['Technology', 'Business', 'Education']
        }
      ]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

const testInstance = {
  id: 'instance-1',
  templateId: 'test-template',
  templateName: 'Test Form',
  data: {
    full_name: 'John Doe',
    email: 'john@example.com',
    event_type: 'conference',
    interests: ['Technology', 'Business']
  },
  progress: 100,
  completed: true,
  createdAt: new Date('2025-01-01T10:00:00Z'),
  updatedAt: new Date('2025-01-01T10:30:00Z'),
  lastSaved: new Date('2025-01-01T10:30:00Z')
};

console.log('Test Template:', JSON.stringify(testTemplate, null, 2));
console.log('\nTest Instance:', JSON.stringify(testInstance, null, 2));

// Expected CSV output:
console.log('\nExpected CSV Headers:');
console.log('id,status,progress,created_at,updated_at,last_saved,personal_information.full_name,personal_information.email_address,event_preferences.event_type,event_preferences.areas_of_interest');

console.log('\nExpected Schema Row:');
console.log('system|identifier,system|enum:Completed,In Progress,Submitted,system|number|min:0|max:100,system|datetime,system|datetime,system|datetime,text|required|pattern:^[a-zA-Z\\s\\-\\.]+$|minLength:2|maxLength:50,email|required|pattern:^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$,select|required|options:conference,workshop,webinar,checkbox|optional|multiple|options:Technology,Business,Education');

console.log('\nExpected Data Row:');
console.log('instance-1,Completed,100,2025-01-01T10:00:00.000Z,2025-01-01T10:30:00.000Z,2025-01-01T10:30:00.000Z,John Doe,john@example.com,conference,"Technology,Business"');