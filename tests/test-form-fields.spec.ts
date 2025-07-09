import { test, expect } from '@playwright/test';

test.describe('JCC2 Form Fields Debug', () => {
  test('should identify all form fields and their names', async ({ page }) => {
    test.setTimeout(30000);
    
    await page.goto('/');
    await page.waitForTimeout(3000);
    
    // Find JCC2 form
    const jcc2TemplateCard = page.locator('div.bg-white.rounded-lg.shadow-md').filter({ 
      hasText: /JCC2.*User.*Questionnaire.*V2/i 
    });
    
    await expect(jcc2TemplateCard).toBeVisible({ timeout: 15000 });
    
    // Click Start button
    const jcc2StartButton = jcc2TemplateCard.locator('button').filter({ hasText: /start/i });
    await jcc2StartButton.click();
    await page.waitForTimeout(5000);
    
    // Debug all form fields
    console.log('=== ALL FORM FIELDS DEBUG ===');
    
    // Text inputs
    const textInputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"], input[type="date"]').all();
    console.log(`\nText-based inputs (${textInputs.length}):`);
    
    for (let i = 0; i < textInputs.length; i++) {
      const input = textInputs[i];
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const required = await input.getAttribute('required');
      
      console.log(`  ${i+1}. name="${name}" id="${id}" type="${type}" placeholder="${placeholder}" required="${required}"`);
    }
    
    // Radio buttons - get unique names
    const radioButtons = await page.locator('input[type="radio"]').all();
    const radioGroups = new Set<string>();
    
    for (const radio of radioButtons) {
      const name = await radio.getAttribute('name');
      if (name) radioGroups.add(name);
    }
    
    console.log(`\nRadio button groups (${radioGroups.size}):`);
    for (const groupName of Array.from(radioGroups).slice(0, 10)) { // Show first 10
      console.log(`  - ${groupName}`);
    }
    
    // Checkboxes - get unique names
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    const checkboxGroups = new Set<string>();
    
    for (const checkbox of checkboxes) {
      const name = await checkbox.getAttribute('name');
      if (name) checkboxGroups.add(name);
    }
    
    console.log(`\nCheckbox groups (${checkboxGroups.size}):`);
    for (const groupName of Array.from(checkboxGroups).slice(0, 10)) { // Show first 10
      console.log(`  - ${groupName}`);
    }
    
    // Check progress display
    const progressText = await page.locator('text=Progress:').textContent();
    console.log(`\nProgress display: ${progressText}`);
    
    // Check submit button status
    const submitButton = page.locator('button').filter({ hasText: /submit/i });
    const isSubmitVisible = await submitButton.isVisible();
    const isSubmitEnabled = isSubmitVisible ? await submitButton.isEnabled() : false;
    
    console.log(`Submit button - Visible: ${isSubmitVisible}, Enabled: ${isSubmitEnabled}`);
    
    // Test filling specific fields we expect
    const expectedFields = ['event', 'rank_name', 'email', 'current_role_status', 'is_cyber_operator', 'echelon', 'duties'];
    
    console.log('\n=== TESTING EXPECTED FIELDS ===');
    for (const fieldName of expectedFields) {
      const field = page.locator(`input[name="${fieldName}"], textarea[name="${fieldName}"], select[name="${fieldName}"]`);
      const exists = await field.count() > 0;
      console.log(`Field "${fieldName}": ${exists ? 'EXISTS' : 'MISSING'}`);
    }
  });
});