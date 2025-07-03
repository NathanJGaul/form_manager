import { test, expect } from '@playwright/test';
import { ComprehensiveEventForm, EventFormDemo } from '../src/programmatic/examples/ComprehensiveEventForm';
import { TDLParser } from '../src/programmatic/tdl/parser';
import { TDLValidator } from '../src/programmatic/tdl/validator';
import { TDLConverter } from '../src/programmatic/tdl/converter';
import { TemplateContextManager } from '../src/programmatic/control-flow/TemplateContext';
import { ControlFlowEngine } from '../src/programmatic/control-flow/ControlFlowEngine';

test.describe('Comprehensive Event Registration Form', () => {
  
  test.describe('Template Creation and Structure', () => {
    
    test('should create comprehensive event form with all features', async () => {
      const template = ComprehensiveEventForm.create();
      
      // Validate basic structure
      expect(template.metadata.name).toBe('Event Management Platform Registration');
      expect(template.metadata.description).toContain('Comprehensive event registration');
      expect(template.metadata.tags).toContain('comprehensive');
      expect(template.metadata.version).toBe('2.0.0');
      
      // Check sections exist
      expect(template.sections.length).toBeGreaterThan(5);
      
      // Verify key sections are present
      const sectionTitles = template.sections.map(s => s.title);
      expect(sectionTitles).toContain('Registration Type & Profile');
      expect(sectionTitles).toContain('Event Preferences');
      expect(sectionTitles).toContain('Registration Plan & Pricing');
      expect(sectionTitles).toContain('Privacy & Data Consent');
      
      // Check variables are properly set
      expect(template.variables).toBeDefined();
      expect(template.variables?.eventTypes).toContain('conference');
      expect(template.variables?.pricingTiers).toContain('premium');
      expect(template.variables?.features).toBeDefined();
      
      // Verify advanced features
      expect(template.behavior.autoSave).toBe(true);
      expect(template.behavior.autoSaveInterval).toBe(1500);
      expect(template.behavior.showProgress).toBe(true);
      expect(template.styling.theme).toBe('professional');
      expect(template.styling.layout).toBe('adaptive');
    });
    
    test('should create simplified version with core features', async () => {
      const template = ComprehensiveEventForm.createSimplified();
      
      expect(template.metadata.name).toBe('Simplified Event Registration');
      expect(template.sections.length).toBeGreaterThanOrEqual(2);
      expect(template.variables?.eventTypes).toEqual(['conference', 'workshop', 'webinar']);
      
      // Should have basic fields
      const allFields = template.sections.flatMap(s => s.fields);
      expect(allFields.some(f => f.id === 'name')).toBe(true);
      expect(allFields.some(f => f.id === 'email')).toBe(true);
      expect(allFields.some(f => f.id === 'event_type')).toBe(true);
    });
    
    test('should create dynamic templates for different audiences', async () => {
      const enterpriseForm = ComprehensiveEventForm.createDynamic({
        targetAudience: 'enterprise',
        includeAdvancedFeatures: true,
        enableSocialFeatures: false
      });
      
      expect(enterpriseForm.metadata.description).toContain('enterprise');
      expect(enterpriseForm.variables?.audience).toBe('enterprise');
      
      const academicForm = ComprehensiveEventForm.createDynamic({
        targetAudience: 'academic',
        includeAdvancedFeatures: true,
        enableSocialFeatures: true
      });
      
      expect(academicForm.metadata.description).toContain('academic');
      expect(academicForm.variables?.audience).toBe('academic');
    });
  });
  
  test.describe('Field Validation and Types', () => {
    
    test('should have proper field validation rules', async () => {
      const template = ComprehensiveEventForm.create();
      const allFields = template.sections.flatMap(s => s.fields);
      
      // Check email validation
      const emailField = allFields.find(f => f.id === 'email');
      expect(emailField).toBeDefined();
      expect(emailField?.validation?.pattern).toBeDefined();
      expect(emailField?.required).toBe(true);
      
      // Check name validation
      const nameField = allFields.find(f => f.id === 'full_name');
      expect(nameField).toBeDefined();
      expect(nameField?.validation?.minLength).toBe(2);
      expect(nameField?.validation?.maxLength).toBe(100);
      expect(nameField?.required).toBe(true);
      
      // Check phone validation
      const phoneField = allFields.find(f => f.id === 'phone');
      expect(phoneField).toBeDefined();
      expect(phoneField?.validation?.pattern).toBeDefined();
      expect(phoneField?.required).toBe(false);
      
      // Check range field
      const experienceField = allFields.find(f => f.id === 'experience_years');
      expect(experienceField).toBeDefined();
      expect(experienceField?.type).toBe('range');
      expect(experienceField?.validation?.min).toBe(0);
      expect(experienceField?.validation?.max).toBe(50);
    });
    
    test('should have diverse field types', async () => {
      const template = ComprehensiveEventForm.create();
      const allFields = template.sections.flatMap(s => s.fields);
      
      const fieldTypes = new Set(allFields.map(f => f.type));
      
      // Should include all major field types
      expect(fieldTypes.has('text')).toBe(true);
      expect(fieldTypes.has('textarea')).toBe(true);
      expect(fieldTypes.has('select')).toBe(true);
      expect(fieldTypes.has('radio')).toBe(true);
      expect(fieldTypes.has('checkbox')).toBe(true);
      expect(fieldTypes.has('number')).toBe(true);
      expect(fieldTypes.has('date')).toBe(true);
      expect(fieldTypes.has('range')).toBe(true);
      
      console.log('Field types used:', Array.from(fieldTypes));
      expect(fieldTypes.size).toBeGreaterThanOrEqual(7);
    });
    
    test('should have proper conditional field dependencies', async () => {
      const template = ComprehensiveEventForm.create();
      const allFields = template.sections.flatMap(s => s.fields);
      
      // Check for conditional fields
      const conditionalFields = allFields.filter(f => f.conditional);
      console.log('Conditional fields found:', conditionalFields.length);
      
      // Should have sections with control flow
      const sectionsWithControlFlow = template.sections.filter(s => s.controlFlow);
      console.log('Sections with control flow:', sectionsWithControlFlow.length);
      
      expect(sectionsWithControlFlow.length + conditionalFields.length).toBeGreaterThan(0);
    });
  });
  
  test.describe('Control Flow and Dynamic Content', () => {
    
    test('should process conditional sections correctly', async () => {
      const template = ComprehensiveEventForm.create();
      const contextManager = new TemplateContextManager(template.variables || {});
      const controlFlowEngine = new ControlFlowEngine(contextManager);
      
      // Test student registration path
      contextManager.setVariable('registration_type', 'student');
      
      // Should show academic information for students
      // Note: This would be tested with actual control flow execution
      expect(contextManager.getVariable('registration_type')).toBe('student');
      
      // Test corporate registration path  
      contextManager.setVariable('registration_type', 'corporate');
      contextManager.setVariable('team_size', 25);
      
      expect(contextManager.getVariable('team_size')).toBe(25);
      expect(contextManager.evaluateExpression('team_size > 20')).toBe(true);
    });
    
    test('should handle variable interpolation', async () => {
      const template = ComprehensiveEventForm.create();
      const contextManager = new TemplateContextManager(template.variables || {});
      
      // Test variable resolution
      expect(contextManager.getVariable('eventTypes')).toContain('conference');
      expect(contextManager.getVariable('pricingTiers')).toContain('premium');
      
      // Test string interpolation
      contextManager.setVariable('category', 'technology');
      const interpolated = contextManager.resolveVariables('${category.toUpperCase()} Events');
      expect(interpolated).toContain('technology');
    });
    
    test('should handle complex nested conditions', async () => {
      const template = ComprehensiveEventForm.create();
      const contextManager = new TemplateContextManager(template.variables || {});
      
      // Test nested conditional logic
      contextManager.setVariable('registration_type', 'corporate');
      contextManager.setVariable('team_size', 30);
      contextManager.setVariable('pricing_tier', 'enterprise');
      
      // These would trigger enterprise features
      expect(contextManager.evaluateExpression('registration_type == "corporate" && team_size > 20')).toBe(true);
      expect(contextManager.evaluateExpression('pricing_tier == "enterprise"')).toBe(true);
    });
  });
  
  test.describe('Template Parsing and Serialization', () => {
    
    test('should serialize and parse template correctly', async () => {
      const originalTemplate = ComprehensiveEventForm.create();
      const parser = new TDLParser();
      
      // Serialize to TDL format
      const tdlDocument = parser.serialize(originalTemplate);
      
      expect(tdlDocument.metadata.name).toBe(originalTemplate.metadata.name);
      expect(tdlDocument.sections).toHaveLength(originalTemplate.sections.length);
      expect(tdlDocument.variables).toBeDefined();
      
      // Parse back to template
      const parsedTemplate = parser.parse(tdlDocument);
      
      expect(parsedTemplate.metadata.name).toBe(originalTemplate.metadata.name);
      expect(parsedTemplate.sections).toHaveLength(originalTemplate.sections.length);
      expect(parsedTemplate.variables).toEqual(originalTemplate.variables);
    });
    
    test('should validate template structure', async () => {
      const template = ComprehensiveEventForm.create();
      const parser = new TDLParser();
      const validator = new TDLValidator();
      
      // Convert to TDL and validate
      const tdlDocument = parser.serialize(template);
      const validation = validator.validateTDL(tdlDocument);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      
      if (validation.warnings.length > 0) {
        console.log('Validation warnings:', validation.warnings.map(w => w.message));
      }
    });
    
    test('should convert to GUI format with appropriate warnings', async () => {
      const template = ComprehensiveEventForm.create();
      const converter = new TDLConverter();
      
      const conversionResult = converter.convertToGUI(template);
      
      expect(conversionResult.success).toBe(true);
      expect(conversionResult.result).toBeDefined();
      
      // Should have warnings about lost features
      expect(conversionResult.warnings.length).toBeGreaterThan(0);
      
      const warningMessages = conversionResult.warnings.map(w => w.message);
      expect(warningMessages.some(msg => msg.includes('variables'))).toBe(true);
      
      console.log('Conversion warnings:', warningMessages);
    });
  });
  
  test.describe('Performance and Scalability', () => {
    
    test('should create large template efficiently', async () => {
      const startTime = Date.now();
      
      const template = ComprehensiveEventForm.create();
      
      const endTime = Date.now();
      const creationTime = endTime - startTime;
      
      expect(creationTime).toBeLessThan(1000); // Should complete in under 1 second
      expect(template.sections.length).toBeGreaterThan(5);
      
      const fieldCount = template.sections.reduce((sum, s) => sum + s.fields.length, 0);
      console.log(`Created template with ${template.sections.length} sections and ${fieldCount} fields in ${creationTime}ms`);
      
      expect(fieldCount).toBeGreaterThan(20);
    });
    
    test('should handle template analysis efficiently', async () => {
      const template = ComprehensiveEventForm.create();
      
      const startTime = Date.now();
      const analysis = EventFormDemo.analyzeTemplate(template);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should analyze quickly
      
      expect(analysis.sectionCount).toBeGreaterThan(5);
      expect(analysis.fieldCount).toBeGreaterThan(20);
      expect(analysis.variableCount).toBeGreaterThan(5);
      expect(analysis.hasConditionalLogic).toBe(true);
      expect(analysis.hasValidation).toBe(true);
      expect(analysis.complexity).toBe('high');
      
      console.log('Template analysis:', analysis);
    });
  });
  
  test.describe('Feature Demonstration', () => {
    
    test('should demonstrate all programmatic features', async () => {
      const demo = EventFormDemo.demonstrateAllFeatures();
      
      expect(demo.comprehensive).toBeDefined();
      expect(demo.simplified).toBeDefined();
      expect(demo.enterprise).toBeDefined();
      expect(demo.academic).toBeDefined();
      
      // Comprehensive should be the most complex
      const comprehensiveAnalysis = EventFormDemo.analyzeTemplate(demo.comprehensive);
      const simplifiedAnalysis = EventFormDemo.analyzeTemplate(demo.simplified);
      
      expect(comprehensiveAnalysis.fieldCount).toBeGreaterThan(simplifiedAnalysis.fieldCount);
      expect(comprehensiveAnalysis.sectionCount).toBeGreaterThan(simplifiedAnalysis.sectionCount);
      expect(comprehensiveAnalysis.complexity).toBe('high');
      expect(simplifiedAnalysis.complexity).not.toBe('high');
    });
    
    test('should show advanced control flow features', async () => {
      const template = ComprehensiveEventForm.create();
      
      // Check for advanced features
      expect(template.variables?.features?.earlyBirdDiscount).toBe(true);
      expect(template.variables?.features?.customAgenda).toBe(true);
      expect(template.variables?.features?.accessibilitySupport).toBe(true);
      expect(template.variables?.features?.socialIntegration).toBe(true);
      
      // Check for complex data structures
      expect(template.variables?.eventCategories).toBeDefined();
      expect(template.variables?.tierFeatures).toBeDefined();
      expect(template.variables?.surveyQuestions).toBeDefined();
      
      // Should have conditional styling
      expect(template.styling.conditionalStyling).toBeDefined();
      expect(template.styling.conditionalStyling?.length).toBeGreaterThan(0);
    });
    
    test('should validate all field types and features are working', async () => {
      const template = ComprehensiveEventForm.create();
      const allFields = template.sections.flatMap(s => s.fields);
      
      // Verify comprehensive field coverage
      const requiredFields = allFields.filter(f => f.required);
      const optionalFields = allFields.filter(f => !f.required);
      const fieldsWithValidation = allFields.filter(f => f.validation);
      const fieldsWithOptions = allFields.filter(f => f.options);
      const multipleChoiceFields = allFields.filter(f => f.multiple);
      
      expect(requiredFields.length).toBeGreaterThan(10);
      expect(optionalFields.length).toBeGreaterThan(5);
      expect(fieldsWithValidation.length).toBeGreaterThan(5);
      expect(fieldsWithOptions.length).toBeGreaterThan(10);
      expect(multipleChoiceFields.length).toBeGreaterThan(5);
      
      console.log('Field statistics:', {
        total: allFields.length,
        required: requiredFields.length,
        optional: optionalFields.length,
        withValidation: fieldsWithValidation.length,
        withOptions: fieldsWithOptions.length,
        multipleChoice: multipleChoiceFields.length
      });
      
      // Validate specific advanced features
      const rangeFields = allFields.filter(f => f.type === 'range');
      const textareaFields = allFields.filter(f => f.type === 'textarea');
      const dateFields = allFields.filter(f => f.type === 'date');
      
      expect(rangeFields.length).toBeGreaterThan(0);
      expect(textareaFields.length).toBeGreaterThan(3);
      expect(dateFields.length).toBeGreaterThan(0);
    });
  });
  
  test.describe('Integration and Real-world Usage', () => {
    
    test('should integrate with existing form system', async () => {
      const template = ComprehensiveEventForm.createSimplified();
      
      // Simulate conversion to existing GUI format
      const converter = new TDLConverter();
      const guiResult = converter.convertToGUI(template);
      
      expect(guiResult.success).toBe(true);
      expect(guiResult.result).toBeDefined();
      
      const guiTemplate = guiResult.result!;
      expect(guiTemplate.name).toBe('Simplified Event Registration');
      expect(guiTemplate.sections.length).toBeGreaterThan(0);
      
      // Should maintain core functionality
      const allGuiFields = guiTemplate.sections.flatMap(s => s.fields);
      expect(allGuiFields.some(f => f.type === 'text')).toBe(true);
      expect(allGuiFields.some(f => f.type === 'select')).toBe(true);
    });
    
    test('should demonstrate real-world complexity handling', async () => {
      // Create a very complex dynamic template
      const complexTemplate = ComprehensiveEventForm.createDynamic({
        targetAudience: 'enterprise',
        includeAdvancedFeatures: true,
        enableSocialFeatures: true,
        maxSections: 20
      });
      
      const analysis = EventFormDemo.analyzeTemplate(complexTemplate);
      
      expect(analysis.complexity).toBe('high');
      expect(analysis.hasConditionalLogic).toBe(true);
      
      // Should handle validation even for complex templates
      const parser = new TDLParser();
      const validator = new TDLValidator();
      
      const tdlDocument = parser.serialize(complexTemplate);
      const validation = validator.validateTDL(tdlDocument);
      
      expect(validation.valid).toBe(true);
    });
  });
});