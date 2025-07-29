#!/usr/bin/env node

/**
 * Test script to fill and submit a form to verify CSV export
 */

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🧪 Testing Form Submission and CSV Export');
  console.log('=========================================\n');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Click on the first template to fill it
    console.log('1️⃣ Clicking on first template...');
    await page.click('.bg-white.rounded-lg.shadow-sm >> nth=0');
    await page.waitForLoadState('networkidle');
    
    // Fill some basic fields
    console.log('2️⃣ Filling form fields...');
    
    // Try to fill first text input
    const firstInput = await page.locator('input[type="text"], input[type="email"], input[type="tel"]').first();
    if (await firstInput.isVisible()) {
      await firstInput.fill('Test User');
    }
    
    // Try to fill first textarea
    const firstTextarea = await page.locator('textarea').first();
    if (await firstTextarea.isVisible()) {
      await firstTextarea.fill('This is a test response for CSV export verification.');
    }
    
    // Click any radio buttons
    const radioButtons = await page.locator('input[type="radio"]').all();
    for (let i = 0; i < Math.min(3, radioButtons.length); i++) {
      if (await radioButtons[i].isVisible()) {
        await radioButtons[i].click();
      }
    }
    
    // Save the form
    console.log('3️⃣ Saving form...');
    const saveButton = page.locator('button:has-text("Save")').first();
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Navigate through sections if in section mode
    const nextButton = page.locator('button:has-text("Next")');
    let sectionCount = 0;
    while (await nextButton.isVisible() && sectionCount < 10) {
      console.log(`   - Moving to next section (${sectionCount + 1})...`);
      await nextButton.click();
      await page.waitForTimeout(500);
      
      // Fill any visible fields in this section
      const inputs = await page.locator('input[type="text"], input[type="email"], input[type="tel"], textarea').all();
      for (const input of inputs) {
        if (await input.isVisible()) {
          await input.fill(`Section ${sectionCount + 1} test data`);
        }
      }
      
      sectionCount++;
    }
    
    // Try to submit the form
    console.log('4️⃣ Attempting to submit form...');
    const submitButton = page.locator('button:has-text("Submit")');
    if (await submitButton.isVisible()) {
      // Check if button is enabled
      const isDisabled = await submitButton.isDisabled();
      if (isDisabled) {
        console.log('   ⚠️  Submit button is disabled. Form may not be complete.');
      } else {
        await submitButton.click();
        console.log('   ✅ Form submitted!');
        await page.waitForTimeout(1000);
      }
    }
    
    // Go back to dashboard
    console.log('5️⃣ Returning to dashboard...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Check localStorage for submissions
    console.log('6️⃣ Checking submission data...');
    const storageData = await page.evaluate(() => {
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      const instances = JSON.parse(localStorage.getItem('form_instances') || '[]');
      
      return {
        submissionCount: submissions.length,
        instanceCount: instances.length,
        submissions: submissions,
        instances: instances
      };
    });
    
    console.log(`\n📊 Results:`);
    console.log(`   - Submissions: ${storageData.submissionCount}`);
    console.log(`   - Instances: ${storageData.instanceCount}`);
    
    if (storageData.submissionCount > 0) {
      console.log('\n✅ Submission found! Data structure:');
      const submission = storageData.submissions[0];
      console.log(`   - ID: ${submission.id}`);
      console.log(`   - Template: ${submission.templateName}`);
      console.log(`   - Data fields: ${Object.keys(submission.data || {}).length}`);
      console.log(`   - Sample data:`, JSON.stringify(submission.data, null, 2).substring(0, 300));
    } else {
      console.log('\n⚠️  No submissions found. Checking instances...');
      if (storageData.instanceCount > 0) {
        const instance = storageData.instances[0];
        console.log(`   - Instance ID: ${instance.id}`);
        console.log(`   - Completed: ${instance.completed}`);
        console.log(`   - Progress: ${instance.progress}%`);
        console.log(`   - Data fields: ${Object.keys(instance.data || {}).length}`);
      }
    }
    
    // Try to export CSV
    console.log('\n7️⃣ Testing CSV export...');
    // Click on the template actions
    const templateActions = page.locator('button[title="Export as CSV"]').first();
    if (await templateActions.isVisible()) {
      await templateActions.click();
      console.log('   ✅ CSV export triggered');
      await page.waitForTimeout(1000);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n\n✅ Test complete. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to exit.');
    
    // Keep browser open
    await new Promise(() => {});
  }
})();