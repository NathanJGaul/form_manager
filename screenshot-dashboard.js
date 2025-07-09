// Take screenshot of dashboard
import { chromium } from 'playwright';

async function screenshotDashboard() {
    console.log('📸 Taking dashboard screenshot...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Clear localStorage to force fresh load
        await page.goto('http://localhost:5176/');
        await page.evaluate(() => localStorage.clear());
        
        // Reload page
        await page.reload();
        
        // Wait for templates to load
        await page.waitForSelector('h1:has-text("Form Management System")', { timeout: 10000 });
        await page.waitForTimeout(3000);
        
        // Take full page screenshot
        await page.screenshot({ 
            path: 'dashboard-full.png', 
            fullPage: true 
        });
        
        // Focus on templates section
        await page.locator('h2:has-text("Form Templates")').scrollIntoViewIfNeeded();
        await page.screenshot({ 
            path: 'dashboard-templates-section.png' 
        });
        
        console.log('✅ Screenshots saved:');
        console.log('  - dashboard-full.png (full page)');
        console.log('  - dashboard-templates-section.png (templates section)');
        
    } catch (error) {
        console.error('❌ Error taking screenshot:', error.message);
    }
    
    await browser.close();
}

screenshotDashboard().catch(console.error);