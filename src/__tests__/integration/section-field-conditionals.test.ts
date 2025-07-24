import { describe, it, expect } from 'vitest';
import { TemplateBuilder } from '@/programmatic';
import { evaluateConditional } from '@/utils/formLogicEnhanced';
import { FormFieldValue } from '@/types/form';

describe('Section.Field Conditionals Integration', () => {
  it('should create a template with section-based conditional fields', () => {
    const builder = new TemplateBuilder().create('Section Field Test');
    
    builder
      .section('Personal Information')
      .id('personal')
      .field('radio', 'Are you a student?')
      .id('is_student')
      .options(['Yes', 'No'])
      .required()
      .end()
      .field('textarea', 'Please explain why you are not a student')
      .id('not_student_reason')
      .conditional('personal.is_student', 'equals', ['No'])
      .required()
      .end();
      
    builder
      .section('Experience')
      .id('experience')
      .field('radio', 'Do you have security clearance?')
      .id('has_clearance')
      .options(['Yes', 'No'])
      .required()
      .end()
      .field('textarea', 'Please describe your clearance sponsorship needs')
      .id('clearance_details')
      .conditional('experience.has_clearance', 'equals', ['No'])
      .required()
      .end();
      
    const template = builder.build();
    
    // Verify the template structure
    expect(template.sections).toHaveLength(2);
    expect(template.sections[0].fields).toHaveLength(2);
    expect(template.sections[1].fields).toHaveLength(2);
    
    // Verify the conditional is set correctly
    const personalReasonField = template.sections[0].fields[1];
    expect(personalReasonField.conditional).toEqual({
      dependsOn: 'personal.is_student',
      values: ['No'],
      operator: 'equals'
    });
    
    const clearanceField = template.sections[1].fields[1];
    expect(clearanceField.conditional).toEqual({
      dependsOn: 'experience.has_clearance',
      values: ['No'],
      operator: 'equals'
    });
  });
  
  it('should evaluate section.field conditionals correctly', () => {
    const formData: Record<string, FormFieldValue> = {
      is_student: 'No',
      has_clearance: 'Yes'
    };
    
    // Test personal.is_student conditional
    const studentCondition = {
      dependsOn: 'personal.is_student',
      values: ['No'],
      operator: 'equals' as const
    };
    
    expect(evaluateConditional(studentCondition, formData)).toBe(true);
    
    // Test experience.has_clearance conditional
    const clearanceCondition = {
      dependsOn: 'experience.has_clearance',
      values: ['No'],
      operator: 'equals' as const
    };
    
    expect(evaluateConditional(clearanceCondition, formData)).toBe(false);
  });
  
  it('should handle helper function pattern for standardized questions', () => {
    interface StandardQuestion {
      id: string;
      label: string;
      options: string[];
      followUpPrompt: string;
      followUpOption: string;
    }
    
    const standardTaskQuestions: StandardQuestion[] = [
      {
        id: 'can_complete_task',
        label: 'Can you complete this task?',
        options: ['Yes', 'No'],
        followUpPrompt: 'Please explain why you cannot complete this task',
        followUpOption: 'No'
      },
      {
        id: 'has_resources',
        label: 'Do you have the necessary resources?',
        options: ['Yes', 'No'],
        followUpPrompt: 'What resources do you need?',
        followUpOption: 'No'
      }
    ];
    
    function addStandardTaskQuestions(builder: any, sectionId: string) {
      standardTaskQuestions.forEach((question) => {
        builder
          .field('radio', question.label)
          .id(question.id)
          .options(question.options)
          .layout('horizontal')
          .required()
          .end();
          
        if (question.options.includes('No')) {
          builder
            .field('textarea', question.followUpPrompt)
            .id(`${question.id}_details`)
            .required()
            .conditional(`${sectionId}.${question.id}`, 'equals', [question.followUpOption])
            .end();
        }
      });
    }
    
    const builder = new TemplateBuilder().create('Task Assessment');
    
    builder
      .section('Development Tasks')
      .id('dev_tasks');
    addStandardTaskQuestions(builder, 'dev_tasks');
    
    builder
      .section('Testing Tasks')
      .id('test_tasks');
    addStandardTaskQuestions(builder, 'test_tasks');
      
    const template = builder.build();
    
    // Verify each section has the standard questions
    expect(template.sections[0].fields).toHaveLength(4); // 2 questions + 2 follow-ups
    expect(template.sections[1].fields).toHaveLength(4);
    
    // Verify the conditionals use section.field format
    const devFollowUp1 = template.sections[0].fields[1];
    expect(devFollowUp1.conditional?.dependsOn).toBe('dev_tasks.can_complete_task');
    
    const testFollowUp1 = template.sections[1].fields[1];
    expect(testFollowUp1.conditional?.dependsOn).toBe('test_tasks.can_complete_task');
    
    // Test evaluation with actual data
    const formData: Record<string, FormFieldValue> = {
      can_complete_task: 'No', // This would be from dev_tasks section
      has_resources: 'Yes'
    };
    
    // The conditional should find the field even with section prefix
    expect(evaluateConditional(devFollowUp1.conditional!, formData)).toBe(true);
  });
  
  it('should maintain backward compatibility with existing field IDs', () => {
    // Existing templates that use simple field IDs should continue to work
    const condition = {
      dependsOn: 'exp_app_jcc2_cyber_ops',
      values: ['Yes'],
      operator: 'equals' as const
    };
    
    const formData = {
      exp_app_jcc2_cyber_ops: 'Yes'
    };
    
    expect(evaluateConditional(condition, formData)).toBe(true);
  });
});