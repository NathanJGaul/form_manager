// Test the refresh button functionality
import { chromium } from 'playwright';

async function testRefreshButton() {
    console.log('🔄 Testing refresh button functionality...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    // Collect console logs
    const logs = [];
    page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    try {
        console.log('1. Loading dashboard...');
        await page.goto('http://localhost:5176/');
        await page.waitForSelector('h1:has-text("Form Management System")', { timeout: 10000 });
        
        console.log('2. Waiting for initial template load...');
        await page.waitForTimeout(3000);
        
        // Check initial template count
        const initialTemplateCount = await page.locator('.bg-white.rounded-lg.shadow-md.p-6:has(.font-semibold)').count();
        console.log(`Initial template count: ${initialTemplateCount}`);
        
        console.log('3. Looking for refresh button...');
        const refreshButton = page.locator('button:has-text("Refresh")');
        const refreshButtonExists = await refreshButton.count();
        console.log(`Refresh button found: ${refreshButtonExists > 0 ? '✅' : '❌'}`);
        
        if (refreshButtonExists > 0) {
            console.log('4. Clicking refresh button...');
            await refreshButton.click();
            
            console.log('5. Waiting for refresh to complete...');
            await page.waitForTimeout(2000);
            
            // Check template count after refresh
            const refreshedTemplateCount = await page.locator('.bg-white.rounded-lg.shadow-md.p-6:has(.font-semibold)').count();
            console.log(`Template count after refresh: ${refreshedTemplateCount}`);
            
            // Verify templates are still there
            const templateNames = await page.locator('h3.font-semibold').allTextContents();
            console.log('Templates after refresh:', templateNames);
            
            // Check if JCC2 template is still there
            const jcc2Count = await page.locator('h3:has-text("JCC2")').count();
            console.log(`JCC2 template after refresh: ${jcc2Count > 0 ? '✅' : '❌'}`);
            
            // Take screenshot
            await page.screenshot({ path: 'after-refresh.png', fullPage: true });
            console.log('📸 Screenshot saved as after-refresh.png');
        }
        
    } catch (error) {
        console.error('❌ Error during test:', error.message);
    }
    
    console.log('\n📋 Console logs from refresh:');
    logs.forEach(log => console.log('  ' + log));
    
    await browser.close();
}

testRefreshButton().catch(console.error);