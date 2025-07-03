import { TemplateBuilder } from '../builder/TemplateBuilder';
import { ProgrammaticTemplate } from '../types';

/**
 * Working Comprehensive Template that demonstrates all Programmatic Template System features
 * This template is designed to work without the complex nested conditional issues
 */
export class WorkingComprehensiveTemplate {
  /**
   * Creates a comprehensive template showcasing all programmatic features
   * without complex nested conditionals that cause scoping issues
   */
  static create(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Working Comprehensive Event Registration')
      .description('A comprehensive event registration form showcasing all programmatic features')
      
      // Set up variables for dynamic content
      .variables({
        eventTypes: ['conference', 'workshop', 'webinar', 'networking'],
        industries: ['technology', 'business', 'education', 'healthcare'],
        pricing: {
          basic: 99,
          premium: 199,
          enterprise: 499
        },
        features: {
          networking: true,
          recordings: true,
          certificates: true
        }
      })
      
      // Personal Information Section
      .section('Personal Information')
        .field('text', 'Full Name')
          .id('full_name')
          .required()
          .pattern('^[a-zA-Z\\s\\-\\.]+$')
          .placeholder('Enter your full name')
          .end()
          
        .field('email', 'Email Address')
          .id('email')
          .required()
          .placeholder('your.email@example.com')
          .end()
          
        .field('tel', 'Phone Number')
          .id('phone')
          .required()
          .placeholder('+1 (555) 123-4567')
          .end()
          
        .field('text', 'Job Title')
          .id('job_title')
          .required()
          .placeholder('e.g., Software Engineer, Product Manager')
          .end()
          
        .field('text', 'Company/Organization')
          .id('company')
          .required()
          .placeholder('Your company name')
          .end()
          
      // Event Preferences Section
      .section('Event Preferences')
        .field('select', 'Event Type')
          .id('event_type')
          .required()
          .options(['conference', 'workshop', 'webinar', 'networking'])
          .end()
          
        .field('checkbox', 'Industry Focus Areas')
          .id('industry_focus')
          .multiple()
          .options(['Technology', 'Business', 'Education', 'Healthcare', 'Finance', 'Marketing'])
          .end()
          
        .field('radio', 'Experience Level')
          .id('experience_level')
          .required()
          .options(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
          .end()
          
        .field('range', 'Years of Experience')
          .id('experience_years')
          .required()
          .min(0)
          .max(50)
          .end()
          
        .field('date', 'Preferred Start Date')
          .id('preferred_date')
          .required()
          .end()
          
        .field('time', 'Preferred Time')
          .id('preferred_time')
          .required()
          .end()
          
        .field('number', 'Number of Attendees')
          .id('attendee_count')
          .required()
          .min(1)
          .max(100)
          .end()
          
      // Dynamic Content with Simple Conditionals
      .section('Technology Track')
        .field('checkbox', 'Technology Topics')
          .id('tech_topics')
          .multiple()
          .options(['AI/ML', 'Web Development', 'Mobile Apps', 'Cloud Computing', 'DevOps', 'Cybersecurity'])
          .end()
          
      .section('Business Track')
        .field('checkbox', 'Business Topics')
          .id('business_topics')
          .multiple()
          .options(['Strategy', 'Leadership', 'Marketing', 'Finance', 'Operations', 'Innovation'])
          .end()
          
      // Dynamic sections using forEach
      .forEach(['morning', 'afternoon', 'evening'], (timeSlot, index, builder) => {
        builder.section(`${timeSlot.toUpperCase()} Sessions`)
          .field('checkbox', `${timeSlot} workshop preferences`)
            .id(`${timeSlot}_workshops`)
            .multiple()
            .options([
              'Technical Deep Dive',
              'Case Study Analysis', 
              'Hands-on Workshop',
              'Panel Discussion',
              'Networking Break'
            ])
            .end()
      })
      
      // Pricing and Registration
      .section('Registration & Pricing')
        .field('radio', 'Registration Tier')
          .id('registration_tier')
          .required()
          .options(['Basic ($99)', 'Premium ($199)', 'Enterprise ($499)'])
          .end()
          
        .field('checkbox', 'Additional Services')
          .id('additional_services')
          .multiple()
          .options([
            'Certificate of Completion (+$25)',
            'Workshop Materials (+$15)',
            'Networking Dinner (+$50)',
            'One-on-One Mentoring (+$100)'
          ])
          .end()
          
      // Accessibility and Special Requirements
      .section('Accessibility & Special Requirements')
        .field('checkbox', 'Accessibility Needs')
          .id('accessibility_needs')
          .multiple()
          .options([
            'Sign Language Interpreter',
            'Large Print Materials',
            'Wheelchair Access',
            'Dietary Restrictions',
            'Other (please specify)'
          ])
          .end()
          
        .field('textarea', 'Special Requirements')
          .id('special_requirements')
          .optional()
          .placeholder('Please describe any special requirements or accommodations needed')
          .maxLength(500)
          .end()
          
      // Final Details
      .section('Final Details')
        .field('url', 'LinkedIn Profile')
          .id('linkedin_profile')
          .optional()
          .placeholder('https://linkedin.com/in/yourprofile')
          .end()
          
        .field('file', 'Resume/CV')
          .id('resume_file')
          .optional()
          .end()
          
        .field('textarea', 'Additional Comments')
          .id('additional_comments')
          .optional()
          .placeholder('Any additional comments or questions?')
          .maxLength(1000)
          .end()
          
        .field('checkbox', 'Agreement')
          .id('terms_agreement')
          .required()
          .options(['I agree to the terms and conditions'])
          .end()
          
      // Simple conditional sections without nested builders
      .if('$variables.features.networking')
        .then(builder => 
          builder.section('Networking Preferences')
            .field('checkbox', 'Networking Interests')
              .id('networking_interests')
              .multiple()
              .options([
                'One-on-One Meetings',
                'Group Discussions', 
                'Industry Meetups',
                'Social Events',
                'Professional Mentoring'
              ])
              .end()
        )
      .endif()
      
      .build();
  }
  
  /**
   * Creates a simplified version for testing
   */
  static createSimple(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Simple Working Template')
      .variables({
        testVar: 'test_value'
      })
      .section('Basic Info')
        .field('text', 'Name')
          .id('name')
          .required()
          .end()
        .field('email', 'Email')
          .id('email')
          .required()
          .end()
      .build();
  }
}