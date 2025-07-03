import { test, expect } from '@playwright/test';

test.describe('Form Instance Overwrite Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a test template
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Overwrite Test Form');
    await page.click('text=Add Section');
    await page.click('text=Add Field');
    // Clear default field name and enter test field name
    await page.fill('input[value="New Field"]', 'Test Field');
    await page.click('text=Save Template');
    
    // Return to dashboard
    await page.click('text=Back');
  });

  test('should reuse existing draft when starting form again', async ({ page }) => {
    // Start filling the form for the first time
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'First Draft Value');
    
    // Wait for auto-save
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Saved')).toBeVisible();
    
    // Go back to dashboard
    await page.click('text=Dashboard');
    
    // Start the same form again - should load existing draft
    await page.click('text=Start');
    
    // Should show the previously entered value
    await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('First Draft Value');
  });

  test('should overwrite draft progress when editing', async ({ page }) => {
    // Start and partially fill the form
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'Initial Value');
    
    // Wait for auto-save
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Saved')).toBeVisible();
    
    // Check initial progress
    const initialProgress = await page.locator('text=Progress:').textContent();
    
    // Modify the field
    await page.fill('input[placeholder="Enter Test Field"]', 'Updated Value');
    
    // Wait for auto-save
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Saved')).toBeVisible();
    
    // Verify the value was updated (not duplicated)
    await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('Updated Value');
    
    // Go back to dashboard and verify only one instance exists
    await page.click('text=Dashboard');
    
    // Should see only one instance of this form
    const formInstanceCount = await page.locator('text=Overwrite Test Form').count();
    expect(formInstanceCount).toBe(1);
  });

  test('should maintain single instance through multiple edits', async ({ page }) => {
    // Start form
    await page.click('text=Start');
    
    // Make multiple edits
    for (let i = 1; i <= 3; i++) {
      await page.fill('input[placeholder="Enter Test Field"]', `Value ${i}`);
      await page.waitForTimeout(1500); // Wait for auto-save
      await expect(page.locator('text=Saved')).toBeVisible();
    }
    
    // Go back to dashboard
    await page.click('text=Dashboard');
    
    // Should still see only one instance
    const formInstanceRows = await page.locator('tbody tr').count();
    expect(formInstanceRows).toBe(1);
    
    // Verify the latest value is preserved
    await page.click('text=Edit'); // Edit the instance
    await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('Value 3');
  });

  test('should convert draft to completed instance on submission', async ({ page }) => {
    // Start and fill the form
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'Submission Value');
    
    // Wait for auto-save
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Saved')).toBeVisible();
    
    // Check that it's initially in progress
    await page.click('text=Dashboard');
    await expect(page.locator('text=In Progress')).toBeVisible();
    
    // Go back and submit the form
    await page.click('text=Edit');
    await page.click('text=Submit Form');
    await expect(page.locator('text=Form submitted successfully!')).toBeVisible();
    
    // Go to dashboard and verify status changed
    await page.click('text=Dashboard');
    await expect(page.locator('text=Completed')).toBeVisible();
    
    // Should still be only one instance, but now completed
    const formInstanceRows = await page.locator('tbody tr').count();
    expect(formInstanceRows).toBe(1);
  });

  test('should create new draft after submitting previous one', async ({ page }) => {
    // Fill and submit first instance
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'First Submission');
    await page.click('text=Submit Form');
    await expect(page.locator('text=Form submitted successfully!')).toBeVisible();
    
    // Go back to dashboard
    await page.click('text=Dashboard');
    
    // Start a new instance (should create new draft since previous was completed)
    await page.click('text=Start');
    
    // Should be empty (new instance)
    await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('');
    
    // Fill with different value
    await page.fill('input[placeholder="Enter Test Field"]', 'Second Draft');
    await page.waitForTimeout(1500);
    
    // Go back to dashboard
    await page.click('text=Dashboard');
    
    // Should now have two instances: one completed, one in progress
    const formInstanceRows = await page.locator('tbody tr').count();
    expect(formInstanceRows).toBe(2);
    
    // Verify one is completed and one is in progress
    await expect(page.locator('text=Completed')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
  });

  test('should handle localStorage persistence across page reloads', async ({ page }) => {
    // Start form and add data
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'Persistent Value');
    await page.waitForTimeout(1500);
    
    // Reload the page
    await page.reload();
    
    // Navigate back to the form
    await page.click('text=Start');
    
    // Should preserve the draft data
    await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('Persistent Value');
  });

  test('should prevent duplicate instances for same template', async ({ page }) => {
    // Start form multiple times rapidly
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'Rapid Test');
    await page.click('text=Dashboard');
    
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'Rapid Test Updated');
    await page.click('text=Dashboard');
    
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'Final Value');
    await page.waitForTimeout(1500);
    await page.click('text=Dashboard');
    
    // Should still have only one instance
    const formInstanceRows = await page.locator('tbody tr').count();
    expect(formInstanceRows).toBe(1);
    
    // Verify the final value is preserved
    await page.click('text=Edit');
    await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('Final Value');
  });

  test('should handle concurrent form editing correctly', async ({ page }) => {
    // Start form
    await page.click('text=Start');
    await page.fill('input[placeholder="Enter Test Field"]', 'Concurrent Test');
    
    // Simulate rapid changes
    for (let i = 1; i <= 5; i++) {
      await page.fill('input[placeholder="Enter Test Field"]', `Rapid Change ${i}`);
      await page.waitForTimeout(200); // Fast changes
    }
    
    // Wait for final auto-save
    await page.waitForTimeout(1500);
    await expect(page.locator('text=Saved')).toBeVisible();
    
    // Verify final state
    await expect(page.locator('input[placeholder="Enter Test Field"]')).toHaveValue('Rapid Change 5');
    
    // Verify only one instance exists
    await page.click('text=Dashboard');
    const formInstanceRows = await page.locator('tbody tr').count();
    expect(formInstanceRows).toBe(1);
  });

  test('should correctly calculate progress on overwrites', async ({ page }) => {
    // Create a form with multiple required fields
    await page.click('text=New Template');
    await page.fill('input[placeholder="Enter form name"]', 'Progress Test Form');
    await page.click('text=Add Section');
    await page.fill('input[placeholder="Section name"]', 'Progress Section');
    
    // Add first required field
    await page.click('text=Add Field');
    await page.fill('input[placeholder="Field label"]', 'Required Field 1');
    await page.check('input[type="checkbox"]'); // Make required
    
    // Add second required field
    await page.click('text=Add Field');
    await page.locator('input[placeholder="Field label"]').nth(1).fill('Required Field 2');
    await page.locator('input[type="checkbox"]').nth(1).check(); // Make required
    
    await page.click('text=Save Template');
    await page.click('text=Dashboard');
    
    // Start the form
    await page.click('text=Start').last();
    
    // Fill first field only
    await page.fill('input[placeholder="Enter Required Field 1"]', 'Value 1');
    await page.waitForTimeout(1500);
    
    // Check progress is 50%
    await page.click('text=Dashboard');
    await expect(page.locator('text=50%')).toBeVisible();
    
    // Continue editing
    await page.click('text=Edit').last();
    await page.fill('input[placeholder="Enter Required Field 2"]', 'Value 2');
    await page.waitForTimeout(1500);
    
    // Check progress is now 100%
    await page.click('text=Dashboard');
    await expect(page.locator('text=100%')).toBeVisible();
    
    // Should still be only one instance
    const progressTestRows = await page.locator('text=Progress Test Form').count();
    expect(progressTestRows).toBe(1);
  });
});