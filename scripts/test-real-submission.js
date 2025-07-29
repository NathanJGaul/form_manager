#!/usr/bin/env node

/**
 * Test creating a realistic submission with proper field IDs
 */

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🧪 Testing Real Form Submission');
  console.log('================================\n');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    console.log('1️⃣ Creating a realistic test submission...');
    await page.evaluate(() => {
      // Get the JCC2 questionnaire template
      const templates = JSON.parse(localStorage.getItem('form_templates') || '[]');
      const jcc2Template = templates.find(t => t.name.includes('JCC2 User Questionnaire'));
      
      if (!jcc2Template) {
        console.error('JCC2 template not found!');
        return;
      }
      
      console.log('Using template:', jcc2Template.name);
      
      // Create a realistic submission with proper field IDs
      const testSubmission = {
        id: 'test-submission-' + Date.now(),
        formInstanceId: 'test-instance-' + Date.now(),
        templateId: jcc2Template.id,
        templateName: jcc2Template.name,
        data: {
          // User Information section
          'event': 'Annual Security Review',
          'date': '2025-01-29',
          'rank_name': 'Captain John Smith',
          'unit': 'Cyber Operations Unit',
          'email': 'john.smith@military.mil',
          'phone': '555-0123',
          
          // Role and Echelon
          'current_role_status': 'Current',
          'is_cyber_operator': 'Yes',
          'cyber_ops_division_team': 'Alpha Team',
          'echelon': ['Strategic', 'Operational'],
          'duties': ['Planning', 'Operations', 'Analysis'],
          'other_duties': 'Training coordination',
          
          // Experience
          'exp_cyberoperations': '4+ years',
          'exp_yourcurrentrole': '1-2 years',
          'exp_jcc2experience': '2-3 years',
          
          // Add some application experience
          'exp_app_jcc2cyberops': 'Yes',
          'exp_app_jcc2readiness': 'Yes',
          'exp_app_a2it': 'No',
          'exp_app_cad': 'Yes',
          
          // Usage frequency
          'frequency_jcc2cyberops': 'Daily',
          'classification_jcc2cyberops': 'SIPR',
          'training_received_jcc2cyberops': 'Yes',
          'training_type_jcc2cyberops': ['Online Course', 'On-the-job Training'],
          
          // Add more realistic data
          'intelligence_data_provided_jcc2cyberops': 'Completely Effective',
          'intelligence_data_completion_of_role_jcc2cyberops': 'Moderately Effective',
          
          // System usability
          'like_to_use': 'Strongly Agree',
          'unnecessarily_complex': 'Disagree',
          'easy_to_use': 'Agree',
          'need_expert_support': 'Slightly Disagree',
          
          // Comments
          'additional_comments': 'The system has been very helpful for our operations. Would benefit from improved reporting features.',
        },
        submittedAt: new Date().toISOString()
      };
      
      // Get existing submissions
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      submissions.push(testSubmission);
      
      // Save back to localStorage
      localStorage.setItem('form_submissions', JSON.stringify(submissions));
      console.log('Test submission created with', Object.keys(testSubmission.data).length, 'fields');
      
      return testSubmission;
    });
    
    // Reload the page
    console.log('2️⃣ Reloading page...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Find and click the export button for JCC2 questionnaire
    console.log('3️⃣ Looking for JCC2 questionnaire export button...');
    const jcc2Card = page.locator('h3:has-text("JCC2 User Questionnaire")').locator('..').locator('..');
    const exportButton = jcc2Card.locator('button[title="Export as CSV"]');
    
    if (await exportButton.isVisible()) {
      console.log('4️⃣ Clicking export button...');
      
      // Set up download handler
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      
      const download = await downloadPromise;
      const fileName = download.suggestedFilename();
      console.log(`   ✅ Download triggered: ${fileName}`);
      
      // Save and check the file
      const path = `./jcc2-export-${Date.now()}.csv`;
      await download.saveAs(path);
      
      // Read and analyze the CSV
      const fs = await import('fs/promises');
      const content = await fs.readFile(path, 'utf-8');
      const lines = content.split('\n');
      
      console.log('\n📄 CSV Analysis:');
      console.log('================');
      console.log(`Total lines: ${lines.length}`);
      console.log(`Headers: ${lines[0].split(',').length} columns`);
      
      // Check for our test data
      const dataChecks = [
        { field: 'Captain John Smith', name: 'Rank/Name' },
        { field: 'Cyber Operations Unit', name: 'Unit' },
        { field: 'john.smith@military.mil', name: 'Email' },
        { field: 'Annual Security Review', name: 'Event' },
        { field: 'Alpha Team', name: 'Team' },
        { field: 'Daily', name: 'Usage Frequency' },
        { field: 'improved reporting features', name: 'Comments' }
      ];
      
      console.log('\nData verification:');
      dataChecks.forEach(check => {
        const found = content.includes(check.field);
        console.log(`  ${found ? '✅' : '❌'} ${check.name}: ${found ? 'Found' : 'NOT FOUND'}`);
      });
      
      // Show data row preview
      if (lines.length >= 3) {
        console.log('\nData row preview (first 500 chars):');
        console.log(lines[2].substring(0, 500) + '...');
      }
      
      // Clean up
      await fs.unlink(path);
      
    } else {
      console.log('❌ Export button not found');
    }
    
    // Check submission count
    const counts = await page.evaluate(() => {
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      const instances = JSON.parse(localStorage.getItem('form_instances') || '[]');
      return {
        submissions: submissions.length,
        instances: instances.length,
        jcc2Submissions: submissions.filter(s => s.templateName.includes('JCC2')).length
      };
    });
    
    console.log('\n📊 Final counts:');
    console.log(`  Total submissions: ${counts.submissions}`);
    console.log(`  Total instances: ${counts.instances}`);
    console.log(`  JCC2 submissions: ${counts.jcc2Submissions}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n\n✅ Test complete. Browser will remain open.');
    console.log('Press Ctrl+C to exit.');
    
    // Keep browser open
    await new Promise(() => {});
  }
})();