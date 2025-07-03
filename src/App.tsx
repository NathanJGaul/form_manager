import React, { useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { storageManager } from './utils/storage';
import { FormTemplate } from './types/form';

// Sample templates for demonstration
const sampleTemplates: FormTemplate[] = [
  {
    id: 'sample-contact',
    name: 'Contact Information Form',
    description: 'Basic contact information collection form',
    sections: [
      {
        id: 'personal-info',
        title: 'Personal Information',
        fields: [
          {
            id: 'firstName',
            type: 'text',
            label: 'First Name',
            placeholder: 'Enter your first name',
            required: true
          },
          {
            id: 'lastName',
            type: 'text',
            label: 'Last Name',
            placeholder: 'Enter your last name',
            required: true
          },
          {
            id: 'email',
            type: 'text',
            label: 'Email Address',
            placeholder: 'Enter your email',
            required: true,
            validation: {
              pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$'
            }
          },
          {
            id: 'phone',
            type: 'text',
            label: 'Phone Number',
            placeholder: 'Enter your phone number',
            required: false
          }
        ]
      },
      {
        id: 'preferences',
        title: 'Contact Preferences',
        fields: [
          {
            id: 'contactMethod',
            type: 'radio',
            label: 'Preferred Contact Method',
            required: true,
            options: ['Email', 'Phone', 'SMS']
          },
          {
            id: 'newsletter',
            type: 'checkbox',
            label: 'Subscriptions',
            required: false,
            options: ['Newsletter', 'Product Updates', 'Event Notifications']
          },
          {
            id: 'comments',
            type: 'textarea',
            label: 'Additional Comments',
            placeholder: 'Any additional information...',
            required: false,
            conditional: {
              dependsOn: 'contactMethod',
              values: ['Email'],
              operator: 'equals'
            }
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'sample-survey',
    name: 'Customer Satisfaction Survey',
    description: 'Survey to collect customer feedback and satisfaction ratings',
    sections: [
      {
        id: 'basic-info',
        title: 'Basic Information',
        fields: [
          {
            id: 'customerType',
            type: 'select',
            label: 'Customer Type',
            required: true,
            options: ['New Customer', 'Returning Customer', 'Enterprise Client']
          },
          {
            id: 'purchaseDate',
            type: 'date',
            label: 'Purchase Date',
            required: true
          }
        ]
      },
      {
        id: 'satisfaction',
        title: 'Satisfaction Rating',
        fields: [
          {
            id: 'overallSatisfaction',
            type: 'radio',
            label: 'Overall Satisfaction',
            required: true,
            options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied']
          },
          {
            id: 'rating',
            type: 'number',
            label: 'Rating (1-10)',
            required: true,
            validation: {
              min: 1,
              max: 10
            }
          },
          {
            id: 'wouldRecommend',
            type: 'radio',
            label: 'Would you recommend us to others?',
            required: true,
            options: ['Yes', 'No', 'Maybe']
          }
        ]
      },
      {
        id: 'feedback',
        title: 'Additional Feedback',
        fields: [
          {
            id: 'improvements',
            type: 'textarea',
            label: 'What could we improve?',
            placeholder: 'Your suggestions...',
            required: false,
            conditional: {
              dependsOn: 'overallSatisfaction',
              values: ['Neutral', 'Dissatisfied', 'Very Dissatisfied'],
              operator: 'equals'
            }
          },
          {
            id: 'testimonial',
            type: 'textarea',
            label: 'Share a testimonial',
            placeholder: 'What did you love about our service?',
            required: false,
            conditional: {
              dependsOn: 'overallSatisfaction',
              values: ['Very Satisfied', 'Satisfied'],
              operator: 'equals'
            }
          }
        ]
      }
    ],
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

function App() {
  useEffect(() => {
    // Initialize with sample templates if none exist
    const existingTemplates = storageManager.getTemplates();
    if (existingTemplates.length === 0) {
      sampleTemplates.forEach(template => {
        storageManager.saveTemplate(template);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
    </div>
  );
}

export default App;