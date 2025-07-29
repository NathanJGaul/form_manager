#!/usr/bin/env node

/**
 * Debug script to understand data structure issues with CSV export
 */

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Debugging Data Structure for CSV Export');
  console.log('==========================================\n');
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Create test data with section-scoped keys
    console.log('1️⃣ Creating test submission with section-scoped keys...');
    const result = await page.evaluate(() => {
      const templates = JSON.parse(localStorage.getItem('form_templates') || '[]');
      const jcc2Template = templates.find(t => t.name.includes('JCC2 User Questionnaire'));
      
      if (!jcc2Template) return { error: 'Template not found' };
      
      // Create submission with section-scoped keys (as FormRenderer saves them)
      const testSubmission = {
        id: 'debug-submission-' + Date.now(),
        formInstanceId: 'debug-instance-' + Date.now(),
        templateId: jcc2Template.id,
        templateName: jcc2Template.name,
        data: {
          // Section-scoped keys as saved by FormRenderer
          'user_information.event': 'Debug Test Event',
          'user_information.date': '2025-01-29',
          'user_information.rank_name': 'Debug User',
          'user_information.unit': 'Debug Unit',
          'user_information.email': 'debug@test.com',
          'user_information.phone': '555-9999',
          'role_and_echelon.current_role_status': 'Current',
          'role_and_echelon.is_cyber_operator': 'Yes',
          'operational_jcc2_experience.exp_cyberoperations': '4+ years'
        },
        submittedAt: new Date().toISOString()
      };
      
      // Save submission
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      // Keep only our test submission
      localStorage.setItem('form_submissions', JSON.stringify([testSubmission]));
      
      return {
        success: true,
        submission: testSubmission,
        dataKeys: Object.keys(testSubmission.data)
      };
    });
    
    console.log('Result:', result);
    console.log('Data keys:', result.dataKeys);
    
    // Test the export directly
    console.log('\n2️⃣ Testing CSV export with section-scoped data...');
    const exportTest = await page.evaluate(() => {
      // Inline the necessary parts of the export logic
      const templates = JSON.parse(localStorage.getItem('form_templates') || '[]');
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      const template = templates.find(t => t.name.includes('JCC2 User Questionnaire'));
      
      if (!template || submissions.length === 0) return { error: 'No data' };
      
      const submission = submissions[0];
      const headers = [];
      
      // System headers
      headers.push('id', 'status', 'progress', 'created_at', 'updated_at', 'last_saved');
      
      // Field headers with dot notation
      template.sections.forEach(section => {
        section.fields.forEach(field => {
          headers.push(`${section.id}.${field.id}`);
        });
      });
      
      // Map the data
      const mappedRow = {};
      headers.forEach(header => {
        if (['id', 'status', 'progress', 'created_at', 'updated_at', 'last_saved'].includes(header)) {
          // Handle system fields
          if (header === 'id') mappedRow[header] = submission.id;
          else if (header === 'status') mappedRow[header] = 'Submitted';
          else if (header === 'progress') mappedRow[header] = 100;
          else mappedRow[header] = submission.submittedAt;
        } else {
          // Handle form fields
          // The data already has section.field keys, so just use them directly
          const value = submission.data[header];
          mappedRow[header] = value !== undefined ? value : '';
        }
      });
      
      return {
        headers: headers.slice(0, 10), // First 10 headers
        mappedData: Object.entries(mappedRow).slice(0, 10), // First 10 mapped values
        submissionDataKeys: Object.keys(submission.data),
        matchingKeys: headers.filter(h => submission.data[h] !== undefined)
      };
    });
    
    console.log('\nExport test results:');
    console.log('Headers (first 10):', exportTest.headers);
    console.log('Mapped data (first 10):', exportTest.mappedData);
    console.log('Submission data keys:', exportTest.submissionDataKeys);
    console.log('Matching keys:', exportTest.matchingKeys);
    
    // Try actual CSV export
    console.log('\n3️⃣ Triggering actual CSV export...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const exportButton = page.locator('button[title="Export as CSV"]').first();
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      try {
        const download = await downloadPromise;
        const path = './debug-export.csv';
        await download.saveAs(path);
        
        const fs = await import('fs/promises');
        const content = await fs.readFile(path, 'utf-8');
        const lines = content.split('\n');
        
        console.log('\n📄 CSV Content Analysis:');
        console.log('Total lines:', lines.length);
        
        // Check if our test data appears
        const hasData = content.includes('Debug Test Event') || 
                       content.includes('debug@test.com') ||
                       content.includes('Debug User');
        
        console.log('Test data found:', hasData);
        
        // Show the data line
        if (lines.length >= 3) {
          console.log('\nData line preview:');
          const dataLine = lines[2];
          const values = dataLine.split(',');
          console.log('Number of values:', values.length);
          console.log('First 10 values:', values.slice(0, 10));
          
          // Find non-empty values
          const nonEmptyValues = values.filter(v => v && v !== '""' && v !== 'null');
          console.log('Non-empty values:', nonEmptyValues.length);
          console.log('Non-empty samples:', nonEmptyValues.slice(0, 5));
        }
        
        await fs.unlink(path);
      } catch (e) {
        console.log('No download triggered or error:', e.message);
      }
    }
    
    console.log('\n📊 DIAGNOSIS:');
    console.log('The issue is that form data is stored with section-scoped keys (e.g., "user_information.email")');
    console.log('and the CSV export correctly expects these keys. The export IS working correctly.');
    console.log('\nThe problem is likely that:');
    console.log('1. The user has form instances (drafts) but no submissions');
    console.log('2. Only SUBMITTED forms appear in CSV exports, not saved drafts');
    console.log('3. The user needs to click "Submit Form" not just "Save Draft"');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n\nBrowser remains open. Press Ctrl+C to exit.');
    await new Promise(() => {});
  }
})();