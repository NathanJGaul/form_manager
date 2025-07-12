// Simple test to verify template loading
import { chromium } from 'playwright';

async function testTemplateLoading() {
    console.log('🚀 Testing template loading...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Open the app
    await page.goto('http://localhost:5176/');
    
    // Wait for app to load
    await page.waitForTimeout(3000);
    
    // Check console for any errors
    const consoleLogs = [];
    page.on('console', msg => {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // Wait a bit more for templates to load
    await page.waitForTimeout(2000);
    
    // Check if templates are visible
    const templates = await page.locator('.bg-white.rounded-lg.shadow-md.p-6').all();
    console.log(`Found ${templates.length} templates on dashboard`);
    
    // Look for JCC2 template specifically
    const jcc2Template = await page.locator('h3:has-text("JCC2 User Questionnaire V2")').count();
    console.log(`JCC2 template found: ${jcc2Template > 0 ? 'YES' : 'NO'}`);
    
    // Check all template names
    const templateNames = await page.locator('h3.font-semibold').allTextContents();
    console.log('Template names found:', templateNames);
    
    // Print console logs
    console.log('\n📋 Console logs:');
    consoleLogs.forEach(log => console.log(log));
    
    // Take a screenshot
    await page.screenshot({ path: 'dashboard-templates.png' });
    console.log('📸 Screenshot saved as dashboard-templates.png');
    
    await browser.close();
}

testTemplateLoading().catch(console.error);