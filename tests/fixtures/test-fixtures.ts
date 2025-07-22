import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { FormBuilderPage } from '../pages/FormBuilderPage';
import { FormRendererPage } from '../pages/FormRendererPage';

// Define custom fixtures
type MyFixtures = {
  dashboardPage: DashboardPage;
  formBuilderPage: FormBuilderPage;
  formRendererPage: FormRendererPage;
  testData: {
    templates: typeof templates;
    formData: typeof formData;
  };
};

// Test data
const templates = {
  simple: {
    name: 'Simple Contact Form',
    description: 'A basic contact form for testing',
    sections: [{
      title: 'Contact Information',
      fields: [
        { type: 'text', label: 'Name', required: true },
        { type: 'email', label: 'Email', required: true },
        { type: 'textarea', label: 'Message', required: false }
      ]
    }]
  },
  
  complex: {
    name: 'Employee Onboarding Form',
    description: 'Comprehensive form with multiple sections and conditional logic',
    sections: [
      {
        title: 'Personal Information',
        fields: [
          { type: 'text', label: 'First Name', required: true },
          { type: 'text', label: 'Last Name', required: true },
          { type: 'date', label: 'Date of Birth', required: true },
          { type: 'email', label: 'Email Address', required: true },
          { type: 'tel', label: 'Phone Number', required: true }
        ]
      },
      {
        title: 'Employment Details',
        fields: [
          { type: 'select', label: 'Department', required: true, options: ['Engineering', 'Sales', 'Marketing', 'HR'] },
          { type: 'text', label: 'Job Title', required: true },
          { type: 'date', label: 'Start Date', required: true },
          { type: 'radio', label: 'Employment Type', required: true, options: ['Full-time', 'Part-time', 'Contract'] }
        ]
      },
      {
        title: 'Additional Information',
        fields: [
          { type: 'radio', label: 'Do you have any disabilities?', required: true, options: ['Yes', 'No'] },
          { type: 'textarea', label: 'Disability Details', required: false }, // Conditional on above
          { type: 'checkbox', label: 'I agree to the terms and conditions', required: true }
        ]
      }
    ]
  },
  
  conditional: {
    name: 'Conditional Logic Test Form',
    description: 'Form to test various conditional logic scenarios',
    sections: [{
      title: 'Conditional Fields',
      fields: [
        { type: 'radio', label: 'Show Additional Fields?', required: true, options: ['Yes', 'No'] },
        { type: 'text', label: 'Additional Field 1', required: true }, // Shows when Yes
        { type: 'text', label: 'Additional Field 2', required: false }, // Shows when Yes
        { type: 'select', label: 'Category', required: true, options: ['A', 'B', 'C'] },
        { type: 'text', label: 'Category A Field', required: true }, // Shows when Category = A
        { type: 'text', label: 'Category B Field', required: true }, // Shows when Category = B
        { type: 'text', label: 'Category C Field', required: true }  // Shows when Category = C
      ]
    }]
  }
};

const formData = {
  simple: {
    'Name': 'John Doe',
    'Email': 'john.doe@example.com',
    'Message': 'This is a test message for the E2E test suite.'
  },
  
  employee: {
    'First Name': 'Jane',
    'Last Name': 'Smith',
    'Date of Birth': '1990-05-15',
    'Email Address': 'jane.smith@company.com',
    'Phone Number': '555-123-4567',
    'Department': 'Engineering',
    'Job Title': 'Senior Software Engineer',
    'Start Date': '2024-02-01',
    'Employment Type': 'Full-time',
    'Do you have any disabilities?': 'No',
    'I agree to the terms and conditions': true
  },
  
  conditional: {
    showAdditional: {
      'Show Additional Fields?': 'Yes',
      'Additional Field 1': 'Value 1',
      'Additional Field 2': 'Value 2',
      'Category': 'A',
      'Category A Field': 'Category A Value'
    },
    hideAdditional: {
      'Show Additional Fields?': 'No',
      'Category': 'B',
      'Category B Field': 'Category B Value'
    }
  }
};

// Extend base test with fixtures
export const test = base.extend<MyFixtures>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
  
  formBuilderPage: async ({ page }, use) => {
    const formBuilderPage = new FormBuilderPage(page);
    await use(formBuilderPage);
  },
  
  formRendererPage: async ({ page }, use) => {
    const formRendererPage = new FormRendererPage(page);
    await use(formRendererPage);
  },
  
  testData: async ({}, use) => {
    await use({ templates, formData });
  },
});

export { expect } from '@playwright/test';

// Helper to create a form template using the builder
export async function createFormTemplate(
  formBuilderPage: FormBuilderPage,
  template: typeof templates.simple
) {
  await formBuilderPage.goto();
  await formBuilderPage.createBasicForm(template);
  await formBuilderPage.saveTemplate();
}

// Helper to set up test data
export async function setupTestData(page: any) {
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());
  
  // Add some default templates if needed
  await page.evaluate((templates) => {
    const defaultTemplates = [
      {
        id: 'jcc2-template',
        name: 'JCC2 User Questionnaire V2',
        description: 'Joint Cyber Command questionnaire for user information',
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    localStorage.setItem('form_templates', JSON.stringify(defaultTemplates));
  }, templates);
}

// Helper to clean up after tests
export async function cleanupTestData(page: any) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}