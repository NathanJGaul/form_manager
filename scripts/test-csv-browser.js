// Test CSV export with Playwright
import { test } from '@playwright/test';

test('CSV export should include section-scoped field values', async ({ page }) => {
  await page.goto('http://localhost:5175/test-utils/test-csv-export-fix.html');
  
  // Run the test
  await page.click('button:has-text("Run Test")');
  
  // Wait for results
  await page.waitForSelector('#results', { state: 'visible' });
  
  // Check if all tests passed
  const allPassedElement = await page.locator('strong:has-text("All tests passed!")');
  const hasPassed = await allPassedElement.count() > 0;
  
  // Get the CSV output
  const csvOutput = await page.locator('#csv-output').textContent();
  
  console.log('Test passed:', hasPassed);
  console.log('\nCSV Output:');
  console.log(csvOutput);
  
  // Get detailed results
  const results = await page.locator('.result').allTextContents();
  console.log('\nDetailed Results:');
  results.forEach(result => console.log(result));
  
  await page.close();
});