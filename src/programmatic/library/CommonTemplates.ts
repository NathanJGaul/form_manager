import { TemplateBuilder } from '../builder/TemplateBuilder';
import { ProgrammaticTemplate } from '../types';

export class CommonTemplates {
  /**
   * Create a basic contact form template
   */
  static createContactForm(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Contact Form')
      .description('Basic contact form with name, email, and message')
      .tags('contact', 'basic', 'common')
      .section('Contact Information')
        .field('text', 'Full Name')
          .id('full_name')
          .required()
          .placeholder('Enter your full name')
        .field('text', 'Email Address')
          .id('email')
          .required()
          .placeholder('Enter your email address')
          .pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
        .field('text', 'Phone Number')
          .id('phone')
          .optional()
          .placeholder('Enter your phone number')
        .field('textarea', 'Message')
          .id('message')
          .required()
          .placeholder('Enter your message')
          .minLength(10)
          .maxLength(1000)
      .autoSave(2000)
      .showProgress()
      .build();
  }

  /**
   * Create a survey template with rating questions
   */
  static createSurveyTemplate(): ProgrammaticTemplate {
    const categories = ['product', 'service', 'support'];
    
    return new TemplateBuilder()
      .create('Customer Satisfaction Survey')
      .description('Multi-category customer satisfaction survey')
      .tags('survey', 'satisfaction', 'rating')
      .variables({ categories })
      .section('User Information')
        .field('select', 'Customer Type')
          .id('customer_type')
          .required()
          .options(['new', 'existing', 'premium'])
      .forEach(categories, (category, index, builder) => {
        builder.section(`${category.charAt(0).toUpperCase() + category.slice(1)} Feedback`)
          .field('radio', `Rate our ${category}`)
            .id(`${category}_rating`)
            .required()
            .options(['1', '2', '3', '4', '5'])
          .if(`${category}_rating <= 2`)
            .then(b => 
              b.field('textarea', `What can we improve in ${category}?`)
                .id(`${category}_improvement`)
                .required()
                .minLength(10)
            )
          .endif();
      })
      .section('Overall Feedback')
        .field('textarea', 'Additional Comments')
          .id('additional_comments')
          .optional()
          .placeholder('Any additional feedback?')
      .autoSave(3000)
      .showProgress()
      .build();
  }

  /**
   * Create a registration form template
   */
  static createRegistrationForm(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('User Registration Form')
      .description('Complete user registration with account details')
      .tags('registration', 'user', 'account')
      .section('Personal Information')
        .field('text', 'First Name')
          .id('first_name')
          .required()
        .field('text', 'Last Name')
          .id('last_name')
          .required()
        .field('date', 'Date of Birth')
          .id('date_of_birth')
          .required()
        .field('select', 'Gender')
          .id('gender')
          .optional()
          .options(['male', 'female', 'other', 'prefer_not_to_say'])
      .section('Account Details')
        .field('text', 'Username')
          .id('username')
          .required()
          .minLength(3)
          .maxLength(20)
        .field('text', 'Email Address')
          .id('email')
          .required()
          .pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
        .field('text', 'Password')
          .id('password')
          .required()
          .minLength(8)
        .field('text', 'Confirm Password')
          .id('confirm_password')
          .required()
      .section('Preferences')
        .field('checkbox', 'Interests')
          .id('interests')
          .multiple()
          .options(['technology', 'sports', 'music', 'travel', 'food', 'art'])
        .field('checkbox', 'Terms and Conditions')
          .id('accept_terms')
          .required()
          .options(['I accept the terms and conditions'])
        .field('checkbox', 'Newsletter Subscription')
          .id('newsletter')
          .optional()
          .options(['Subscribe to our newsletter'])
      .autoSave(1500)
      .showProgress()
      .build();
  }

  /**
   * Create a feedback form template
   */
  static createFeedbackForm(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Product Feedback Form')
      .description('Comprehensive product feedback collection')
      .tags('feedback', 'product', 'evaluation')
      .section('Product Experience')
        .field('select', 'How did you hear about us?')
          .id('referral_source')
          .required()
          .options(['search_engine', 'social_media', 'friend', 'advertisement', 'other'])
        .field('radio', 'Overall Satisfaction')
          .id('overall_satisfaction')
          .required()
          .options(['very_unsatisfied', 'unsatisfied', 'neutral', 'satisfied', 'very_satisfied'])
        .field('range', 'Likelihood to Recommend (1-10)')
          .id('nps_score')
          .required()
          .min(1)
          .max(10)
      .if('overall_satisfaction == "very_unsatisfied" || overall_satisfaction == "unsatisfied"')
        .then(builder =>
          builder.section('Improvement Areas')
            .field('checkbox', 'What areas need improvement?')
              .id('improvement_areas')
              .multiple()
              .options(['usability', 'performance', 'features', 'design', 'support'])
            .field('textarea', 'Specific Suggestions')
              .id('improvement_suggestions')
              .required()
              .minLength(20)
        )
      .endif()
      .section('Additional Information')
        .field('textarea', 'Additional Comments')
          .id('additional_comments')
          .optional()
          .placeholder('Any other feedback you would like to share?')
        .field('text', 'Contact Email (Optional)')
          .id('contact_email')
          .optional()
          .pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
      .autoSave(2500)
      .showProgress()
      .build();
  }

  /**
   * Create a multi-step form template
   */
  static createMultiStepForm(): ProgrammaticTemplate {
    const steps = ['personal', 'professional', 'preferences'];
    
    return new TemplateBuilder()
      .create('Multi-Step Application Form')
      .description('Multi-step application with conditional sections')
      .tags('multi-step', 'application', 'progressive')
      .variables({ steps, currentStep: 0 })
      .forEach(steps, (step, index, builder) => {
        const stepTitle = step.charAt(0).toUpperCase() + step.slice(1);
        
        builder.section(`Step ${index + 1}: ${stepTitle} Information`)
          .if(`currentStep == ${index}`)
            .then(conditionalBuilder => {
              switch(step) {
                case 'personal':
                  conditionalBuilder
                    .field('text', 'Full Name')
                      .id('full_name')
                      .required()
                    .field('text', 'Email')
                      .id('email')
                      .required()
                    .field('date', 'Date of Birth')
                      .id('dob')
                      .required();
                  break;
                case 'professional':
                  conditionalBuilder
                    .field('text', 'Company')
                      .id('company')
                      .required()
                    .field('text', 'Job Title')
                      .id('job_title')
                      .required()
                    .field('select', 'Years of Experience')
                      .id('experience')
                      .required()
                      .options(['0-1', '2-5', '6-10', '11-15', '15+']);
                  break;
                case 'preferences':
                  conditionalBuilder
                    .field('checkbox', 'Areas of Interest')
                      .id('interests')
                      .multiple()
                      .options(['technology', 'management', 'sales', 'marketing'])
                    .field('radio', 'Preferred Contact Method')
                      .id('contact_method')
                      .required()
                      .options(['email', 'phone', 'text']);
                  break;
              }
            })
          .endif();
      })
      .autoSave(1000)
      .showProgress()
      .build();
  }

  /**
   * Create a dynamic questionnaire template
   */
  static createDynamicQuestionnaire(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Dynamic Questionnaire')
      .description('Questionnaire that adapts based on responses')
      .tags('dynamic', 'questionnaire', 'adaptive')
      .variables({
        questionTypes: ['rating', 'text', 'choice'],
        categories: ['general', 'specific', 'detailed']
      })
      .section('Initial Assessment')
        .field('select', 'Assessment Type')
          .id('assessment_type')
          .required()
          .options(['basic', 'intermediate', 'advanced'])
        .field('radio', 'Time Available')
          .id('time_available')
          .required()
          .options(['5_minutes', '10_minutes', '20_minutes', 'unlimited'])
      .if('assessment_type == "basic"')
        .then(builder =>
          builder.section('Basic Questions')
            .repeat(3, (index, repeatBuilder) => {
              repeatBuilder.field('radio', `Question ${index + 1}`)
                .id(`basic_q${index + 1}`)
                .required()
                .options(['agree', 'neutral', 'disagree']);
            })
        )
      .elseIf('assessment_type == "intermediate"')
        .then(builder =>
          builder.section('Intermediate Questions')
            .repeat(5, (index, repeatBuilder) => {
              repeatBuilder.field('range', `Rate Question ${index + 1}`)
                .id(`intermediate_q${index + 1}`)
                .required()
                .min(1)
                .max(5);
            })
        )
      .else(builder =>
        builder.section('Advanced Questions')
          .repeat(7, (index, repeatBuilder) => {
            repeatBuilder.field('textarea', `Detailed Question ${index + 1}`)
              .id(`advanced_q${index + 1}`)
              .required()
              .minLength(50);
          })
      )
      .endif()
      .if('time_available != "unlimited"')
        .then(builder =>
          builder.section('Quick Summary')
            .field('textarea', 'Key Points')
              .id('summary')
              .required()
              .maxLength(200)
        )
      .endif()
      .autoSave(2000)
      .showProgress()
      .build();
  }

  /**
   * Helper function to create a rating scale field
   */
  static createRatingField(id: string, label: string, min: number = 1, max: number = 5): any {
    const options = [];
    for (let i = min; i <= max; i++) {
      options.push(i.toString());
    }
    
    return new TemplateBuilder()
      .field('radio', label)
      .id(id)
      .required()
      .options(options);
  }

  /**
   * Helper function to create a yes/no field
   */
  static createYesNoField(id: string, label: string, required: boolean = true): any {
    const builder = new TemplateBuilder()
      .field('radio', label)
      .id(id)
      .options(['yes', 'no']);
    
    return required ? builder.required() : builder.optional();
  }

  /**
   * Helper function to create an email field with validation
   */
  static createEmailField(id: string, label: string = 'Email Address', required: boolean = true): any {
    const builder = new TemplateBuilder()
      .field('text', label)
      .id(id)
      .pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
      .placeholder('Enter your email address');
    
    return required ? builder.required() : builder.optional();
  }

  /**
   * Helper function to create a phone field with validation
   */
  static createPhoneField(id: string, label: string = 'Phone Number', required: boolean = false): any {
    const builder = new TemplateBuilder()
      .field('text', label)
      .id(id)
      .pattern('^[\\+]?[1-9][\\d]{0,14}$')
      .placeholder('Enter your phone number');
    
    return required ? builder.required() : builder.optional();
  }

  /**
   * Helper function to create a name field
   */
  static createNameField(id: string, label: string, required: boolean = true): any {
    const builder = new TemplateBuilder()
      .field('text', label)
      .id(id)
      .minLength(2)
      .maxLength(50)
      .placeholder(`Enter your ${label.toLowerCase()}`);
    
    return required ? builder.required() : builder.optional();
  }

  /**
   * Helper function to create a date field
   */
  static createDateField(id: string, label: string, required: boolean = true): any {
    const builder = new TemplateBuilder()
      .field('date', label)
      .id(id);
    
    return required ? builder.required() : builder.optional();
  }

  /**
   * Helper function to create a file upload field
   */
  static createFileField(
    id: string, 
    label: string, 
    accept: string = 'image/*', 
    required: boolean = false
  ): any {
    const builder = new TemplateBuilder()
      .field('file', label)
      .id(id);
    
    // Note: Accept attribute would need to be added to field interface
    return required ? builder.required() : builder.optional();
  }

  /**
   * Get all available common templates
   */
  static getAllTemplates(): { [key: string]: () => ProgrammaticTemplate } {
    return {
      contact: this.createContactForm,
      survey: this.createSurveyTemplate,
      registration: this.createRegistrationForm,
      feedback: this.createFeedbackForm,
      multiStep: this.createMultiStepForm,
      questionnaire: this.createDynamicQuestionnaire
    };
  }

  /**
   * Get template by name
   */
  static getTemplate(name: string): ProgrammaticTemplate | null {
    const templates = this.getAllTemplates();
    const templateFunction = templates[name];
    return templateFunction ? templateFunction() : null;
  }

  /**
   * List available template names
   */
  static listTemplates(): string[] {
    return Object.keys(this.getAllTemplates());
  }
}