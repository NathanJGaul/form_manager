import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:5173');
    
    // Execute JavaScript to test template creation with different contexts
    const templateDebug = await page.evaluate(() => {
      return import('/src/programmatic/examples/ComprehensiveEventForm.ts').then(module => {
        try {
          const template = module.ComprehensiveEventForm.create();
          
          // Check if template has variables or default values
          const allFields = template.sections.flatMap(s => s.fields);
          
          // Check first section fields for clues about what gets generated
          const firstSection = template.sections[0];
          const secondSection = template.sections[1];
          
          return {
            templateName: template.metadata.name,
            variables: template.variables,
            sectionCount: template.sections.length,
            sectionTitles: template.sections.map(s => s.title),
            firstSectionFields: firstSection.fields.map(f => ({ id: f.id, type: f.type })),
            secondSectionFields: secondSection ? secondSection.fields.map(f => ({ id: f.id, type: f.type })) : [],
            totalFields: allFields.length,
            hasExperienceField: allFields.some(f => f.id === 'experience_years'),
            hasNpsScore: allFields.some(f => f.id === 'nps_score'),
            rangeFields: allFields.filter(f => f.type === 'range').map(f => ({ id: f.id, type: f.type }))
          };
        } catch (error) {
          return {
            error: error.message,
            stack: error.stack
          };
        }
      });
    });
    
    console.log('Detailed Template Debug Info:');
    console.log(JSON.stringify(templateDebug, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();