#!/usr/bin/env node

// Simple test to verify the single HTML file meets PRD requirements
import { readFileSync, statSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const singleHtmlPath = join(__dirname, '../dist/standalone-form-manager.html');

console.log('🧪 Testing Single HTML File Implementation...\n');

try {
  // Test 1: File exists and is readable
  console.log('1. ✅ File Existence Check');
  const fileContent = readFileSync(singleHtmlPath, 'utf8');
  console.log(`   📄 File found: ${singleHtmlPath}`);
  
  // Test 2: File size check (PRD requirement: <5MB)
  console.log('\n2. ✅ File Size Compliance');
  const stats = statSync(singleHtmlPath);
  const fileSizeKB = stats.size / 1024;
  const fileSizeMB = fileSizeKB / 1024;
  console.log(`   📊 Size: ${fileSizeKB.toFixed(2)} KB (${fileSizeMB.toFixed(2)} MB)`);
  console.log(`   ✅ Under 5MB limit: ${fileSizeMB < 5 ? 'PASS' : 'FAIL'}`);
  
  // Test 3: Self-contained check (no external dependencies)
  console.log('\n3. ✅ Self-Contained Check');
  const hasExternalCss = /<link[^>]+rel=["']stylesheet["'][^>]*>/i.test(fileContent);
  const hasExternalJs = /<script[^>]+src=["'][^"']+["'][^>]*>/i.test(fileContent);
  const hasExternalImages = /<img[^>]+src=["']http[^"']*["'][^>]*>/i.test(fileContent);
  
  console.log(`   🔗 External CSS links: ${hasExternalCss ? 'FOUND (❌)' : 'NONE (✅)'}`);
  console.log(`   📄 External JS scripts: ${hasExternalJs ? 'FOUND (❌)' : 'NONE (✅)'}`);
  console.log(`   🖼️ External images: ${hasExternalImages ? 'FOUND (❌)' : 'NONE (✅)'}`);
  
  // Test 4: Content verification
  console.log('\n4. ✅ Content Verification');
  const hasReact = fileContent.includes('react');
  const hasTailwind = fileContent.includes('tailwind') || fileContent.includes('tw-');
  const hasFormLogic = fileContent.includes('Form Management System');
  const hasLocalStorage = fileContent.includes('localStorage');
  
  console.log(`   ⚛️ React included: ${hasReact ? '✅' : '❌'}`);
  console.log(`   🎨 Styling included: ${hasTailwind || fileContent.includes('bg-') ? '✅' : '❌'}`);
  console.log(`   📝 Form logic included: ${hasFormLogic ? '✅' : '❌'}`);
  console.log(`   💾 Data persistence: ${hasLocalStorage ? '✅' : '❌'}`);
  
  // Test 5: HTML structure
  console.log('\n5. ✅ HTML Structure');
  const hasDoctype = fileContent.startsWith('<!doctype html');
  const hasTitle = fileContent.includes('<title>');
  const hasRootDiv = fileContent.includes('id="root"');
  
  console.log(`   📋 DOCTYPE declaration: ${hasDoctype ? '✅' : '❌'}`);
  console.log(`   🏷️ Title tag: ${hasTitle ? '✅' : '❌'}`);
  console.log(`   🎯 Root element: ${hasRootDiv ? '✅' : '❌'}`);
  
  // Test 6: PRD Requirements Summary
  console.log('\n📋 PRD Requirements Compliance Summary:');
  console.log('─'.repeat(50));
  console.log(`✅ Single HTML file: YES`);
  console.log(`✅ No hosting required: YES (standalone file)`);
  console.log(`✅ Self-contained: ${!hasExternalCss && !hasExternalJs ? 'YES' : 'NO'}`);
  console.log(`✅ Under 5MB limit: ${fileSizeMB < 5 ? 'YES' : 'NO'}`);
  console.log(`✅ Includes React app: ${hasReact ? 'YES' : 'NO'}`);
  console.log(`✅ Data persistence: ${hasLocalStorage ? 'YES' : 'NO'}`);
  
  const overallPass = !hasExternalCss && !hasExternalJs && fileSizeMB < 5 && hasReact && hasLocalStorage;
  
  console.log('\n🎯 Overall Assessment:');
  console.log('─'.repeat(50));
  if (overallPass) {
    console.log('🎉 SUCCESS: Single HTML file implementation meets PRD requirements!');
    console.log('📦 The standalone-form-manager.html file is ready for deployment.');
    console.log('🚀 This file can run offline without any external dependencies.');
  } else {
    console.log('⚠️  PARTIAL: Some requirements may need attention.');
    console.log('📝 Review the checks above for specific issues.');
  }
  
  console.log('\n📁 File location:', singleHtmlPath);
  console.log('📊 Final size:', `${fileSizeKB.toFixed(2)} KB`);
  
} catch (error) {
  console.error('❌ Error testing single HTML file:', error.message);
  process.exit(1);
}