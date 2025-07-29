#!/usr/bin/env node

/**
 * Debug script to analyze CSV export issues with filled forms
 */

import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Debugging CSV Export Issues');
  console.log('==============================\n');
  
  try {
    // Navigate to the app
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Get stored data from localStorage
    const storageData = await page.evaluate(() => {
      const submissions = JSON.parse(localStorage.getItem('form_submissions') || '[]');
      const instances = JSON.parse(localStorage.getItem('form_instances') || '[]');
      const templates = JSON.parse(localStorage.getItem('form_templates') || '[]');
      
      return {
        submissions,
        instances,
        templates,
        submissionCount: submissions.length,
        instanceCount: instances.length,
        templateCount: templates.length
      };
    });
    
    console.log('📊 Storage Summary:');
    console.log(`  - Templates: ${storageData.templateCount}`);
    console.log(`  - Instances: ${storageData.instanceCount}`);
    console.log(`  - Submissions: ${storageData.submissionCount}`);
    console.log('');
    
    // Analyze submissions
    if (storageData.submissionCount > 0) {
      console.log('📝 Submission Analysis:');
      storageData.submissions.forEach((submission, index) => {
        console.log(`\n  Submission ${index + 1}:`);
        console.log(`    - ID: ${submission.id}`);
        console.log(`    - Template ID: ${submission.templateId}`);
        console.log(`    - Template Name: ${submission.templateName}`);
        console.log(`    - Submitted At: ${submission.submittedAt}`);
        console.log(`    - Data keys: ${Object.keys(submission.data || {}).join(', ')}`);
        console.log(`    - Data sample:`, JSON.stringify(submission.data || {}, null, 2).substring(0, 200) + '...');
      });
    }
    
    // Analyze instances
    if (storageData.instanceCount > 0) {
      console.log('\n\n📋 Instance Analysis:');
      storageData.instances.forEach((instance, index) => {
        console.log(`\n  Instance ${index + 1}:`);
        console.log(`    - ID: ${instance.id}`);
        console.log(`    - Template ID: ${instance.templateId}`);
        console.log(`    - Template Name: ${instance.templateName}`);
        console.log(`    - Completed: ${instance.completed}`);
        console.log(`    - Progress: ${instance.progress}%`);
        console.log(`    - Data keys: ${Object.keys(instance.data || {}).join(', ')}`);
        console.log(`    - Data sample:`, JSON.stringify(instance.data || {}, null, 2).substring(0, 200) + '...');
      });
    }
    
    // Try to export CSV for each template
    console.log('\n\n📤 CSV Export Test:');
    for (const template of storageData.templates) {
      console.log(`\n  Testing export for template: ${template.name}`);
      
      const csvData = await page.evaluate((templateId) => {
        // Import the storage manager functions inline
        const getSubmissions = () => JSON.parse(localStorage.getItem('form_submissions') || '[]');
        const getTemplates = () => JSON.parse(localStorage.getItem('form_templates') || '[]');
        
        const submissions = getSubmissions().filter(s => s.templateId === templateId);
        const template = getTemplates().find(t => t.id === templateId);
        
        if (!template) return { error: 'Template not found' };
        
        return {
          templateId,
          templateName: template.name,
          submissionCount: submissions.length,
          hasData: submissions.length > 0,
          sampleSubmission: submissions[0] || null
        };
      }, template.id);
      
      console.log(`    - Submissions found: ${csvData.submissionCount}`);
      console.log(`    - Has data: ${csvData.hasData}`);
      if (csvData.sampleSubmission) {
        console.log(`    - Sample submission data exists: ${Object.keys(csvData.sampleSubmission.data || {}).length} fields`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('\n\n✅ Debug complete. Browser will remain open for inspection.');
    console.log('Press Ctrl+C to exit.');
    
    // Keep browser open
    await new Promise(() => {});
  }
})();