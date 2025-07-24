import { FormTemplate } from '../types/form';

export const testDuplicateFieldIdsTemplate: FormTemplate = {
  id: 'test-duplicate-field-ids',
  name: 'Test Duplicate Field IDs',
  description: 'A test template to verify that fields with the same ID in different sections maintain separate state',
  category: 'Testing',
  version: '1.0.0',
  sections: [
    {
      id: 'personal_info',
      title: 'Personal Information',
      description: 'Basic personal details',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'your.email@example.com'
        },
        {
          id: 'notes',
          type: 'textarea',
          label: 'Personal Notes',
          required: false,
          placeholder: 'Any personal notes or comments'
        }
      ]
    },
    {
      id: 'work_info',
      title: 'Work Information',
      description: 'Employment and work details',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Company Name',
          required: true,
          placeholder: 'Enter your company name'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Work Email',
          required: true,
          placeholder: 'your.work@company.com'
        },
        {
          id: 'role',
          type: 'text',
          label: 'Job Title',
          required: false,
          placeholder: 'Your current position'
        },
        {
          id: 'notes',
          type: 'textarea',
          label: 'Work Notes',
          required: false,
          placeholder: 'Any work-related notes'
        }
      ]
    },
    {
      id: 'emergency_contact',
      title: 'Emergency Contact',
      description: 'Emergency contact information',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Contact Name',
          required: true,
          placeholder: 'Emergency contact full name'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Contact Email',
          required: false,
          placeholder: 'emergency.contact@example.com'
        },
        {
          id: 'phone',
          type: 'tel',
          label: 'Contact Phone',
          required: true,
          placeholder: '+1 (555) 123-4567'
        },
        {
          id: 'notes',
          type: 'textarea',
          label: 'Relationship & Notes',
          required: false,
          placeholder: 'Relationship to you and any important notes'
        }
      ]
    }
  ]
};