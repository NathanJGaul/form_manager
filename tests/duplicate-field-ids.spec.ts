import { test, expect } from '@playwright/test';
import { testDuplicateFieldIdsTemplate } from '../src/templates/test-duplicate-field-ids';

test.describe('Duplicate Field IDs in Different Sections', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should maintain separate state for fields with same ID in different sections', async ({ page }) => {
    // Import the test template
    await page.click('button:has-text("Import Template")');
    
    // Click on programmatic import tab
    await page.click('button:has-text("Programmatic Import")');
    
    // Enter the template code
    const templateCode = `export const template = ${JSON.stringify(testDuplicateFieldIdsTemplate, null, 2)};`;
    await page.fill('textarea', templateCode);
    
    // Import the template
    await page.click('button:has-text("Import")');
    await page.waitForSelector('text=Template imported successfully!');
    
    // Close the modal
    await page.keyboard.press('Escape');
    
    // Start a new form with the imported template
    await page.click(`text=${testDuplicateFieldIdsTemplate.name}`);
    await page.click('button:has-text("Start New Form")');
    
    // Wait for form to load
    await page.waitForSelector('text=Personal Information');
    
    // Fill in the "name" field in Personal Information section
    const personalNameField = await page.locator('input[name="name"]').first();
    await personalNameField.fill('John Doe');
    
    // Fill in the "email" field in Personal Information section
    const personalEmailField = await page.locator('input[name="email"]').first();
    await personalEmailField.fill('john.doe@personal.com');
    
    // Fill in the "notes" field in Personal Information section
    const personalNotesField = await page.locator('textarea[name="notes"]').first();
    await personalNotesField.fill('Personal notes about John');
    
    // Navigate to Work Information section
    await page.click('text=Work Information');
    await page.waitForSelector('text=Employment and work details');
    
    // Fill in the "name" field in Work Information section (Company Name)
    const workNameField = await page.locator('input[name="name"]').nth(1);
    await workNameField.fill('Acme Corporation');
    
    // Fill in the "email" field in Work Information section
    const workEmailField = await page.locator('input[name="email"]').nth(1);
    await workEmailField.fill('john.doe@acme.com');
    
    // Fill in the "notes" field in Work Information section
    const workNotesField = await page.locator('textarea[name="notes"]').nth(1);
    await workNotesField.fill('Work notes about position');
    
    // Navigate to Emergency Contact section
    await page.click('text=Emergency Contact');
    await page.waitForSelector('text=Emergency contact information');
    
    // Fill in the "name" field in Emergency Contact section
    const emergencyNameField = await page.locator('input[name="name"]').nth(2);
    await emergencyNameField.fill('Jane Doe');
    
    // Fill in the "email" field in Emergency Contact section
    const emergencyEmailField = await page.locator('input[name="email"]').nth(2);
    await emergencyEmailField.fill('jane.doe@emergency.com');
    
    // Fill in the "notes" field in Emergency Contact section
    const emergencyNotesField = await page.locator('textarea[name="notes"]').nth(2);
    await emergencyNotesField.fill('Spouse - primary contact');
    
    // Navigate back to Personal Information to verify values are preserved
    await page.click('text=Personal Information');
    await page.waitForSelector('text=Basic personal details');
    
    // Verify Personal Information values are preserved
    await expect(await page.locator('input[name="name"]').first()).toHaveValue('John Doe');
    await expect(await page.locator('input[name="email"]').first()).toHaveValue('john.doe@personal.com');
    await expect(await page.locator('textarea[name="notes"]').first()).toHaveValue('Personal notes about John');
    
    // Navigate to Work Information to verify values
    await page.click('text=Work Information');
    await page.waitForSelector('text=Employment and work details');
    
    // Verify Work Information values are preserved
    await expect(await page.locator('input[name="name"]').nth(1)).toHaveValue('Acme Corporation');
    await expect(await page.locator('input[name="email"]').nth(1)).toHaveValue('john.doe@acme.com');
    await expect(await page.locator('textarea[name="notes"]').nth(1)).toHaveValue('Work notes about position');
    
    // Navigate to Emergency Contact to verify values
    await page.click('text=Emergency Contact');
    await page.waitForSelector('text=Emergency contact information');
    
    // Verify Emergency Contact values are preserved
    await expect(await page.locator('input[name="name"]').nth(2)).toHaveValue('Jane Doe');
    await expect(await page.locator('input[name="email"]').nth(2)).toHaveValue('jane.doe@emergency.com');
    await expect(await page.locator('textarea[name="notes"]').nth(2)).toHaveValue('Spouse - primary contact');
    
    // Save the form
    await page.click('button:has-text("Save Draft")');
    await page.waitForSelector('text=Form saved successfully!');
    
    // Go back to dashboard
    await page.click('button:has-text("Exit")');
    await page.waitForSelector('text=Form Dashboard');
    
    // Resume the saved form
    await page.click('button:has-text("Resume")');
    await page.waitForSelector('text=Personal Information');
    
    // Verify all values are still properly isolated after save/reload
    await expect(await page.locator('input[name="name"]').first()).toHaveValue('John Doe');
    await expect(await page.locator('input[name="email"]').first()).toHaveValue('john.doe@personal.com');
    
    await page.click('text=Work Information');
    await expect(await page.locator('input[name="name"]').nth(1)).toHaveValue('Acme Corporation');
    await expect(await page.locator('input[name="email"]').nth(1)).toHaveValue('john.doe@acme.com');
    
    await page.click('text=Emergency Contact');
    await expect(await page.locator('input[name="name"]').nth(2)).toHaveValue('Jane Doe');
    await expect(await page.locator('input[name="email"]').nth(2)).toHaveValue('jane.doe@emergency.com');
  });

  test('should handle conditional logic with duplicate field IDs correctly', async ({ page }) => {
    // Create a template with conditional logic and duplicate field IDs
    const conditionalTemplate = {
      ...testDuplicateFieldIdsTemplate,
      id: 'test-conditional-duplicate-ids',
      name: 'Test Conditional Duplicate IDs',
      sections: [
        {
          id: 'section1',
          title: 'Section 1',
          fields: [
            {
              id: 'trigger',
              type: 'select',
              label: 'Show dependent field?',
              required: true,
              options: ['Yes', 'No']
            },
            {
              id: 'dependent',
              type: 'text',
              label: 'Dependent Field (Section 1)',
              required: false,
              conditional: {
                dependsOn: 'trigger',
                values: ['Yes'],
                operator: 'equals' as const
              }
            }
          ]
        },
        {
          id: 'section2',
          title: 'Section 2',
          fields: [
            {
              id: 'trigger',
              type: 'select',
              label: 'Enable input?',
              required: true,
              options: ['Enable', 'Disable']
            },
            {
              id: 'dependent',
              type: 'text',
              label: 'Dependent Field (Section 2)',
              required: false,
              conditional: {
                dependsOn: 'section2.trigger',
                values: ['Enable'],
                operator: 'equals' as const
              }
            }
          ]
        }
      ]
    };

    // Import the conditional template
    await page.click('button:has-text("Import Template")');
    await page.click('button:has-text("Programmatic Import")');
    
    const templateCode = `export const template = ${JSON.stringify(conditionalTemplate, null, 2)};`;
    await page.fill('textarea', templateCode);
    await page.click('button:has-text("Import")');
    await page.waitForSelector('text=Template imported successfully!');
    await page.keyboard.press('Escape');
    
    // Start a new form
    await page.click(`text=${conditionalTemplate.name}`);
    await page.click('button:has-text("Start New Form")');
    
    // Test Section 1 conditional logic
    await page.waitForSelector('text=Section 1');
    
    // Initially, dependent field should not be visible
    await expect(page.locator('text=Dependent Field (Section 1)')).not.toBeVisible();
    
    // Select "Yes" to show dependent field
    await page.selectOption('select[name="trigger"]', 'Yes');
    await expect(page.locator('text=Dependent Field (Section 1)')).toBeVisible();
    
    // Fill in the dependent field
    await page.fill('input[name="dependent"]', 'Section 1 dependent value');
    
    // Navigate to Section 2
    await page.click('text=Section 2');
    await page.waitForSelector('text=Enable input?');
    
    // Initially, Section 2 dependent field should not be visible
    await expect(page.locator('text=Dependent Field (Section 2)')).not.toBeVisible();
    
    // Select "Enable" to show dependent field
    await page.selectOption('select[name="trigger"]', { index: 1 });
    await page.selectOption('select[name="trigger"]:nth(1)', 'Enable');
    await expect(page.locator('text=Dependent Field (Section 2)')).toBeVisible();
    
    // Fill in the dependent field
    await page.locator('input[name="dependent"]:nth(1)').fill('Section 2 dependent value');
    
    // Navigate back to Section 1 to verify independence
    await page.click('text=Section 1');
    
    // Verify Section 1 values are preserved
    await expect(page.selectOption('select[name="trigger"]:first')).resolves.toContain('Yes');
    await expect(page.locator('input[name="dependent"]:first')).toHaveValue('Section 1 dependent value');
    
    // Change Section 1 trigger to "No"
    await page.selectOption('select[name="trigger"]:first', 'No');
    await expect(page.locator('text=Dependent Field (Section 1)')).not.toBeVisible();
    
    // Navigate to Section 2 to verify it's unaffected
    await page.click('text=Section 2');
    await expect(page.locator('text=Dependent Field (Section 2)')).toBeVisible();
    await expect(page.locator('input[name="dependent"]:nth(1)')).toHaveValue('Section 2 dependent value');
  });
});