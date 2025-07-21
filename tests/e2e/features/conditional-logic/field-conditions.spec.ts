import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Field Conditional Logic', () => {
  test.beforeEach(async ({ dashboardPage, formBuilderPage, testData }) => {
    await dashboardPage.clearLocalStorage();
    await dashboardPage.goto();
    
    // Create conditional form template
    await dashboardPage.newTemplateButton.click();
    await formBuilderPage.createBasicForm(testData.templates.conditional);
    
    // Add conditional logic to fields
    await formBuilderPage.addConditionalLogic('Additional Field 1', {
      dependsOn: 'Show Additional Fields?',
      operator: 'equals',
      values: ['Yes']
    });
    
    await formBuilderPage.addConditionalLogic('Additional Field 2', {
      dependsOn: 'Show Additional Fields?',
      operator: 'equals',
      values: ['Yes']
    });
    
    await formBuilderPage.addConditionalLogic('Category A Field', {
      dependsOn: 'Category',
      operator: 'equals',
      values: ['A']
    });
    
    await formBuilderPage.addConditionalLogic('Category B Field', {
      dependsOn: 'Category',
      operator: 'equals',
      values: ['B']
    });
    
    await formBuilderPage.addConditionalLogic('Category C Field', {
      dependsOn: 'Category',
      operator: 'equals',
      values: ['C']
    });
    
    await formBuilderPage.saveTemplate();
  });

  test('should show/hide fields based on radio selection', async ({ 
    dashboardPage, 
    formRendererPage,
    testData 
  }) => {
    // Start the form
    await dashboardPage.startForm(testData.templates.conditional.name);
    
    // Initially, conditional fields should not be visible
    await expect(formRendererPage.page.getByLabel('Additional Field 1')).not.toBeVisible();
    await expect(formRendererPage.page.getByLabel('Additional Field 2')).not.toBeVisible();
    
    // Select "Yes" to show fields
    await formRendererPage.selectRadioOption('Show Additional Fields?', 'Yes');
    
    // Fields should now be visible
    await formRendererPage.waitForConditionalField('Additional Field 1', true);
    await formRendererPage.waitForConditionalField('Additional Field 2', true);
    
    // Fill the fields
    await formRendererPage.fillField('Additional Field 1', 'Test Value 1');
    await formRendererPage.fillField('Additional Field 2', 'Test Value 2');
    
    // Select "No" to hide fields
    await formRendererPage.selectRadioOption('Show Additional Fields?', 'No');
    
    // Fields should be hidden
    await formRendererPage.waitForConditionalField('Additional Field 1', false);
    await formRendererPage.waitForConditionalField('Additional Field 2', false);
    
    // Select "Yes" again - fields should be empty (values cleared)
    await formRendererPage.selectRadioOption('Show Additional Fields?', 'Yes');
    
    const field1Value = await formRendererPage.getFieldValue('Additional Field 1');
    const field2Value = await formRendererPage.getFieldValue('Additional Field 2');
    
    expect(field1Value).toBe('');
    expect(field2Value).toBe('');
  });

  test('should show/hide fields based on select dropdown', async ({ 
    dashboardPage, 
    formRendererPage,
    testData 
  }) => {
    await dashboardPage.startForm(testData.templates.conditional.name);
    
    // Select "No" for additional fields to simplify test
    await formRendererPage.selectRadioOption('Show Additional Fields?', 'No');
    
    // Initially, all category fields should be hidden
    await expect(formRendererPage.page.getByLabel('Category A Field')).not.toBeVisible();
    await expect(formRendererPage.page.getByLabel('Category B Field')).not.toBeVisible();
    await expect(formRendererPage.page.getByLabel('Category C Field')).not.toBeVisible();
    
    // Select Category A
    await formRendererPage.selectOption('Category', 'A');
    
    // Only Category A field should be visible
    await formRendererPage.waitForConditionalField('Category A Field', true);
    await expect(formRendererPage.page.getByLabel('Category B Field')).not.toBeVisible();
    await expect(formRendererPage.page.getByLabel('Category C Field')).not.toBeVisible();
    
    // Fill Category A field
    await formRendererPage.fillField('Category A Field', 'Category A Data');
    
    // Switch to Category B
    await formRendererPage.selectOption('Category', 'B');
    
    // Only Category B field should be visible
    await formRendererPage.waitForConditionalField('Category B Field', true);
    await expect(formRendererPage.page.getByLabel('Category A Field')).not.toBeVisible();
    await expect(formRendererPage.page.getByLabel('Category C Field')).not.toBeVisible();
    
    // Verify Category A data was cleared
    await formRendererPage.selectOption('Category', 'A');
    const categoryAValue = await formRendererPage.getFieldValue('Category A Field');
    expect(categoryAValue).toBe('');
  });

  test('should validate only visible required fields', async ({ 
    dashboardPage, 
    formRendererPage,
    testData 
  }) => {
    await dashboardPage.startForm(testData.templates.conditional.name);
    
    // Try to submit with no data
    await formRendererPage.submitForm();
    
    // Should show errors for visible required fields only
    await expect(formRendererPage.page.getByText('This field is required').first()).toBeVisible();
    
    // Select "No" for additional fields
    await formRendererPage.selectRadioOption('Show Additional Fields?', 'No');
    
    // Select Category B
    await formRendererPage.selectOption('Category', 'B');
    
    // Fill only the visible required field
    await formRendererPage.fillField('Category B Field', 'Required data');
    
    // Submit should succeed (hidden required fields are ignored)
    await formRendererPage.submitForm();
    
    await formRendererPage.waitForToastMessage(/form submitted successfully/i);
  });

  test('should handle complex conditional dependencies', async ({ 
    dashboardPage, 
    formBuilderPage,
    formRendererPage 
  }) => {
    // Create a form with nested conditions
    await dashboardPage.newTemplateButton.click();
    
    await formBuilderPage.setFormName('Nested Conditional Form');
    await formBuilderPage.addSection('Complex Logic');
    
    // Level 1: Main trigger
    await formBuilderPage.addFieldToSection('Complex Logic', 'radio');
    await formBuilderPage.configureField('Radio Field', {
      label: 'Enable Advanced Options?',
      options: ['Yes', 'No'],
      required: true
    });
    
    // Level 2: Secondary trigger (depends on Level 1)
    await formBuilderPage.addFieldToSection('Complex Logic', 'select');
    await formBuilderPage.configureField('Select Field', {
      label: 'Advanced Type',
      options: ['Type A', 'Type B', 'Type C'],
      required: true
    });
    
    await formBuilderPage.addConditionalLogic('Advanced Type', {
      dependsOn: 'Enable Advanced Options?',
      operator: 'equals',
      values: ['Yes']
    });
    
    // Level 3: Final fields (depend on Level 2)
    await formBuilderPage.addFieldToSection('Complex Logic', 'textarea');
    await formBuilderPage.configureField('Textarea Field', {
      label: 'Type A Details',
      required: true
    });
    
    await formBuilderPage.addConditionalLogic('Type A Details', {
      dependsOn: 'Advanced Type',
      operator: 'equals',
      values: ['Type A']
    });
    
    await formBuilderPage.saveTemplate();
    
    // Test the form
    await dashboardPage.startForm('Nested Conditional Form');
    
    // Initially only Level 1 is visible
    await expect(formRendererPage.page.getByLabel('Enable Advanced Options?')).toBeVisible();
    await expect(formRendererPage.page.getByLabel('Advanced Type')).not.toBeVisible();
    await expect(formRendererPage.page.getByLabel('Type A Details')).not.toBeVisible();
    
    // Enable Level 2
    await formRendererPage.selectRadioOption('Enable Advanced Options?', 'Yes');
    await formRendererPage.waitForConditionalField('Advanced Type', true);
    await expect(formRendererPage.page.getByLabel('Type A Details')).not.toBeVisible();
    
    // Enable Level 3
    await formRendererPage.selectOption('Advanced Type', 'Type A');
    await formRendererPage.waitForConditionalField('Type A Details', true);
    
    // Fill and submit
    await formRendererPage.fillField('Type A Details', 'Nested conditional test data');
    await formRendererPage.submitForm();
    
    await formRendererPage.waitForToastMessage(/form submitted successfully/i);
  });

  test('should persist conditional state during auto-save', async ({ 
    dashboardPage, 
    formRendererPage,
    testData 
  }) => {
    await dashboardPage.startForm(testData.templates.conditional.name);
    
    // Set up conditional fields
    await formRendererPage.selectRadioOption('Show Additional Fields?', 'Yes');
    await formRendererPage.fillField('Additional Field 1', 'Auto-save test');
    
    // Wait for auto-save
    await formRendererPage.waitForAutoSave();
    
    // Refresh the page
    await formRendererPage.page.reload();
    
    // Conditional field should still be visible and have value
    await formRendererPage.waitForConditionalField('Additional Field 1', true);
    const fieldValue = await formRendererPage.getFieldValue('Additional Field 1');
    expect(fieldValue).toBe('Auto-save test');
  });

  test('should handle conditional logic with not_equals operator', async ({ 
    dashboardPage, 
    formBuilderPage,
    formRendererPage 
  }) => {
    // Create form with not_equals condition
    await dashboardPage.newTemplateButton.click();
    
    await formBuilderPage.setFormName('Not Equals Conditional');
    await formBuilderPage.addSection('Main');
    
    await formBuilderPage.addFieldToSection('Main', 'select');
    await formBuilderPage.configureField('Select Field', {
      label: 'Status',
      options: ['Active', 'Inactive', 'Pending'],
      required: true
    });
    
    await formBuilderPage.addFieldToSection('Main', 'text');
    await formBuilderPage.configureField('Text Field', {
      label: 'Reason',
      required: true
    });
    
    // Show reason field when status is NOT active
    await formBuilderPage.addConditionalLogic('Reason', {
      dependsOn: 'Status',
      operator: 'not_equals',
      values: ['Active']
    });
    
    await formBuilderPage.saveTemplate();
    
    // Test the form
    await dashboardPage.startForm('Not Equals Conditional');
    
    // Select Active - reason should be hidden
    await formRendererPage.selectOption('Status', 'Active');
    await expect(formRendererPage.page.getByLabel('Reason')).not.toBeVisible();
    
    // Select Inactive - reason should be visible
    await formRendererPage.selectOption('Status', 'Inactive');
    await formRendererPage.waitForConditionalField('Reason', true);
    
    // Select Pending - reason should still be visible
    await formRendererPage.selectOption('Status', 'Pending');
    await expect(formRendererPage.page.getByLabel('Reason')).toBeVisible();
  });
});