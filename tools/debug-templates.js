// Debug script to test template loading
console.log('🔍 Debugging template loading...');

// Test imports
try {
  console.log('1. Testing import paths...');
  
  // Test if we can import the JCC2 template directly
  import('../templates/jcc2_questionnaire_v2.ts').then(module => {
    console.log('✅ JCC2 template imported successfully');
    const template = module.JCC2UserQuestionnaireV2.create();
    console.log(`   Name: ${template.metadata.name}`);
    console.log(`   Sections: ${template.sections.length}`);
  }).catch(err => {
    console.log('❌ Failed to import JCC2 template:', err.message);
  });
  
  // Test CommonTemplates
  import('../src/programmatic/library/CommonTemplates.ts').then(module => {
    console.log('✅ CommonTemplates imported successfully');
    const templates = module.CommonTemplates.listTemplates();
    console.log(`   Available templates: ${templates.join(', ')}`);
    
    // Test JCC2 template creation
    try {
      const jcc2Template = module.CommonTemplates.getTemplate('jcc2-questionnaire');
      console.log('✅ JCC2 template created via CommonTemplates');
    } catch (err) {
      console.log('❌ Failed to create JCC2 template:', err.message);
    }
  }).catch(err => {
    console.log('❌ Failed to import CommonTemplates:', err.message);
  });
  
} catch (error) {
  console.log('❌ Error in debug script:', error.message);
}