#!/usr/bin/env node

/**
 * Verify CSV export functionality
 */

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Verifying CSV Export Functionality');
  console.log('=====================================\n');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // First, let's manually create a submission in localStorage to test CSV export
    console.log('1️⃣ Creating test submission data...');
    await page.evaluate(() => {
      // Get the first template
      const templates = JSON.parse(localStorage.getItem('form_templates') || '[]');
      if (templates.length === 0) {
        console.error('No templates found!');
        return;
      }
      
      const template = templates[0];
      console.log('Using template:', template.name);
      
      // Create a test submission
      const testSubmission = {
        id: 'test-submission-' + Date.now(),
        formInstanceId: 'test-instance-' + Date.now(),
        templateId: template.id,
        templateName: template.name,
        data: {
          // Add some test data based on template fields
          'name': 'John Doe',
          'email': 'john@example.com',
          'phone': '555-1234',
          'address': '123 Test Street',
          'comments': 'This is a test submission for CSV export verification',
          // Add more fields as needed
        },
        submittedAt: new Date().toISOString()
      };
      
      // Get existing submissions
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      submissions.push(testSubmission);
      
      // Save back to localStorage
      localStorage.setItem('form_submissions', JSON.stringify(submissions));
      console.log('Test submission created:', testSubmission);
    });
    
    // Reload the page to reflect the new data
    console.log('2️⃣ Reloading page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check if we can see the export button
    console.log('3️⃣ Looking for export buttons...');
    const exportButtons = await page.locator('button[title="Export as CSV"]').all();
    console.log(`   Found ${exportButtons.length} export button(s)`);
    
    if (exportButtons.length > 0) {
      console.log('4️⃣ Clicking first export button...');
      
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      await exportButtons[0].click();
      
      try {
        const download = await downloadPromise;
        const fileName = download.suggestedFilename();
        console.log(`   ✅ Download triggered: ${fileName}`);
        
        // Save the file
        const path = `./test-export-${Date.now()}.csv`;
        await download.saveAs(path);
        console.log(`   ✅ File saved to: ${path}`);
        
        // Read and display the CSV content
        const fs = await import('fs/promises');
        const content = await fs.readFile(path, 'utf-8');
        console.log('\n📄 CSV Content Preview:');
        console.log('======================');
        const lines = content.split('\n');
        lines.slice(0, 5).forEach(line => console.log(line));
        if (lines.length > 5) {
          console.log('... (truncated)');
        }
        
        // Check if the CSV contains our test data
        if (content.includes('John Doe') || content.includes('john@example.com')) {
          console.log('\n✅ SUCCESS: Test data found in CSV export!');
        } else {
          console.log('\n⚠️  WARNING: Test data NOT found in CSV export');
          console.log('This suggests the export is not including submission data properly.');
        }
        
        // Clean up
        await fs.unlink(path);
        
      } catch (downloadError) {
        console.log('   ⚠️  No download triggered. CSV might be empty.');
      }
    }
    
    // Check the actual export function
    console.log('\n5️⃣ Testing export function directly...');
    const exportResult = await page.evaluate(() => {
      const templates = JSON.parse(localStorage.getItem('form_templates') || '[]');
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      
      if (templates.length === 0) return { error: 'No templates' };
      
      const template = templates[0];
      const templateSubmissions = submissions.filter(s => s.templateId === template.id);
      
      // Try to replicate the export logic
      if (templateSubmissions.length === 0) {
        return { 
          error: 'No submissions for template',
          templateId: template.id,
          templateName: template.name,
          allSubmissions: submissions.length
        };
      }
      
      return {
        templateId: template.id,
        templateName: template.name,
        submissionCount: templateSubmissions.length,
        sampleData: templateSubmissions[0].data,
        dataKeys: Object.keys(templateSubmissions[0].data || {})
      };
    });
    
    console.log('Export function result:', JSON.stringify(exportResult, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n\n✅ Verification complete. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to exit.');
    
    // Keep browser open
    await new Promise(() => {});
  }
})();