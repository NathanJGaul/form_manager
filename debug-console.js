import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Listen for console events
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });
  
  // Listen for page errors
  page.on('pageerror', err => {
    console.error('Page error:', err);
  });
  
  // Listen for network failures
  page.on('requestfailed', request => {
    console.error('Network request failed:', request.url(), request.failure());
  });
  
  try {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000); // Wait for page to load
    
    // Check if there are any visible errors
    const errors = await page.locator('text=Error').count();
    console.log(`Visible errors on page: ${errors}`);
    
    // Check if the main app is rendered
    const appTitle = await page.locator('h1').count();
    console.log(`H1 elements found: ${appTitle}`);
    
    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/debug-screenshot.png' });
    console.log('Screenshot saved to /tmp/debug-screenshot.png');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();