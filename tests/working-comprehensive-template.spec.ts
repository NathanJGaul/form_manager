import { test, expect } from '@playwright/test';
import { WorkingComprehensiveTemplate } from '../src/programmatic/examples/WorkingComprehensiveTemplate';

test.describe('Working Comprehensive Template', () => {
  test('should create comprehensive template successfully', async () => {
    console.log('🚀 Creating working comprehensive template...');
    
    const template = WorkingComprehensiveTemplate.create();
    
    expect(template).toBeDefined();
    expect(template.metadata.name).toBe('Working Comprehensive Event Registration');
    expect(template.sections).toBeDefined();
    expect(template.sections.length).toBeGreaterThan(0);
    
    console.log(`✅ Template created with ${template.sections.length} sections`);
    
    // Count total fields
    const totalFields = template.sections.reduce((sum, section) => sum + section.fields.length, 0);
    console.log(`📊 Total fields: ${totalFields}`);
    
    expect(totalFields).toBeGreaterThan(20);
  });
  
  test('should have all major field types', async () => {
    const template = WorkingComprehensiveTemplate.create();
    
    // Collect all field types
    const fieldTypes = new Set<string>();
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        fieldTypes.add(field.type);
      });
    });
    
    console.log('Field types found:', Array.from(fieldTypes));
    
    // Check for major field types
    expect(fieldTypes.has('text')).toBe(true);
    expect(fieldTypes.has('email')).toBe(true);
    expect(fieldTypes.has('tel')).toBe(true);
    expect(fieldTypes.has('select')).toBe(true);
    expect(fieldTypes.has('checkbox')).toBe(true);
    expect(fieldTypes.has('radio')).toBe(true);
    expect(fieldTypes.has('range')).toBe(true);
    expect(fieldTypes.has('date')).toBe(true);
    expect(fieldTypes.has('time')).toBe(true);
    expect(fieldTypes.has('number')).toBe(true);
    expect(fieldTypes.has('textarea')).toBe(true);
    expect(fieldTypes.has('url')).toBe(true);
    expect(fieldTypes.has('file')).toBe(true);
    
    expect(fieldTypes.size).toBeGreaterThanOrEqual(13);
  });
  
  test('should have proper field validation', async () => {
    const template = WorkingComprehensiveTemplate.create();
    
    // Find specific fields with validation
    const allFields = template.sections.flatMap(section => section.fields);
    
    // Check name field validation
    const nameField = allFields.find(f => f.id === 'full_name');
    expect(nameField).toBeDefined();
    expect(nameField?.required).toBe(true);
    expect(nameField?.validation?.pattern).toBe('^[a-zA-Z\\s\\-\\.]+$');
    
    // Check range field validation
    const rangeField = allFields.find(f => f.id === 'experience_years');
    expect(rangeField).toBeDefined();
    expect(rangeField?.validation?.min).toBe(0);
    expect(rangeField?.validation?.max).toBe(50);
    
    // Check number field validation
    const numberField = allFields.find(f => f.id === 'attendee_count');
    expect(numberField).toBeDefined();
    expect(numberField?.validation?.min).toBe(1);
    expect(numberField?.validation?.max).toBe(100);
    
    console.log('✅ Field validation checks passed');
  });
  
  test('should have dynamic sections from forEach', async () => {
    const template = WorkingComprehensiveTemplate.create();
    
    // Check for dynamic sections created by forEach
    const dynamicSections = template.sections.filter(section => 
      section.title.includes('MORNING') || 
      section.title.includes('AFTERNOON') || 
      section.title.includes('EVENING')
    );
    
    expect(dynamicSections.length).toBe(3);
    
    // Each dynamic section should have a field
    dynamicSections.forEach(section => {
      expect(section.fields.length).toBeGreaterThan(0);
    });
    
    console.log('✅ Dynamic sections created successfully');
  });
  
  test('should have conditional sections', async () => {
    const template = WorkingComprehensiveTemplate.create();
    
    // Check for conditional content in controlFlow
    expect(template.controlFlow).toBeDefined();
    
    console.log('✅ Conditional sections found');
  });
  
  test('should have template variables', async () => {
    const template = WorkingComprehensiveTemplate.create();
    
    expect(template.variables).toBeDefined();
    expect(template.variables?.eventTypes).toBeDefined();
    expect(template.variables?.industries).toBeDefined();
    expect(template.variables?.pricing).toBeDefined();
    expect(template.variables?.features).toBeDefined();
    
    console.log('✅ Template variables configured');
  });
  
  test('should create simple template for basic testing', async () => {
    const template = WorkingComprehensiveTemplate.createSimple();
    
    expect(template).toBeDefined();
    expect(template.metadata.name).toBe('Simple Working Template');
    expect(template.sections.length).toBe(1);
    expect(template.sections[0].fields.length).toBe(2);
    
    console.log('✅ Simple template created successfully');
  });
  
  test('should demonstrate all programmatic features', async () => {
    const template = WorkingComprehensiveTemplate.create();
    
    // Feature checklist
    const features = {
      templateBuilder: template.metadata.name ? true : false,
      variables: template.variables ? true : false,
      sections: template.sections.length > 0,
      fields: template.sections.some(s => s.fields.length > 0),
      validation: template.sections.some(s => s.fields.some(f => f.validation)),
      conditionals: template.controlFlow ? true : false,
      dynamicContent: template.sections.some(s => s.title.includes('MORNING')),
      multipleFieldTypes: new Set(template.sections.flatMap(s => s.fields.map(f => f.type))).size >= 10,
      requiredFields: template.sections.some(s => s.fields.some(f => f.required)),
      optionalFields: template.sections.some(s => s.fields.some(f => !f.required)),
    };
    
    console.log('Features demonstrated:', features);
    
    // Verify all features are present
    Object.entries(features).forEach(([, present]) => {
      expect(present).toBe(true);
    });
    
    console.log('✅ All programmatic features demonstrated successfully');
  });
});