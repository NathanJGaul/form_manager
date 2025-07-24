import { describe, it, expect } from 'vitest';
import {
  evaluateSingleCondition,
  evaluateConditional,
  createOrCondition,
  createAndCondition,
} from '@/utils/formLogicEnhanced';
import { SingleCondition, CompoundCondition } from '@/types/conditional';

describe('formLogicEnhanced', () => {
  describe('evaluateSingleCondition', () => {
    describe('simple field ID format', () => {
      it('should evaluate equals operator correctly', () => {
        const condition: SingleCondition = {
          dependsOn: 'status',
          values: ['active'],
          operator: 'equals',
        };
        
        expect(evaluateSingleCondition(condition, { status: 'active' })).toBe(true);
        expect(evaluateSingleCondition(condition, { status: 'inactive' })).toBe(false);
      });

      it('should maintain backward compatibility with existing field IDs', () => {
        const condition: SingleCondition = {
          dependsOn: 'exp_app_jcc2_cyber_ops',
          values: ['Yes'],
          operator: 'equals',
        };
        
        expect(evaluateSingleCondition(condition, { exp_app_jcc2_cyber_ops: 'Yes' })).toBe(true);
        expect(evaluateSingleCondition(condition, { exp_app_jcc2_cyber_ops: 'No' })).toBe(false);
      });
    });

    describe('section.field format', () => {
      it('should evaluate section.field format correctly', () => {
        const condition: SingleCondition = {
          dependsOn: 'experience.has_clearance',
          values: ['Yes'],
          operator: 'equals',
        };
        
        // FormData only contains the field ID, not the section prefix
        const formData = { has_clearance: 'Yes' };
        
        expect(evaluateSingleCondition(condition, formData)).toBe(true);
      });

      it('should fallback to field ID when section.field not found', () => {
        const condition: SingleCondition = {
          dependsOn: 'section1.field1',
          values: ['value1'],
          operator: 'equals',
        };
        
        // Test that it finds the field even with section prefix
        expect(evaluateSingleCondition(condition, { field1: 'value1' })).toBe(true);
        expect(evaluateSingleCondition(condition, { field1: 'value2' })).toBe(false);
      });

      it('should handle multiple dots in dependsOn gracefully', () => {
        const condition: SingleCondition = {
          dependsOn: 'section.subsection.field',
          values: ['value'],
          operator: 'equals',
        };
        
        // Should not evaluate as section.field format (more than 2 parts)
        expect(evaluateSingleCondition(condition, { field: 'value' })).toBe(false);
        expect(evaluateSingleCondition(condition, { 'section.subsection.field': 'value' })).toBe(true);
      });

      it('should prioritize exact match over section.field parsing', () => {
        const condition: SingleCondition = {
          dependsOn: 'section.field',
          values: ['value1'],
          operator: 'equals',
        };
        
        // If both exist, exact match should win
        const formData = {
          'section.field': 'value1',
          'field': 'value2',
        };
        
        expect(evaluateSingleCondition(condition, formData)).toBe(true);
      });
    });

    describe('operators with section.**field format**', () => {
      it('should handle contains operator with section.field format', () => {
        const condition: SingleCondition = {
          dependsOn: 'details.description',
          values: ['urgent'],
          operator: 'contains',
        };
        
        expect(evaluateSingleCondition(condition, { description: 'This is urgent!' })).toBe(true);
        expect(evaluateSingleCondition(condition, { description: 'Normal task' })).toBe(false);
      });

      it('should handle not_equals operator with section.field format', () => {
        const condition: SingleCondition = {
          dependsOn: 'preferences.theme',
          values: ['dark'],
          operator: 'not_equals',
        };
        
        expect(evaluateSingleCondition(condition, { theme: 'light' })).toBe(true);
        expect(evaluateSingleCondition(condition, { theme: 'dark' })).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle undefined values with section.field format', () => {
        const condition: SingleCondition = {
          dependsOn: 'section.field',
          values: ['value'],
          operator: 'equals',
        };
        
        expect(evaluateSingleCondition(condition, {})).toBe(false);
        expect(evaluateSingleCondition(condition, { field: null })).toBe(false);
        expect(evaluateSingleCondition(condition, { field: undefined })).toBe(false);
      });

      it('should handle fields with dots in their actual ID', () => {
        const condition: SingleCondition = {
          dependsOn: 'field.with.dots',
          values: ['value'],
          operator: 'equals',
        };
        
        // Should first try exact match
        expect(evaluateSingleCondition(condition, { 'field.with.dots': 'value' })).toBe(true);
      });

      it('should be case-insensitive for values', () => {
        const condition: SingleCondition = {
          dependsOn: 'section.field',
          values: ['YES'],
          operator: 'equals',
        };
        
        expect(evaluateSingleCondition(condition, { field: 'yes' })).toBe(true);
        expect(evaluateSingleCondition(condition, { field: 'Yes' })).toBe(true);
        expect(evaluateSingleCondition(condition, { field: 'YES' })).toBe(true);
      });
    });
  });

  describe('evaluateConditional with compound conditions', () => {
    it('should evaluate OR conditions with section.field format', () => {
      const condition: CompoundCondition = createOrCondition(
        {
          dependsOn: 'section1.field1',
          values: ['value1'],
          operator: 'equals',
        },
        {
          dependsOn: 'section2.field2',
          values: ['value2'],
          operator: 'equals',
        }
      );
      
      expect(evaluateConditional(condition, { field1: 'value1', field2: 'wrong' })).toBe(true);
      expect(evaluateConditional(condition, { field1: 'wrong', field2: 'value2' })).toBe(true);
      expect(evaluateConditional(condition, { field1: 'wrong', field2: 'wrong' })).toBe(false);
    });

    it('should evaluate AND conditions with section.field format', () => {
      const condition: CompoundCondition = createAndCondition(
        {
          dependsOn: 'personal.age',
          values: ['18+'],
          operator: 'equals',
        },
        {
          dependsOn: 'eligibility.consent',
          values: ['Yes'],
          operator: 'equals',
        }
      );
      
      expect(evaluateConditional(condition, { age: '18+', consent: 'Yes' })).toBe(true);
      expect(evaluateConditional(condition, { age: '18+', consent: 'No' })).toBe(false);
      expect(evaluateConditional(condition, { age: 'under-18', consent: 'Yes' })).toBe(false);
    });

    it('should handle nested compound conditions with section.field format', () => {
      const condition: CompoundCondition = {
        logic: 'and',
        conditions: [
          {
            dependsOn: 'section1.required_field',
            values: ['Yes'],
            operator: 'equals',
          },
          {
            logic: 'or',
            conditions: [
              {
                dependsOn: 'section2.option_a',
                values: ['Selected'],
                operator: 'equals',
              },
              {
                dependsOn: 'section2.option_b',
                values: ['Selected'],
                operator: 'equals',
              },
            ],
          },
        ],
      };
      
      // Required field + at least one option
      expect(evaluateConditional(condition, {
        required_field: 'Yes',
        option_a: 'Selected',
        option_b: 'Not Selected',
      })).toBe(true);
      
      // Required field but no options
      expect(evaluateConditional(condition, {
        required_field: 'Yes',
        option_a: 'Not Selected',
        option_b: 'Not Selected',
      })).toBe(false);
    });
  });

  describe('real-world template scenarios', () => {
    it('should handle JCC2 template conditional pattern', () => {
      // Example from the user's request
      const sectionId = 'experience';
      const questionId = 'has_clearance';
      
      const condition: SingleCondition = {
        dependsOn: `${sectionId}.${questionId}`,
        values: ['No'],
        operator: 'equals',
      };
      
      // Follow-up textarea should show when answer is "No"
      expect(evaluateSingleCondition(condition, { has_clearance: 'No' })).toBe(true);
      expect(evaluateSingleCondition(condition, { has_clearance: 'Yes' })).toBe(false);
    });

    it('should handle multiple conditional follow-ups in the same section', () => {
      const conditions = [
        {
          dependsOn: 'qualifications.has_degree',
          values: ['No'],
          operator: 'equals' as const,
        },
        {
          dependsOn: 'qualifications.has_certification',
          values: ['No'],
          operator: 'equals' as const,
        },
        {
          dependsOn: 'qualifications.years_experience',
          values: ['Less than 2 years'],
          operator: 'equals' as const,
        },
      ];
      
      const formData = {
        has_degree: 'No',
        has_certification: 'Yes',
        years_experience: 'Less than 2 years',
      };
      
      expect(evaluateSingleCondition(conditions[0], formData)).toBe(true);
      expect(evaluateSingleCondition(conditions[1], formData)).toBe(false);
      expect(evaluateSingleCondition(conditions[2], formData)).toBe(true);
    });
  });
});