// Simple runtime test
import { chromium } from 'playwright';

async function testRuntime() {
    console.log('🔍 Testing runtime behavior...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Collect console logs
    const logs = [];
    page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Collect errors
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.message);
    });
    
    try {
        console.log('1. Navigating to app...');
        await page.goto('http://localhost:5176/');
        
        console.log('2. Waiting for app to load...');
        await page.waitForSelector('h1:has-text("Form Management System")', { timeout: 10000 });
        
        console.log('3. Checking for templates...');
        await page.waitForTimeout(3000); // Wait for templates to load
        
        // Check templates count
        const templateCards = await page.locator('.bg-white.rounded-lg.shadow-md.p-6:has(.font-semibold)').count();
        console.log(`Found ${templateCards} template cards`);
        
        // Get template names
        const templateNames = await page.locator('h3.font-semibold').allTextContents();
        console.log('Template names:', templateNames);
        
        // Check for JCC2 specifically
        const jcc2Count = await page.locator('h3:has-text("JCC2")').count();
        console.log(`JCC2 templates found: ${jcc2Count}`);
        
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
    
    console.log('\n📋 Console logs:');
    logs.forEach(log => console.log('  ' + log));
    
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log('  ' + error));
    
    await browser.close();
}

testRuntime().catch(console.error);