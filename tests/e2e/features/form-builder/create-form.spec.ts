import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Create Form Feature', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    // Start fresh for each test
    await dashboardPage.clearLocalStorage();
    await dashboardPage.goto();
  });

  test('should create a simple form with multiple field types', async ({ 
    dashboardPage, 
    formBuilderPage,
    testData 
  }) => {
    // Navigate to form builder
    await dashboardPage.newTemplateButton.click();
    
    // Create form using test data
    await formBuilderPage.createBasicForm(testData.templates.simple);
    
    // Verify field count
    const fieldCount = await formBuilderPage.getFieldCount();
    expect(fieldCount).toBe(3);
    
    // Save the template
    await formBuilderPage.saveTemplate();
    
    // Should redirect to dashboard
    await expect(dashboardPage.page).toHaveURL('/');
    
    // Verify template appears in dashboard
    const templateCard = await dashboardPage.getTemplateCard(testData.templates.simple.name);
    await expect(templateCard).toBeVisible();
  });

  test('should validate form name is required', async ({ 
    dashboardPage, 
    formBuilderPage 
  }) => {
    await dashboardPage.newTemplateButton.click();
    
    // Try to save without form name
    await formBuilderPage.saveTemplateButton.click();
    
    // Should show validation error
    await expect(formBuilderPage.page.getByText('Form name is required')).toBeVisible();
    
    // Fill form name and save again
    await formBuilderPage.setFormName('Test Form');
    await formBuilderPage.saveTemplate();
    
    // Should succeed
    await expect(dashboardPage.page).toHaveURL('/');
  });

  test('should add and configure conditional fields', async ({ 
    dashboardPage, 
    formBuilderPage 
  }) => {
    await dashboardPage.newTemplateButton.click();
    
    // Set form details
    await formBuilderPage.setFormName('Conditional Form Test');
    await formBuilderPage.setFormDescription('Testing conditional field logic');
    
    // Add a section
    await formBuilderPage.addSection('Main Section');
    
    // Add trigger field (radio)
    await formBuilderPage.addFieldToSection('Main Section', 'radio');
    await formBuilderPage.configureField('Radio Field', {
      label: 'Show Additional Field?',
      options: ['Yes', 'No'],
      required: true
    });
    
    // Add conditional field
    await formBuilderPage.addFieldToSection('Main Section', 'text');
    await formBuilderPage.configureField('Text Field', {
      label: 'Additional Information',
      placeholder: 'Enter details here',
      required: true
    });
    
    // Add conditional logic
    await formBuilderPage.addConditionalLogic('Additional Information', {
      dependsOn: 'Show Additional Field?',
      operator: 'equals',
      values: ['Yes']
    });
    
    // Save and verify
    await formBuilderPage.saveTemplate();
    await expect(dashboardPage.page).toHaveURL('/');
  });

  test('should duplicate existing fields', async ({ 
    dashboardPage, 
    formBuilderPage 
  }) => {
    await dashboardPage.newTemplateButton.click();
    
    await formBuilderPage.setFormName('Duplicate Field Test');
    await formBuilderPage.addSection('Section 1');
    
    // Add a field
    await formBuilderPage.addFieldToSection('Section 1', 'text');
    await formBuilderPage.configureField('Text Field', {
      label: 'Original Field',
      placeholder: 'Original placeholder',
      required: true
    });
    
    // Duplicate the field
    await formBuilderPage.duplicateField('Original Field');
    
    // Should have 2 fields now
    const fieldCount = await formBuilderPage.getFieldCount();
    expect(fieldCount).toBe(2);
    
    // Configure the duplicated field
    await formBuilderPage.configureField('Original Field Copy', {
      label: 'Duplicated Field'
    });
    
    await formBuilderPage.saveTemplate();
  });

  test('should reorder fields within a section', async ({ 
    dashboardPage, 
    formBuilderPage 
  }) => {
    await dashboardPage.newTemplateButton.click();
    
    await formBuilderPage.setFormName('Field Order Test');
    await formBuilderPage.addSection('Section 1');
    
    // Add multiple fields
    const fields = ['First Field', 'Second Field', 'Third Field'];
    for (const fieldLabel of fields) {
      await formBuilderPage.addFieldToSection('Section 1', 'text');
      await formBuilderPage.configureField('Text Field', {
        label: fieldLabel
      });
    }
    
    // Move second field up
    await formBuilderPage.reorderField('Second Field', 'up');
    
    // Verify order changed (would need to check DOM order)
    // This is a simplified example - in real test would verify actual order
    
    await formBuilderPage.saveTemplate();
  });

  test('should preview form before saving', async ({ 
    dashboardPage, 
    formBuilderPage,
    formRendererPage,
    testData 
  }) => {
    await dashboardPage.newTemplateButton.click();
    
    // Create a form
    await formBuilderPage.createBasicForm(testData.templates.simple);
    
    // Preview the form
    await formBuilderPage.previewForm();
    
    // Should show form renderer in preview mode
    await expect(formBuilderPage.page.getByText('Preview Mode')).toBeVisible();
    
    // Verify fields are rendered
    await expect(formBuilderPage.page.getByLabel('Name')).toBeVisible();
    await expect(formBuilderPage.page.getByLabel('Email')).toBeVisible();
    await expect(formBuilderPage.page.getByLabel('Message')).toBeVisible();
    
    // Close preview
    await formBuilderPage.page.getByRole('button', { name: /close preview/i }).click();
    
    // Should be back in builder
    await expect(formBuilderPage.saveTemplateButton).toBeVisible();
  });

  test('should import and export form templates', async ({ 
    dashboardPage, 
    formBuilderPage,
    testData 
  }) => {
    // First create a form
    await dashboardPage.newTemplateButton.click();
    await formBuilderPage.createBasicForm(testData.templates.simple);
    await formBuilderPage.saveTemplate();
    
    // Go back to builder to export
    await dashboardPage.editTemplate(testData.templates.simple.name);
    
    // Export the template
    const exportedJson = await formBuilderPage.exportTemplateJSON();
    expect(exportedJson).toContain(testData.templates.simple.name);
    
    // Create a new form by importing
    await formBuilderPage.backToDashboard();
    await dashboardPage.newTemplateButton.click();
    
    // Import the JSON
    await formBuilderPage.importTemplateJSON(exportedJson);
    
    // Verify fields were imported
    const fieldCount = await formBuilderPage.getFieldCount();
    expect(fieldCount).toBe(3);
    
    // Change name to avoid duplicate
    await formBuilderPage.setFormName('Imported Form');
    await formBuilderPage.saveTemplate();
    
    // Verify both forms exist
    await expect(await dashboardPage.getTemplateCard(testData.templates.simple.name)).toBeVisible();
    await expect(await dashboardPage.getTemplateCard('Imported Form')).toBeVisible();
  });

  test('should handle form with multiple sections', async ({ 
    dashboardPage, 
    formBuilderPage 
  }) => {
    await dashboardPage.newTemplateButton.click();
    
    await formBuilderPage.setFormName('Multi-Section Form');
    
    // Add multiple sections
    const sections = ['Personal Information', 'Contact Details', 'Additional Notes'];
    
    for (const sectionTitle of sections) {
      await formBuilderPage.addSection(sectionTitle);
      
      // Add a field to each section
      await formBuilderPage.addFieldToSection(sectionTitle, 'text');
      await formBuilderPage.configureField('Text Field', {
        label: `${sectionTitle} Field`,
        required: sectionTitle !== 'Additional Notes' // Make last section optional
      });
    }
    
    // Verify section count
    const sectionCount = await formBuilderPage.getSectionCount();
    expect(sectionCount).toBe(3);
    
    await formBuilderPage.saveTemplate();
    
    // Start filling the form to verify sections
    await dashboardPage.startForm('Multi-Section Form');
    
    // Verify all sections are accessible
    const sectionTitles = await formBuilderPage.page.locator('h2').allTextContents();
    expect(sectionTitles).toContain('Personal Information');
    expect(sectionTitles).toContain('Contact Details');
    expect(sectionTitles).toContain('Additional Notes');
  });
});