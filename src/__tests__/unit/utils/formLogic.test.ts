import { describe, it, expect } from 'vitest';
import {
  evaluateCondition,
  getVisibleSections,
  getVisibleFields,
  calculateProgress,
  validateField,
  updateConditionalFieldsAsNull,
} from '@/utils/formLogic';
import { fieldFactory, sectionFactory, templateFactory } from '../../test-utils/factories/template.factory';
import { ConditionalLogic } from '@/types/conditional';

describe('formLogic', () => {
  describe('evaluateCondition', () => {
    describe('equals operator', () => {
      it('should return true when value equals', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'age',
          values: ['18+'],
          operator: 'equals',
        };
        const formData = { age: '18+' };
        
        expect(evaluateCondition(condition, formData)).toBe(true);
      });

      it('should return false when value does not equal', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'age',
          values: ['18+'],
          operator: 'equals',
        };
        const formData = { age: 'under-18' };
        
        expect(evaluateCondition(condition, formData)).toBe(false);
      });

      it('should handle multiple values (OR logic)', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'color',
          values: ['red', 'blue', 'green'],
          operator: 'equals',
        };
        
        expect(evaluateCondition(condition, { color: 'blue' })).toBe(true);
        expect(evaluateCondition(condition, { color: 'yellow' })).toBe(false);
      });
    });

    describe('not_equals operator', () => {
      it('should return true when value does not equal', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'status',
          values: ['inactive'],
          operator: 'not_equals',
        };
        const formData = { status: 'active' };
        
        expect(evaluateCondition(condition, formData)).toBe(true);
      });

      it('should return false when value equals', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'status',
          values: ['inactive'],
          operator: 'not_equals',
        };
        const formData = { status: 'inactive' };
        
        expect(evaluateCondition(condition, formData)).toBe(false);
      });
    });

    describe('contains operator', () => {
      it('should work with string values', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'description',
          values: ['urgent'],
          operator: 'contains',
        };
        
        expect(evaluateCondition(condition, { description: 'This is an urgent request' })).toBe(true);
        expect(evaluateCondition(condition, { description: 'Normal request' })).toBe(false);
      });

      it('should work with array values', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'tags',
          values: ['important'],
          operator: 'contains',
        };
        
        expect(evaluateCondition(condition, { tags: ['urgent', 'important', 'review'] })).toBe(true);
        expect(evaluateCondition(condition, { tags: ['normal', 'low-priority'] })).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false for null/undefined dependent values', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'field',
          values: ['value'],
          operator: 'equals',
        };
        
        expect(evaluateCondition(condition, {})).toBe(false);
        expect(evaluateCondition(condition, { field: null })).toBe(false);
        expect(evaluateCondition(condition, { field: undefined })).toBe(false);
      });

      it('should handle empty string values', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'field',
          values: [''],
          operator: 'equals',
        };
        
        expect(evaluateCondition(condition, { field: '' })).toBe(true);
        expect(evaluateCondition(condition, { field: 'something' })).toBe(false);
      });

      it('should handle boolean values', () => {
        const condition: ConditionalLogic = {
          dependsOn: 'isActive',
          values: ['true'],
          operator: 'equals',
        };
        
        expect(evaluateCondition(condition, { isActive: true })).toBe(true);
        expect(evaluateCondition(condition, { isActive: false })).toBe(false);
      });
    });
  });

  describe('getVisibleSections', () => {
    it('should return all sections when no conditions', () => {
      const sections = [
        sectionFactory.build({ id: 'section-1' }),
        sectionFactory.build({ id: 'section-2' }),
      ];
      
      const visible = getVisibleSections(sections, {});
      expect(visible).toHaveLength(2);
    });

    it('should filter sections based on conditions', () => {
      const sections = [
        sectionFactory.build({ id: 'section-1' }),
        sectionFactory.withConditional(
          sectionFactory.build({ id: 'section-2' }),
          {
            dependsOn: 'showSection',
            values: ['yes'],
            operator: 'equals',
          }
        ),
      ];
      
      const visibleNo = getVisibleSections(sections, { showSection: 'no' });
      expect(visibleNo).toHaveLength(1);
      expect(visibleNo[0].id).toBe('section-1');
      
      const visibleYes = getVisibleSections(sections, { showSection: 'yes' });
      expect(visibleYes).toHaveLength(2);
    });
  });

  describe('getVisibleFields', () => {
    it('should return all fields when no conditions', () => {
      const fields = [
        fieldFactory.text({ id: 'field-1' }),
        fieldFactory.text({ id: 'field-2' }),
      ];
      
      const visible = getVisibleFields(fields, {});
      expect(visible).toHaveLength(2);
    });

    it('should filter fields based on conditions', () => {
      const fields = [
        fieldFactory.text({ id: 'field-1' }),
        fieldFactory.withConditional(
          fieldFactory.text({ id: 'field-2' }),
          {
            dependsOn: 'showField',
            values: ['yes'],
            operator: 'equals',
          }
        ),
      ];
      
      const visibleNo = getVisibleFields(fields, { showField: 'no' });
      expect(visibleNo).toHaveLength(1);
      expect(visibleNo[0].id).toBe('field-1');
      
      const visibleYes = getVisibleFields(fields, { showField: 'yes' });
      expect(visibleYes).toHaveLength(2);
    });
  });

  describe('calculateProgress', () => {
    it('should return 0 for empty form data', () => {
      const sections = [
        sectionFactory.withFields([
          fieldFactory.text({ id: 'field-1', required: true }),
          fieldFactory.text({ id: 'field-2', required: true }),
        ]),
      ];
      
      expect(calculateProgress(sections, {})).toBe(0);
    });

    it('should calculate progress for partial completion', () => {
      const sections = [
        sectionFactory.withFields([
          fieldFactory.text({ id: 'field-1', required: true }),
          fieldFactory.text({ id: 'field-2', required: true }),
          fieldFactory.text({ id: 'field-3', required: false }),
        ]),
      ];
      
      const progress = calculateProgress(
        sections,
        { 'field-1': 'value1' },
        ['section-1']
      );
      
      expect(progress).toBe(50); // 1 of 2 required fields
    });

    it('should handle N/A sections correctly', () => {
      const sections = [
        sectionFactory.build({ id: 'section-1' }),
        sectionFactory.build({ id: 'section-2' }),
      ];
      
      const progress = calculateProgress(
        sections,
        {},
        ['section-1', 'section-2'],
        ['section-1', 'section-2'] // All sections marked as N/A
      );
      
      expect(progress).toBe(100);
    });

    it('should only calculate progress for visited sections', () => {
      const sections = [
        sectionFactory.withFields([
          fieldFactory.text({ id: 'field-1', required: true }),
        ]),
        sectionFactory.withFields([
          fieldFactory.text({ id: 'field-2', required: true }),
        ]),
      ];
      
      const progress = calculateProgress(
        sections,
        { 'field-1': 'value1' },
        ['section-1'] // Only first section visited
      );
      
      expect(progress).toBe(100); // All required fields in visited sections are filled
    });

    it('should handle conditional fields in progress calculation', () => {
      const sections = [
        sectionFactory.withFields([
          fieldFactory.text({ id: 'trigger', required: true }),
          fieldFactory.withConditional(
            fieldFactory.text({ id: 'conditional', required: true }),
            {
              dependsOn: 'trigger',
              values: ['show'],
              operator: 'equals',
            }
          ),
        ]),
      ];
      
      // Conditional field not shown
      const progressHidden = calculateProgress(
        sections,
        { trigger: 'hide' },
        ['section-1']
      );
      expect(progressHidden).toBe(100);
      
      // Conditional field shown but not filled
      const progressShown = calculateProgress(
        sections,
        { trigger: 'show' },
        ['section-1']
      );
      expect(progressShown).toBe(50);
    });
  });

  describe('validateField', () => {
    it('should validate required fields', () => {
      const field = fieldFactory.text({ required: true });
      
      expect(validateField(field, '')).toBe('This field is required');
      expect(validateField(field, null)).toBe('This field is required');
      expect(validateField(field, 'value')).toBe('');
    });

    it('should validate email format', () => {
      const field = fieldFactory.email({ required: true });
      
      expect(validateField(field, 'invalid')).toBe('Please enter a valid email address');
      expect(validateField(field, 'valid@email.com')).toBe('');
    });

    it('should validate number constraints', () => {
      const field = fieldFactory.number({
        validation: { min: 1, max: 10 },
      });
      
      expect(validateField(field, 0)).toBe('Value must be at least 1');
      expect(validateField(field, 11)).toBe('Value must be at most 10');
      expect(validateField(field, 5)).toBe('');
    });

    it('should validate text length constraints', () => {
      const field = fieldFactory.text({
        validation: { minLength: 3, maxLength: 10 },
      });
      
      expect(validateField(field, 'ab')).toBe('Must be at least 3 characters');
      expect(validateField(field, 'this is too long')).toBe('Must be at most 10 characters');
      expect(validateField(field, 'perfect')).toBe('');
    });

    it('should validate pattern matching', () => {
      const field = fieldFactory.text({
        validation: { pattern: '^[A-Z]{3}$' },
      });
      
      expect(validateField(field, 'abc')).toBe('Invalid format');
      expect(validateField(field, 'ABC')).toBe('');
    });

    it('should skip validation for non-required empty fields', () => {
      const field = fieldFactory.text({
        required: false,
        validation: { minLength: 5 },
      });
      
      expect(validateField(field, '')).toBe('');
      expect(validateField(field, 'abc')).toBe('Must be at least 5 characters');
    });
  });

  describe('updateConditionalFieldsAsNull', () => {
    it('should nullify hidden conditional fields', () => {
      const sections = [
        sectionFactory.withFields([
          fieldFactory.radio({ id: 'trigger', options: ['show', 'hide'] }),
          fieldFactory.withConditional(
            fieldFactory.text({ id: 'conditional-1' }),
            {
              dependsOn: 'trigger',
              values: ['show'],
              operator: 'equals',
            }
          ),
          fieldFactory.withConditional(
            fieldFactory.text({ id: 'conditional-2' }),
            {
              dependsOn: 'trigger',
              values: ['show'],
              operator: 'equals',
            }
          ),
        ]),
      ];
      
      const formData = {
        trigger: 'hide',
        'conditional-1': 'should be null',
        'conditional-2': 'should also be null',
      };
      
      const updated = updateConditionalFieldsAsNull(sections, formData);
      
      expect(updated['conditional-1']).toBeNull();
      expect(updated['conditional-2']).toBeNull();
      expect(updated.trigger).toBe('hide');
    });

    it('should preserve visible conditional field values', () => {
      const sections = [
        sectionFactory.withFields([
          fieldFactory.radio({ id: 'trigger', options: ['show', 'hide'] }),
          fieldFactory.withConditional(
            fieldFactory.text({ id: 'conditional' }),
            {
              dependsOn: 'trigger',
              values: ['show'],
              operator: 'equals',
            }
          ),
        ]),
      ];
      
      const formData = {
        trigger: 'show',
        conditional: 'keep this value',
      };
      
      const updated = updateConditionalFieldsAsNull(sections, formData);
      
      expect(updated.conditional).toBe('keep this value');
    });

    it('should handle nested conditional dependencies', () => {
      const sections = [
        sectionFactory.withFields([
          fieldFactory.radio({ id: 'level1', options: ['yes', 'no'] }),
          fieldFactory.withConditional(
            fieldFactory.radio({ id: 'level2', options: ['yes', 'no'] }),
            {
              dependsOn: 'level1',
              values: ['yes'],
              operator: 'equals',
            }
          ),
          fieldFactory.withConditional(
            fieldFactory.text({ id: 'level3' }),
            {
              dependsOn: 'level2',
              values: ['yes'],
              operator: 'equals',
            }
          ),
        ]),
      ];
      
      const formData = {
        level1: 'no',
        level2: 'yes',
        level3: 'should be null',
      };
      
      const updated = updateConditionalFieldsAsNull(sections, formData);
      
      expect(updated.level1).toBe('no');
      expect(updated.level2).toBeNull();
      expect(updated.level3).toBeNull();
    });
  });
});