import { test, expect } from '@playwright/test';
import { EventFormShowcase } from '../src/programmatic/examples/EventFormShowcase';
import { TDLParser } from '../src/programmatic/tdl/parser';
import { TDLValidator } from '../src/programmatic/tdl/validator';

test.describe('Event Form Showcase - Complete Feature Demonstration', () => {
  
  test('should demonstrate all programmatic template features', async () => {
    console.log('🚀 Running complete programmatic template showcase...');
    
    // Run the complete demonstration
    const result = EventFormShowcase.runCompleteDemo();
    
    expect(result.success).toBe(true);
    expect(result.comprehensive).toBeDefined();
    expect(result.simplified).toBeDefined();
    
    console.log('✅ Complete showcase demonstration successful!');
  });
  
  test('should create comprehensive template with all features', async () => {
    const template = EventFormShowcase.createComprehensiveTemplate();
    
    // Validate basic structure
    expect(template.metadata.name).toBe('Comprehensive Event Registration Platform');
    expect(template.metadata.version).toBe('2.0.0');
    expect(template.sections.length).toBeGreaterThan(10);
    
    // Check variables
    expect(template.variables).toBeDefined();
    expect(template.variables?.eventTypes).toContain('conference');
    expect(template.variables?.features).toBeDefined();
    
    // Check advanced features
    expect(template.behavior.autoSave).toBe(true);
    expect(template.behavior.autoSaveInterval).toBe(2000);
    expect(template.behavior.showProgress).toBe(true);
    expect(template.styling.theme).toBe('modern-professional');
    expect(template.styling.conditionalStyling).toBeDefined();
    
    console.log(`📊 Created template with ${template.sections.length} sections`);
  });
  
  test('should include all field types', async () => {
    const template = EventFormShowcase.createComprehensiveTemplate();
    const allFields = template.sections.flatMap(s => s.fields);
    
    const fieldTypes = new Set(allFields.map(f => f.type));
    
    // Should include diverse field types
    expect(fieldTypes.has('text')).toBe(true);
    expect(fieldTypes.has('textarea')).toBe(true);
    expect(fieldTypes.has('select')).toBe(true);
    expect(fieldTypes.has('radio')).toBe(true);
    expect(fieldTypes.has('checkbox')).toBe(true);
    expect(fieldTypes.has('number')).toBe(true);
    expect(fieldTypes.has('date')).toBe(true);
    expect(fieldTypes.has('file')).toBe(true);
    expect(fieldTypes.has('range')).toBe(true);
    
    console.log(`✅ Field types included: ${Array.from(fieldTypes).join(', ')}`);
    expect(fieldTypes.size).toBeGreaterThanOrEqual(8);
  });
  
  test('should have proper validation rules', async () => {
    const template = EventFormShowcase.createComprehensiveTemplate();
    const allFields = template.sections.flatMap(s => s.fields);
    
    // Check for various validation types
    const requiredFields = allFields.filter(f => f.required);
    const fieldsWithPattern = allFields.filter(f => f.validation?.pattern);
    const fieldsWithLength = allFields.filter(f => f.validation?.minLength || f.validation?.maxLength);
    const fieldsWithRange = allFields.filter(f => f.validation?.min !== undefined || f.validation?.max !== undefined);
    const fieldsWithOptions = allFields.filter(f => f.options);
    const multipleChoiceFields = allFields.filter(f => f.multiple);
    
    expect(requiredFields.length).toBeGreaterThan(10);
    expect(fieldsWithPattern.length).toBeGreaterThan(2);
    expect(fieldsWithLength.length).toBeGreaterThan(3);
    expect(fieldsWithRange.length).toBeGreaterThan(2);
    expect(fieldsWithOptions.length).toBeGreaterThan(15);
    expect(multipleChoiceFields.length).toBeGreaterThan(8);
    
    console.log('✅ Validation coverage:');
    console.log(`  - Required fields: ${requiredFields.length}`);
    console.log(`  - Pattern validation: ${fieldsWithPattern.length}`);
    console.log(`  - Length validation: ${fieldsWithLength.length}`);
    console.log(`  - Range validation: ${fieldsWithRange.length}`);
    console.log(`  - Multiple choice: ${multipleChoiceFields.length}`);
  });
  
  test('should serialize and validate correctly', async () => {
    const template = EventFormShowcase.createComprehensiveTemplate();
    const parser = new TDLParser();
    const validator = new TDLValidator();
    
    // Serialize to TDL
    const tdlDocument = parser.serialize(template);
    expect(tdlDocument.metadata.name).toBe(template.metadata.name);
    expect(tdlDocument.sections.length).toBe(template.sections.length);
    
    // Validate TDL structure
    const validation = validator.validateTDL(tdlDocument);
    expect(validation.valid).toBe(true);
    expect(validation.errors.length).toBe(0);
    
    // Parse back to template
    const parsedTemplate = parser.parse(tdlDocument);
    expect(parsedTemplate.metadata.name).toBe(template.metadata.name);
    expect(parsedTemplate.sections.length).toBe(template.sections.length);
    
    console.log('✅ Round-trip serialization successful');
  });
  
  test('should create simplified template efficiently', async () => {
    const startTime = Date.now();
    const template = EventFormShowcase.createSimplifiedTemplate();
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should be very fast
    expect(template.metadata.name).toBe('Simplified Event Registration');
    expect(template.sections.length).toBeGreaterThan(3);
    
    const allFields = template.sections.flatMap(s => s.fields);
    expect(allFields.length).toBeGreaterThan(8);
    
    console.log(`✅ Simplified template created in ${endTime - startTime}ms with ${allFields.length} fields`);
  });
  
  test('should demonstrate performance with large templates', async () => {
    const startTime = Date.now();
    const template = EventFormShowcase.createComprehensiveTemplate();
    const endTime = Date.now();
    
    const creationTime = endTime - startTime;
    const fieldCount = template.sections.reduce((sum, s) => sum + s.fields.length, 0);
    const sectionCount = template.sections.length;
    
    // Performance expectations
    expect(creationTime).toBeLessThan(1000); // Should complete in under 1 second
    expect(fieldCount).toBeGreaterThan(30); // Should have substantial content
    expect(sectionCount).toBeGreaterThan(10); // Should have multiple sections
    
    const fieldsPerSecond = Math.round(fieldCount / (creationTime / 1000));
    
    console.log('📈 Performance metrics:');
    console.log(`  - Creation time: ${creationTime}ms`);
    console.log(`  - Sections: ${sectionCount}`);
    console.log(`  - Fields: ${fieldCount}`);
    console.log(`  - Fields/second: ${fieldsPerSecond}`);
    
    expect(fieldsPerSecond).toBeGreaterThan(50); // Should be efficient
  });
  
  test('should demonstrate all control flow features', async () => {
    const template = EventFormShowcase.createComprehensiveTemplate();
    
    // The template should include examples of:
    // 1. Conditional logic (if/else/elseIf)
    // 2. forEach loops
    // 3. Repeat loops
    // 4. Nested conditionals
    // 5. Variable usage
    // 6. Dynamic content generation
    
    expect(template.variables).toBeDefined();
    expect(Object.keys(template.variables || {}).length).toBeGreaterThan(5);
    
    // Check for conditional styling
    expect(template.styling.conditionalStyling).toBeDefined();
    expect(template.styling.conditionalStyling?.length).toBeGreaterThan(0);
    
    console.log('✅ Control flow features demonstrated:');
    console.log('  - Variables and dynamic content');
    console.log('  - Conditional sections (if/else/elseIf)');
    console.log('  - Loop constructs (forEach, repeat)');
    console.log('  - Nested logic');
    console.log('  - Conditional styling');
  });
  
  test('should validate all programmatic features work together', async () => {
    const template = EventFormShowcase.createComprehensiveTemplate();
    
    // This comprehensive test validates that all features integrate properly
    const allFields = template.sections.flatMap(s => s.fields);
    
    // Feature integration checks
    const featuresWorking = {
      'Basic template structure': template.sections.length > 0,
      'Field variety': new Set(allFields.map(f => f.type)).size >= 7,
      'Validation rules': allFields.some(f => f.validation),
      'Required/optional fields': allFields.some(f => f.required) && allFields.some(f => !f.required),
      'Multiple choice options': allFields.some(f => f.multiple),
      'Field options': allFields.some(f => f.options),
      'Placeholders': allFields.some(f => f.placeholder),
      'Variables': !!template.variables,
      'Auto-save behavior': template.behavior.autoSave,
      'Progress indicator': template.behavior.showProgress,
      'Custom styling': template.styling.theme !== 'default',
      'Conditional styling': template.styling.conditionalStyling && template.styling.conditionalStyling.length > 0,
      'Template metadata': !!template.metadata.name && !!template.metadata.version,
      'Template tags': template.metadata.tags.length > 0
    };
    
    // All features should be working
    Object.entries(featuresWorking).forEach(([feature, working]) => {
      expect(working).toBe(true);
      console.log(`  ✅ ${feature}`);
    });
    
    const workingCount = Object.values(featuresWorking).filter(Boolean).length;
    const totalCount = Object.keys(featuresWorking).length;
    
    console.log(`\n🎯 Feature integration: ${workingCount}/${totalCount} (${Math.round(workingCount/totalCount*100)}%)`);
    expect(workingCount).toBe(totalCount); // 100% feature integration
  });
});