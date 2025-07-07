import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173');
    
    // Execute JavaScript to test template creation
    const templateDebug = await page.evaluate(() => {
      // Import the template creation function
      return import('/src/programmatic/examples/ComprehensiveEventForm.ts').then(module => {
        try {
          const template = module.ComprehensiveEventForm.create();
          const allFields = template.sections.flatMap(s => s.fields);
          
          return {
            templateName: template.metadata.name,
            sectionCount: template.sections.length,
            totalFields: allFields.length,
            fieldIds: allFields.map(f => f.id),
            fieldTypes: allFields.map(f => ({ id: f.id, type: f.type })),
            experienceField: allFields.find(f => f.id === 'experience_years')
          };
        } catch (error) {
          return {
            error: error.message,
            stack: error.stack
          };
        }
      });
    });
    
    console.log('Template Debug Info:');
    console.log(JSON.stringify(templateDebug, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();