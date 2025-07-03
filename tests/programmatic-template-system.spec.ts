import { test, expect } from '@playwright/test';
import { TemplateBuilder } from '../src/programmatic/builder/TemplateBuilder';
import { TDLParser } from '../src/programmatic/tdl/parser';
import { TDLValidator } from '../src/programmatic/tdl/validator';
import { TDLConverter } from '../src/programmatic/tdl/converter';
import { TemplateContextManager } from '../src/programmatic/control-flow/TemplateContext';
import { ControlFlowEngine } from '../src/programmatic/control-flow/ControlFlowEngine';
import { ConditionEvaluator } from '../src/programmatic/control-flow/ConditionEvaluator';
import { CommonTemplates } from '../src/programmatic/library/CommonTemplates';
import { ProgrammaticTemplate, TemplateError } from '../src/programmatic/types';

test.describe('Programmatic Template System - Phase 1', () => {
  
  test.describe('Template Builder API', () => {
    
    test('should create a basic template with fluent API', async () => {
      const template = new TemplateBuilder()
        .create('Test Template')
        .description('A test template')
        .author('test-user')
        .tags('test', 'basic')
        .section('Contact Info')
          .field('text', 'Name')
            .id('name')
            .required()
            .placeholder('Enter your name')
            .end()
          .field('text', 'Email')
            .id('email')
            .required()
            .pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
            .end()
        .autoSave(2000)
        .build();

      expect(template.metadata.name).toBe('Test Template');
      expect(template.metadata.description).toBe('A test template');
      expect(template.metadata.author).toBe('test-user');
      expect(template.metadata.tags).toContain('test');
      expect(template.metadata.tags).toContain('basic');
      expect(template.sections).toHaveLength(1);
      expect(template.sections[0].title).toBe('Contact Info');
      expect(template.sections[0].fields).toHaveLength(2);
      expect(template.behavior.autoSave).toBe(true);
      expect(template.behavior.autoSaveInterval).toBe(2000);
    });

    test('should support conditional logic in templates', async () => {
      const template = new TemplateBuilder()
        .create('Conditional Template')
        .section('User Type')
          .field('select', 'Are you a customer?')
            .id('is_customer')
            .required()
            .options(['yes', 'no'])
            .end()
        .if('is_customer == "yes"')
          .then(builder =>
            builder.section('Customer Info')
              .field('text', 'Customer ID')
                .id('customer_id')
                .required()
                .end()
          )
        .endif()
        .build();

      expect(template.sections).toHaveLength(1);
      // Conditional sections are handled by control flow, not added directly
      expect(template.sections[0].title).toBe('User Type');
    });

    test('should support forEach loops', async () => {
      const categories = ['product', 'service', 'support'];
      
      const template = new TemplateBuilder()
        .create('Loop Template')
        .variables({ categories })
        .forEach(categories, (category, index, builder) => {
          builder.section(`${category.toUpperCase()} Feedback`)
            .field('radio', `Rate our ${category}`)
              .id(`${category}_rating`)
              .required()
              .options(['1', '2', '3', '4', '5']);
        })
        .build();

      expect(template.variables?.categories).toEqual(categories);
      expect(template.sections).toHaveLength(3);
      expect(template.sections[0].title).toBe('PRODUCT Feedback');
      expect(template.sections[1].title).toBe('SERVICE Feedback');
      expect(template.sections[2].title).toBe('SUPPORT Feedback');
    });

    test('should support repeat loops', async () => {
      const template = new TemplateBuilder()
        .create('Repeat Template')
        .repeat(3, (index, builder) => {
          builder.section(`Section ${index + 1}`)
            .field('text', `Question ${index + 1}`)
              .id(`question_${index + 1}`)
              .required();
        })
        .build();

      expect(template.sections).toHaveLength(3);
      expect(template.sections[0].title).toBe('Section 1');
      expect(template.sections[1].title).toBe('Section 2');
      expect(template.sections[2].title).toBe('Section 3');
    });

    test('should validate template structure', async () => {
      const builder = new TemplateBuilder()
        .create('Validation Test')
        .section('Test Section')
          .field('text', 'Test Field')
            .id('test_field')
            .required();

      const validation = builder.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect validation errors', async () => {
      const builder = new TemplateBuilder()
        .create(''); // Empty name should cause validation error

      const validation = builder.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0].message).toContain('name is required');
    });
  });

  test.describe('Control Flow Engine', () => {
    
    test('should evaluate simple conditions', async () => {
      const contextManager = new TemplateContextManager({ user_type: 'customer' });
      const conditionEvaluator = new ConditionEvaluator(contextManager);

      const condition = ConditionEvaluator.parseConditionString('user_type == "customer"');
      const result = conditionEvaluator.evaluate(condition);
      
      expect(result).toBe(true);
    });

    test('should handle variable scoping', async () => {
      const contextManager = new TemplateContextManager({ global_var: 'global' });
      
      // Create scope with local variable
      contextManager.createScope({ local_var: 'local' });
      
      expect(contextManager.getVariable('global_var')).toBe('global');
      expect(contextManager.getVariable('local_var')).toBe('local');
      
      // Exit scope
      contextManager.exitScope();
      
      expect(contextManager.getVariable('global_var')).toBe('global');
      expect(contextManager.getVariable('local_var')).toBeUndefined();
    });

    test('should execute forEach loops', async () => {
      const contextManager = new TemplateContextManager({ 
        categories: ['a', 'b', 'c'] 
      });
      const controlFlowEngine = new ControlFlowEngine(contextManager);

      const loopBlock = {
        type: 'forEach' as const,
        array: 'categories',
        variable: 'category',
        body: [
          {
            type: 'setVariable' as const,
            data: { name: 'current', value: 'processed' }
          }
        ]
      };

      const results = controlFlowEngine.executeLoop(loopBlock);
      expect(results).toHaveLength(3);
    });

    test('should execute conditional blocks', async () => {
      const contextManager = new TemplateContextManager({ score: 85 });
      const controlFlowEngine = new ControlFlowEngine(contextManager);

      const conditionalBlock = {
        if: { type: 'expression' as const, expression: 'score >= 80' },
        then: [
          { type: 'setVariable' as const, data: { name: 'grade', value: 'A' } }
        ],
        else: [
          { type: 'setVariable' as const, data: { name: 'grade', value: 'B' } }
        ]
      };

      const results = controlFlowEngine.executeConditional(conditionalBlock);
      expect(results).toHaveLength(1);
      expect(results[0].data.value).toBe('A');
    });

    test('should prevent infinite loops', async () => {
      const contextManager = new TemplateContextManager();
      const controlFlowEngine = new ControlFlowEngine(contextManager, 10); // Low limit for testing

      const loopBlock = {
        type: 'while' as const,
        condition: { type: 'expression' as const, expression: 'true' }, // Infinite condition
        body: [
          { type: 'setVariable' as const, data: { name: 'counter', value: 1 } }
        ]
      };

      await expect(async () => {
        controlFlowEngine.executeLoop(loopBlock);
      }).rejects.toThrow('exceeded maximum iterations');
    });
  });

  test.describe('TDL Parser and Validator', () => {
    
    test('should parse valid TDL document', async () => {
      const tdlDocument = {
        metadata: {
          name: 'Test Template',
          version: '1.0.0',
          description: 'A test template',
          author: 'test-user',
          tags: ['test']
        },
        sections: [
          {
            id: 'section1',
            title: 'Test Section',
            fields: [
              {
                id: 'field1',
                type: 'text',
                label: 'Test Field',
                required: true
              }
            ]
          }
        ]
      };

      const parser = new TDLParser();
      const template = parser.parse(tdlDocument);

      expect(template.metadata.name).toBe('Test Template');
      expect(template.sections).toHaveLength(1);
      expect(template.sections[0].fields).toHaveLength(1);
    });

    test('should validate TDL document structure', async () => {
      const validator = new TDLValidator();
      
      const validDocument = {
        metadata: {
          name: 'Valid Template',
          version: '1.0.0',
          description: 'Valid',
          author: 'test',
          tags: ['test']
        },
        sections: [
          {
            id: 'section1',
            title: 'Section 1',
            fields: [
              {
                id: 'field1',
                type: 'text',
                label: 'Field 1',
                required: true
              }
            ]
          }
        ]
      };

      const validation = validator.validateTDL(validDocument);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect validation errors in TDL', async () => {
      const validator = new TDLValidator();
      
      const invalidDocument = {
        metadata: {
          // Missing required name field
          version: '1.0.0',
          description: 'Invalid',
          author: 'test',
          tags: ['test']
        },
        sections: [] // Empty sections
      };

      const validation = validator.validateTDL(invalidDocument);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    test('should serialize template back to TDL', async () => {
      const template = new TemplateBuilder()
        .create('Serialize Test')
        .description('Test serialization')
        .section('Test Section')
          .field('text', 'Test Field')
            .id('test_field')
            .required()
            .end()
        .build();

      const parser = new TDLParser();
      const tdlDocument = parser.serialize(template);

      expect(tdlDocument.metadata.name).toBe('Serialize Test');
      expect(tdlDocument.sections).toHaveLength(1);
      expect(tdlDocument.sections[0].fields).toHaveLength(1);
    });
  });

  test.describe('Template Conversion', () => {
    
    test('should convert GUI template to programmatic template', async () => {
      const guiTemplate = {
        id: 'gui-template-1',
        name: 'GUI Template',
        description: 'Converted from GUI',
        sections: [
          {
            id: 'section1',
            title: 'Section 1',
            fields: [
              {
                id: 'field1',
                type: 'text' as const,
                label: 'Field 1',
                required: true,
                placeholder: 'Enter text'
              }
            ]
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const converter = new TDLConverter();
      const result = converter.convertFromGUI(guiTemplate);

      expect(result.success).toBe(true);
      expect(result.result?.metadata.name).toBe('GUI Template');
      expect(result.result?.sections).toHaveLength(1);
    });

    test('should convert programmatic template to GUI template', async () => {
      const programmaticTemplate = new TemplateBuilder()
        .create('Programmatic Template')
        .description('To be converted to GUI')
        .section('Test Section')
          .field('text', 'Test Field')
            .id('test_field')
            .required()
        .build();

      const converter = new TDLConverter();
      const result = converter.convertToGUI(programmaticTemplate);

      expect(result.success).toBe(true);
      expect(result.result?.name).toBe('Programmatic Template');
      expect(result.result?.sections).toHaveLength(1);
    });

    test('should warn about feature loss during conversion', async () => {
      const programmaticTemplate = new TemplateBuilder()
        .create('Complex Template')
        .variables({ test: 'value' }) // This will be lost in GUI conversion
        .section('Test Section')
          .field('text', 'Test Field')
            .id('test_field')
            .required()
        .build();

      const converter = new TDLConverter();
      const result = converter.convertToGUI(programmaticTemplate);

      expect(result.success).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].message).toContain('variables will be lost');
    });
  });

  test.describe('Common Templates Library', () => {
    
    test('should create contact form template', async () => {
      const contactForm = CommonTemplates.createContactForm();
      
      expect(contactForm.metadata.name).toBe('Contact Form');
      expect(contactForm.sections).toHaveLength(1);
      expect(contactForm.sections[0].title).toBe('Contact Information');
      
      const fields = contactForm.sections[0].fields;
      expect(fields.some(f => f.id === 'full_name')).toBe(true);
      expect(fields.some(f => f.id === 'email')).toBe(true);
      expect(fields.some(f => f.id === 'message')).toBe(true);
    });

    test('should create survey template with dynamic sections', async () => {
      const survey = CommonTemplates.createSurveyTemplate();
      
      expect(survey.metadata.name).toBe('Customer Satisfaction Survey');
      expect(survey.variables?.categories).toEqual(['product', 'service', 'support']);
      expect(survey.sections.length).toBeGreaterThan(1);
    });

    test('should create registration form template', async () => {
      const registration = CommonTemplates.createRegistrationForm();
      
      expect(registration.metadata.name).toBe('User Registration Form');
      expect(registration.sections.length).toBeGreaterThanOrEqual(3);
      
      const allFields = registration.sections.flatMap(s => s.fields);
      expect(allFields.some(f => f.id === 'username')).toBe(true);
      expect(allFields.some(f => f.id === 'email')).toBe(true);
      expect(allFields.some(f => f.id === 'password')).toBe(true);
    });

    test('should list available templates', async () => {
      const templateNames = CommonTemplates.listTemplates();
      
      expect(templateNames).toContain('contact');
      expect(templateNames).toContain('survey');
      expect(templateNames).toContain('registration');
      expect(templateNames).toContain('feedback');
    });

    test('should get template by name', async () => {
      const template = CommonTemplates.getTemplate('contact');
      
      expect(template).not.toBeNull();
      expect(template?.metadata.name).toBe('Contact Form');
    });

    test('should return null for unknown template', async () => {
      const template = CommonTemplates.getTemplate('unknown');
      
      expect(template).toBeNull();
    });
  });

  test.describe('Integration Tests', () => {
    
    test('should create complex template with all features', async () => {
      const template = new TemplateBuilder()
        .create('Complete Feature Test')
        .description('Testing all programmatic features')
        .author('integration-test')
        .tags('test', 'integration', 'complete')
        .variables({
          categories: ['basic', 'advanced'],
          ratings: [1, 2, 3, 4, 5]
        })
        .section('User Classification')
          .field('select', 'User Level')
            .id('user_level')
            .required()
            .options(['beginner', 'intermediate', 'expert'])
        .if('user_level == "expert"')
          .then(builder =>
            builder.section('Expert Questions')
              .field('textarea', 'Technical Details')
                .id('technical_details')
                .required()
                .minLength(100)
          )
        .endif()
        .forEach(['basic', 'advanced'], (category, index, builder) => {
          builder.section(`${category.toUpperCase()} Assessment`)
            .field('radio', `${category} Rating`)
              .id(`${category}_rating`)
              .required()
              .options(['1', '2', '3', '4', '5']);
        })
        .repeat(2, (index, builder) => {
          builder.section(`Additional Section ${index + 1}`)
            .field('text', `Additional Field ${index + 1}`)
              .id(`additional_${index + 1}`)
              .optional();
        })
        .autoSave(1500)
        .showProgress()
        .styling({
          theme: 'modern',
          layout: 'adaptive',
          spacing: 'comfortable'
        })
        .build();

      // Validate the complete template
      const validation = template.validate();
      expect(validation.valid).toBe(true);

      // Check all features are present
      expect(template.metadata.name).toBe('Complete Feature Test');
      expect(template.variables?.categories).toEqual(['basic', 'advanced']);
      expect(template.sections.length).toBeGreaterThan(3);
      expect(template.behavior.autoSave).toBe(true);
      expect(template.behavior.showProgress).toBe(true);
      expect(template.styling.theme).toBe('modern');
    });

    test('should handle nested control flow', async () => {
      const template = new TemplateBuilder()
        .create('Nested Control Flow Test')
        .section('Outer Section')
          .field('select', 'Category')
            .id('category')
            .required()
            .options(['A', 'B', 'C'])
        .forEach(['A', 'B', 'C'], (category, index, builder) => {
          builder.if(`category == "${category}"`)
            .then(innerBuilder =>
              innerBuilder.section(`${category} Details`)
                .repeat(2, (repeatIndex, repeatBuilder) => {
                  repeatBuilder.field('text', `${category} Field ${repeatIndex + 1}`)
                    .id(`${category.toLowerCase()}_field_${repeatIndex + 1}`)
                    .required();
                })
            )
          .endif();
        })
        .build();

      expect(template.sections.length).toBeGreaterThan(1);
      const validation = template.validate();
      expect(validation.valid).toBe(true);
    });

    test('should serialize and parse roundtrip correctly', async () => {
      const originalTemplate = new TemplateBuilder()
        .create('Roundtrip Test')
        .description('Testing serialization roundtrip')
        .section('Test Section')
          .field('text', 'Test Field')
            .id('test_field')
            .required()
            .placeholder('Test placeholder')
        .autoSave(2000)
        .build();

      // Serialize to TDL
      const parser = new TDLParser();
      const tdlDocument = parser.serialize(originalTemplate);

      // Parse back to template
      const parsedTemplate = parser.parse(tdlDocument);

      // Compare key properties
      expect(parsedTemplate.metadata.name).toBe(originalTemplate.metadata.name);
      expect(parsedTemplate.metadata.description).toBe(originalTemplate.metadata.description);
      expect(parsedTemplate.sections).toHaveLength(originalTemplate.sections.length);
      expect(parsedTemplate.sections[0].title).toBe(originalTemplate.sections[0].title);
      expect(parsedTemplate.sections[0].fields).toHaveLength(originalTemplate.sections[0].fields.length);
      expect(parsedTemplate.behavior.autoSave).toBe(originalTemplate.behavior.autoSave);
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    
    test('should handle empty template creation', async () => {
      const template = new TemplateBuilder().build();
      
      const validation = template.validate();
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.message.includes('name is required'))).toBe(true);
    });

    test('should handle invalid field types gracefully', async () => {
      const tdlDocument = {
        metadata: {
          name: 'Invalid Field Type Test',
          version: '1.0.0',
          description: 'Test',
          author: 'test',
          tags: ['test']
        },
        sections: [
          {
            id: 'section1',
            title: 'Section 1',
            fields: [
              {
                id: 'field1',
                type: 'invalid_type', // Invalid type
                label: 'Field 1'
              }
            ]
          }
        ]
      };

      const parser = new TDLParser();
      const template = parser.parse(tdlDocument);
      
      // Should default to 'text' type
      expect(template.sections[0].fields[0].type).toBe('text');
    });

    test('should handle malformed condition strings', async () => {
      const contextManager = new TemplateContextManager();
      const conditionEvaluator = new ConditionEvaluator(contextManager);

      const condition = ConditionEvaluator.parseConditionString('invalid condition syntax');
      
      // Should not throw, but return false
      const result = conditionEvaluator.evaluate(condition);
      expect(typeof result).toBe('boolean');
    });

    test('should handle conversion of unsupported features', async () => {
      const programmaticTemplate = new TemplateBuilder()
        .create('Unsupported Features Test')
        .section('Test Section')
          .field('range', 'Range Field') // Range type not supported in GUI
            .id('range_field')
            .min(1)
            .max(10)
        .build();

      const converter = new TDLConverter();
      const result = converter.convertToGUI(programmaticTemplate);

      expect(result.success).toBe(true);
      // Range type should be converted to number
      expect(result.result?.sections[0].fields[0].type).toBe('number');
    });
  });
});

// Performance tests
test.describe('Performance Tests', () => {
  
  test('should handle large templates efficiently', async () => {
    const startTime = Date.now();
    
    const builder = new TemplateBuilder()
      .create('Large Template Performance Test');

    // Create 50 sections with 10 fields each
    for (let sectionIndex = 0; sectionIndex < 50; sectionIndex++) {
      const section = builder.section(`Section ${sectionIndex + 1}`);
      
      for (let fieldIndex = 0; fieldIndex < 10; fieldIndex++) {
        section.field('text', `Field ${fieldIndex + 1}`)
          .id(`section_${sectionIndex}_field_${fieldIndex}`)
          .required();
      }
    }

    const template = builder.build();
    const endTime = Date.now();
    
    expect(template.sections).toHaveLength(50);
    expect(template.sections[0].fields).toHaveLength(10);
    expect(endTime - startTime).toBeLessThan(1000); // Should complete in under 1 second
  });

  test('should handle complex control flow efficiently', async () => {
    const startTime = Date.now();

    const template = new TemplateBuilder()
      .create('Complex Control Flow Performance Test')
      .variables({ 
        categories: Array.from({ length: 20 }, (_, i) => `category_${i}`) 
      })
      .forEach(Array.from({ length: 20 }, (_, i) => `category_${i}`), (category, index, builder) => {
        builder.section(`${category} Section`)
          .if(`index == ${index}`)
            .then(innerBuilder =>
              innerBuilder.repeat(5, (repeatIndex, repeatBuilder) => {
                repeatBuilder.field('text', `${category} Field ${repeatIndex}`)
                  .id(`${category}_field_${repeatIndex}`)
                  .required();
              })
            )
          .endif();
      })
      .build();

    const endTime = Date.now();
    
    expect(template.sections.length).toBeGreaterThan(15);
    expect(endTime - startTime).toBeLessThan(2000); // Should complete in under 2 seconds
  });
});