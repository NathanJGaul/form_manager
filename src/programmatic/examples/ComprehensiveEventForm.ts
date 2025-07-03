import { TemplateBuilder } from '../builder/TemplateBuilder';
import { ProgrammaticTemplate } from '../types';

/**
 * Comprehensive Event Management Platform Registration Form
 * 
 * This template demonstrates ALL programmatic features including:
 * - Complex control flow (nested if/else, loops)
 * - Dynamic section generation
 * - Variable interpolation and scoping
 * - Advanced validation rules
 * - Conditional styling and behavior
 * - Template inheritance concepts
 * - Custom functions and expressions
 */
export class ComprehensiveEventForm {
  
  /**
   * Create the main comprehensive event registration form
   */
  static create(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Event Management Platform Registration')
      .description('Comprehensive event registration with adaptive sections based on user type, event preferences, and dynamic content')
      .author('Programmatic Template System')
      .version('2.0.0')
      .tags('event', 'registration', 'comprehensive', 'dynamic', 'showcase')
      
      // Define comprehensive variables for the entire template
      .variables({
        // Event types and categories
        eventTypes: ['conference', 'workshop', 'webinar', 'networking', 'hackathon', 'exhibition'],
        eventCategories: {
          technology: ['AI/ML', 'Web Development', 'Mobile Apps', 'DevOps', 'Cybersecurity', 'Data Science'],
          business: ['Marketing', 'Sales', 'Finance', 'Operations', 'Strategy', 'Leadership'],
          creative: ['Design', 'Photography', 'Writing', 'Video Production', 'Music', 'Art'],
          education: ['Online Learning', 'Certification', 'Academic', 'Training', 'Skills Development']
        },
        
        // Pricing tiers and features
        pricingTiers: ['free', 'basic', 'premium', 'enterprise'],
        tierFeatures: {
          free: ['Basic Access', 'Live Streaming', 'Q&A'],
          basic: ['HD Streaming', 'Recording Access', 'Community Chat', 'Basic Networking'],
          premium: ['Priority Support', 'Breakout Rooms', 'Advanced Networking', 'Resource Downloads', 'Certificates'],
          enterprise: ['Custom Branding', 'Analytics Dashboard', 'API Access', 'Dedicated Support', 'White Label']
        },
        
        // Geographic and demographic data
        regions: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'],
        timezones: ['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+8', 'UTC+9'],
        companySizes: ['1-10', '11-50', '51-200', '201-1000', '1000+'],
        
        // Dynamic content variables
        maxEventsPerCategory: 5,
        maxWorkshopTracks: 3,
        surveyQuestions: ['satisfaction', 'recommendation', 'content_quality', 'networking_value'],
        
        // Feature flags for conditional behavior
        features: {
          earlyBirdDiscount: true,
          groupRegistration: true,
          customAgenda: true,
          aiRecommendations: true,
          socialIntegration: true,
          accessibilitySupport: true
        }
      })
      
      // Step 1: Account Type & Basic Information
      .section('Registration Type & Profile')
        .field('radio', 'Registration Type')
          .id('registration_type')
          .required()
          .options(['individual', 'team', 'corporate', 'student', 'speaker', 'sponsor'])
          .end()
          
        .field('text', 'Full Name')
          .id('full_name')
          .required()
          .minLength(2)
          .maxLength(100)
          .placeholder('Enter your full name')
          .validation({
            pattern: '^[a-zA-Z\\s\\-\\.]+$',
            custom: (value) => value.trim().split(' ').length >= 2 || 'Please enter first and last name'
          })
          .end()
          
        .field('text', 'Email Address')
          .id('email')
          .required()
          .pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
          .placeholder('your.email@company.com')
          .end()
          
        .field('text', 'Phone Number')
          .id('phone')
          .optional()
          .pattern('^[\\+]?[1-9][\\d]{0,14}$')
          .placeholder('+1 (555) 123-4567')
          .end()
      
      // Conditional Professional Information based on registration type
      .if('registration_type != "student"')
        .then(builder =>
          builder.section('Professional Information')
            .field('text', 'Job Title')
              .id('job_title')
              .required()
              .maxLength(100)
              .placeholder('e.g., Senior Software Engineer')
              .end()
              
            .field('text', 'Company/Organization')
              .id('company')
              .required()
              .maxLength(200)
              .placeholder('Your company name')
              .end()
              
            .field('select', 'Company Size')
              .id('company_size')
              .required()
              .options(['1-10', '11-50', '51-200', '201-1000', '1000+'])
              .end()
              
            .field('select', 'Industry')
              .id('industry')
              .required()
              .options(['technology', 'business', 'creative', 'education'])
              .end()
              
            .field('range', 'Years of Experience')
              .id('experience_years')
              .required()
              .min(0)
              .max(50)
              .end()
        )
      .elseIf('registration_type == "student"')
        .then(builder =>
          builder.section('Academic Information')
            .field('text', 'Educational Institution')
              .id('institution')
              .required()
              .maxLength(200)
              .placeholder('University or School name')
              .end()
              
            .field('select', 'Study Level')
              .id('study_level')
              .required()
              .options(['High School', 'Undergraduate', 'Graduate', 'PhD', 'Postdoc'])
              .end()
              
            .field('text', 'Field of Study')
              .id('field_of_study')
              .required()
              .maxLength(100)
              .placeholder('e.g., Computer Science')
              .end()
              
            .field('date', 'Expected Graduation')
              .id('graduation_date')
              .optional()
              .end()
        )
      .endif()
      
      // Team/Corporate Registration Logic
      .if('registration_type == "team" || registration_type == "corporate"')
        .then(builder =>
          builder.section('Team Registration Details')
            .field('number', 'Number of Team Members')
              .id('team_size')
              .required()
              .min(2)
              .max(100)
              .end()
              
            .field('textarea', 'Team Member Details')
              .id('team_members')
              .required()
              .placeholder('List team member names and emails (one per line)')
              .minLength(20)
              .maxLength(2000)
              .end()
              
            .field('checkbox', 'Team Benefits')
              .id('team_benefits')
              .multiple()
              .options(['Group Discount', 'Shared Resources', 'Team Dashboard', 'Bulk Certificates'])
              .end()
        )
      .endif()
      
      // Speaker-specific sections
      .if('registration_type == "speaker"')
        .then(builder =>
          builder.section('Speaker Information')
            .field('textarea', 'Speaker Bio')
              .id('speaker_bio')
              .required()
              .minLength(100)
              .maxLength(1000)
              .placeholder('Brief professional biography (100-1000 characters)')
              .end()
              
            .field('text', 'Presentation Title')
              .id('presentation_title')
              .required()
              .maxLength(200)
              .end()
              
            .field('textarea', 'Presentation Abstract')
              .id('presentation_abstract')
              .required()
              .minLength(200)
              .maxLength(2000)
              .placeholder('Detailed description of your presentation')
              .end()
              
            .field('select', 'Presentation Duration')
              .id('presentation_duration')
              .required()
              .options(['15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes'])
              .end()
              
            .field('checkbox', 'Technical Requirements')
              .id('tech_requirements')
              .multiple()
              .options(['Projector', 'Microphone', 'Live Streaming', 'Recording', 'Interactive Demo', 'Internet Access'])
              .end()
        )
      .endif()
      
      // Dynamic Event Selection based on interests
      .section('Event Preferences')
        .field('checkbox', 'Primary Interest Areas')
          .id('interest_areas')
          .required()
          .multiple()
          .options(['technology', 'business', 'creative', 'education'])
          .end()
      
      // Generate dynamic event sections based on selected interests
      .forEach(['technology', 'business', 'creative', 'education'], (category, index, builder) => {
        builder.if(`interest_areas.includes("${category}")`)
          .then(conditionalBuilder =>
            conditionalBuilder.section(`${category.toUpperCase()} Events`)
              .field('checkbox', `Select ${category} topics of interest`)
                .id(`${category}_topics`)
                .multiple()
                .options(['AI/ML', 'Web Development', 'Mobile Apps', 'DevOps', 'Cybersecurity', 'Data Science'])
                .end()
                
              .field('radio', `${category} experience level`)
                .id(`${category}_level`)
                .required()
                .options(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
                .end()
                
              // Dynamic workshop track selection
              .if(`${category}_level == "Advanced" || ${category}_level == "Expert"`)
                .then(advancedBuilder =>
                  advancedBuilder.section(`Advanced ${category.toUpperCase()} Tracks`)
                    .field('checkbox', 'Advanced Workshop Tracks')
                      .id(`${category}_advanced_tracks`)
                      .multiple()
                      .options(['Hands-on Labs', 'Case Studies', 'Expert Panels', 'Certification Prep'])
                      .end()
                )
              .endif()
          )
        .endif()
      })
      
      // Pricing and Registration Options
      .section('Registration Plan & Pricing')
        .field('radio', 'Registration Tier')
          .id('pricing_tier')
          .required()
          .options(['free', 'basic', 'premium', 'enterprise'])
          .end()
      
      // Dynamic pricing information display
      .forEach(['free', 'basic', 'premium', 'enterprise'], (tier, index, builder) => {
        builder.if(`pricing_tier == "${tier}"`)
          .then(tierBuilder => 
            tierBuilder.section(`${tier.toUpperCase()} Plan Details`)
              .field('checkbox', `${tier.toUpperCase()} Plan Features`)
                .id(`${tier}_features`)
                .multiple()
                .options(['Basic Access', 'Live Streaming', 'Q&A', 'Recording Access'])
                .end()
          )
        .endif()
      })
      
      // Early Bird and Group Discounts
      .if('$variables.features.earlyBirdDiscount')
        .then(builder =>
          builder.section('Discount Eligibility')
            .field('checkbox', 'Discount Options')
              .id('discount_options')
              .multiple()
              .options(['Early Bird (20% off)', 'Student Discount (50% off)', 'Group Discount (15% off)', 'Corporate Package'])
              .end()
              
            .if('discount_options.includes("Group Discount")')
              .then(groupBuilder =>
                groupBuilder.section('Group Registration')
                  .field('text', 'Group Code')
                    .id('group_code')
                    .optional()
                    .placeholder('Enter group registration code')
                    .end()
              )
            .endif()
        )
      .endif()
      
      // Geographic and Scheduling Preferences
      .section('Location & Scheduling')
        .field('select', 'Preferred Region')
          .id('preferred_region')
          .required()
          .options(['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East & Africa'])
          .end()
          
        .field('select', 'Time Zone')
          .id('timezone')
          .required()
          .options(['UTC-8', 'UTC-5', 'UTC+0', 'UTC+1', 'UTC+8', 'UTC+9'])
          .end()
          
        .field('checkbox', 'Event Format Preferences')
          .id('format_preferences')
          .multiple()
          .options(['In-Person', 'Virtual', 'Hybrid', 'Self-Paced', 'Live Interactive'])
          .end()
          
        .field('checkbox', 'Preferred Event Days')
          .id('preferred_days')
          .multiple()
          .options(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
          .end()
          
        .field('checkbox', 'Preferred Time Slots')
          .id('preferred_times')
          .multiple()
          .options(['Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-3 PM)', 'Late Afternoon (3-6 PM)', 'Evening (6-9 PM)'])
          .end()
      
      // Custom Agenda Builder (Advanced Feature)
      .if('$variables.features.customAgenda && pricing_tier != "free"')
        .then(builder =>
          builder.section('Custom Agenda Builder')
            .field('number', 'Maximum Events Per Day')
              .id('max_events_per_day')
              .required()
              .min(1)
              .max(10)
              .end()
              
            .repeat(3, (dayIndex, repeatBuilder) => {
              repeatBuilder.field('text', `Day ${dayIndex + 1} Focus Theme`)
                .id(`day_${dayIndex + 1}_theme`)
                .optional()
                .placeholder(`e.g., ${['Technical Deep Dives', 'Business Strategy', 'Networking & Growth'][dayIndex]}`)
                .end()
                
              .field('checkbox', `Day ${dayIndex + 1} Session Types`)
                .id(`day_${dayIndex + 1}_sessions`)
                .multiple()
                .options(['Keynotes', 'Workshops', 'Panels', 'Networking', 'Q&A', 'Demos'])
                .end()
            })
        )
      .endif()
      
      // Accessibility and Special Requirements
      .if('$variables.features.accessibilitySupport')
        .then(builder =>
          builder.section('Accessibility & Special Requirements')
            .field('checkbox', 'Accessibility Needs')
              .id('accessibility_needs')
              .multiple()
              .options(['Screen Reader Support', 'Closed Captions', 'Sign Language Interpreter', 'Large Text', 'High Contrast', 'Audio Descriptions'])
              .end()
              
            .field('textarea', 'Special Dietary Requirements')
              .id('dietary_requirements')
              .optional()
              .placeholder('Please specify any allergies, dietary restrictions, or preferences')
              .maxLength(500)
              .end()
              
            .field('textarea', 'Additional Accommodation Requests')
              .id('additional_accommodations')
              .optional()
              .placeholder('Any other accessibility or accommodation needs')
              .maxLength(1000)
              .end()
        )
      .endif()
      
      // Networking and Social Features
      .if('$variables.features.socialIntegration')
        .then(builder =>
          builder.section('Networking & Social Features')
            .field('radio', 'Networking Comfort Level')
              .id('networking_comfort')
              .required()
              .options(['Very Comfortable', 'Somewhat Comfortable', 'Neutral', 'Somewhat Uncomfortable', 'Prefer Not to Network'])
              .end()
              
            .if('networking_comfort != "Prefer Not to Network"')
              .then(networkingBuilder =>
                networkingBuilder.section('Networking Options')
                  .field('checkbox', 'Networking Interests')
                    .id('networking_interests')
                    .multiple()
                    .options(['1-on-1 Meetings', 'Group Discussions', 'Informal Meetups', 'Business Card Exchange', 'Social Events', 'Professional Mentoring'])
                    .end()
                    
                  .field('checkbox', 'Social Media Integration')
                    .id('social_integration')
                    .multiple()
                    .options(['LinkedIn Profile Sharing', 'Twitter Updates', 'Event Photos', 'Achievement Badges', 'Community Groups'])
                    .end()
              )
            .endif()
            
            .field('textarea', 'Professional Goals for This Event')
              .id('professional_goals')
              .optional()
              .placeholder('What do you hope to achieve? (e.g., learn new skills, make connections, find job opportunities)')
              .maxLength(500)
              .end()
        )
      .endif()
      
      // Dynamic Survey Section based on registration type
      .section('Event Feedback & Expectations')
        .field('range', 'How likely are you to recommend this event to colleagues? (0-10)')
          .id('nps_score')
          .required()
          .min(0)
          .max(10)
          .end()
      
      // Generate dynamic survey questions
      .forEach(['satisfaction', 'recommendation', 'content_quality', 'networking_value'], (questionType, index, builder) => {
        const questionText = questionType === 'satisfaction' ? 'Overall satisfaction with our past events' :
                           questionType === 'recommendation' ? 'Likelihood to recommend to others' :
                           questionType === 'content_quality' ? 'Expected content quality rating' :
                           questionType === 'networking_value' ? 'Importance of networking opportunities' :
                           `Rate ${questionType}`;
        
        builder.field('radio', questionText)
          .id(`survey_${questionType}`)
          .required()
          .options(['Excellent', 'Very Good', 'Good', 'Fair', 'Poor'])
          .end()
      })
      
      .field('textarea', 'What specific topics or speakers would you like to see?')
        .id('topic_suggestions')
        .optional()
        .placeholder('Share your ideas for content, speakers, or session formats')
        .maxLength(1000)
        .end()
        
      .field('textarea', 'How did you hear about this event?')
        .id('referral_source')
        .optional()
        .placeholder('e.g., social media, colleague, previous event, search engine')
        .maxLength(200)
        .end()
      
      // Conditional Marketing and Communication Preferences
      .section('Communication Preferences')
        .field('checkbox', 'Communication Channels')
          .id('communication_channels')
          .multiple()
          .options(['Email Updates', 'SMS Notifications', 'Push Notifications', 'In-App Messages', 'Phone Calls'])
          .end()
          
        .field('checkbox', 'Content Interests for Updates')
          .id('content_interests')
          .multiple()
          .options(['Event Announcements', 'Speaker Spotlights', 'Industry News', 'Exclusive Content', 'Community Discussions', 'Job Opportunities'])
          .end()
          
        .field('radio', 'Email Frequency Preference')
          .id('email_frequency')
          .required()
          .options(['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Event-only', 'No emails'])
          .end()
      
      // GDPR and Privacy Compliance
      .section('Privacy & Data Consent')
        .field('checkbox', 'Required Consents')
          .id('required_consents')
          .required()
          .multiple()
          .options(['I agree to the Terms of Service', 'I agree to the Privacy Policy', 'I consent to data processing for event management'])
          .end()
          
        .field('checkbox', 'Optional Data Usage')
          .id('optional_consents')
          .multiple()
          .options(['Marketing communications', 'Event analytics and improvement', 'Third-party integrations', 'Future event recommendations'])
          .end()
          
        .field('radio', 'Data Retention Preference')
          .id('data_retention')
          .required()
          .options(['Keep my data for future events', 'Delete after this event', 'Delete after 1 year', 'Let me decide later'])
          .end()
      
      // Final Review and Submission
      .section('Review & Confirmation')
        .field('checkbox', 'Final Confirmations')
          .id('final_confirmations')
          .required()
          .multiple()
          .options(['I have reviewed all information', 'All details are accurate', 'I understand the cancellation policy', 'I agree to receive event-related communications'])
          .end()
          
        .field('textarea', 'Additional Comments or Questions')
          .id('additional_comments')
          .optional()
          .placeholder('Any final comments, questions, or special requests?')
          .maxLength(1000)
          .end()
      
      // Configure advanced template behavior
      .autoSave(1500) // Auto-save every 1.5 seconds
      .showProgress() // Show progress indicator
      
      // Advanced styling configuration
      .styling({
        theme: 'professional',
        layout: 'adaptive',
        spacing: 'comfortable',
        colors: ['#2563eb', '#1e40af', '#3b82f6', '#60a5fa'],
        animations: true,
        conditionalStyling: [
          {
            if: 'registration_type == "speaker"',
            then: { theme: 'speaker-premium', colors: ['#7c3aed', '#8b5cf6'] }
          },
          {
            if: 'registration_type == "student"',
            then: { theme: 'student-friendly', colors: ['#059669', '#10b981'] }
          },
          {
            if: 'pricing_tier == "enterprise"',
            then: { theme: 'enterprise', colors: ['#dc2626', '#ef4444'] }
          }
        ]
      })
      
      // Advanced behavior configuration would be handled by the control flow engine
      
      .build();
  }
  
  /**
   * Create a simplified version for testing
   */
  static createSimplified(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Simplified Event Registration')
      .description('Simplified version showcasing core features')
      .variables({
        eventTypes: ['conference', 'workshop', 'webinar'],
        regions: ['North America', 'Europe', 'Asia Pacific']
      })
      .section('Basic Information')
        .field('text', 'Name')
          .id('name')
          .required()
          .end()
        .field('text', 'Email')
          .id('email')
          .required()
          .pattern('^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$')
          .end()
      .section('Event Preferences')
        .field('select', 'Event Type')
          .id('event_type')
          .required()
          .options(['conference', 'workshop', 'webinar'])
          .end()
        .field('select', 'Region')
          .id('region')
          .required()
          .options(['North America', 'Europe', 'Asia Pacific'])
          .end()
      .if('event_type == "conference"')
        .then(builder =>
          builder.section('Conference Details')
            .field('checkbox', 'Session Interests')
              .id('session_interests')
              .multiple()
              .options(['Keynotes', 'Workshops', 'Networking'])
              .end()
        )
      .endif()
      .autoSave(2000)
      .build();
  }
  
  /**
   * Create a dynamic template based on configuration
   */
  static createDynamic(config: {
    includeAdvancedFeatures?: boolean;
    maxSections?: number;
    enableSocialFeatures?: boolean;
    targetAudience?: 'general' | 'enterprise' | 'academic';
  }): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create('Dynamic Event Registration')
      .description(`Dynamic template for ${config.targetAudience || 'general'} audience`)
      .variables({
        features: {
          advanced: config.includeAdvancedFeatures || false,
          social: config.enableSocialFeatures || false,
          maxSections: config.maxSections || 10
        },
        audience: config.targetAudience || 'general'
      });
    
    // Basic sections always included
    builder.section('Registration Information')
      .field('text', 'Full Name')
        .id('name')
        .required()
        .end()
      .field('text', 'Email')
        .id('email')
        .required()
        .end();
    
    // Conditional advanced sections
    if (config.includeAdvancedFeatures) {
      builder.if('$variables.features.advanced')
        .then(advancedBuilder =>
          advancedBuilder.section('Advanced Preferences')
            .field('textarea', 'Custom Requirements')
              .id('custom_requirements')
              .optional()
              .end()
        )
      .endif();
    }
    
    // Target audience specific sections
    switch (config.targetAudience) {
      case 'enterprise':
        builder.section('Enterprise Information')
          .field('text', 'Company')
            .id('company')
            .required()
            .end()
          .field('number', 'Team Size')
            .id('team_size')
            .required()
            .min(1)
            .end();
        break;
      case 'academic':
        builder.section('Academic Information')
          .field('text', 'Institution')
            .id('institution')
            .required()
            .end()
          .field('select', 'Role')
            .id('academic_role')
            .options(['Student', 'Faculty', 'Researcher', 'Administrator'])
            .required()
            .end();
        break;
    }
    
    return builder.autoSave(1000).build();
  }
}

/**
 * Example usage and demonstration
 */
export class EventFormDemo {
  
  /**
   * Demonstrate all template features
   */
  static demonstrateAllFeatures() {
    console.log('🚀 Creating Comprehensive Event Registration Form...');
    
    // Create the full comprehensive form
    const comprehensiveForm = ComprehensiveEventForm.create();
    console.log(`✅ Created template: ${comprehensiveForm.metadata.name}`);
    console.log(`📊 Sections: ${comprehensiveForm.sections.length}`);
    console.log(`🔧 Variables: ${Object.keys(comprehensiveForm.variables || {}).length}`);
    console.log(`🎨 Features: ${comprehensiveForm.behavior.autoSave ? 'Auto-save enabled' : 'Manual save'}`);
    
    // Create simplified version
    const simplifiedForm = ComprehensiveEventForm.createSimplified();
    console.log(`\n📝 Simplified version: ${simplifiedForm.metadata.name}`);
    console.log(`📊 Sections: ${simplifiedForm.sections.length}`);
    
    // Create dynamic versions for different audiences
    const enterpriseForm = ComprehensiveEventForm.createDynamic({
      targetAudience: 'enterprise',
      includeAdvancedFeatures: true,
      enableSocialFeatures: false
    });
    console.log(`\n🏢 Enterprise version: ${enterpriseForm.metadata.name}`);
    
    const academicForm = ComprehensiveEventForm.createDynamic({
      targetAudience: 'academic',
      includeAdvancedFeatures: true,
      enableSocialFeatures: true
    });
    console.log(`🎓 Academic version: ${academicForm.metadata.name}`);
    
    return {
      comprehensive: comprehensiveForm,
      simplified: simplifiedForm,
      enterprise: enterpriseForm,
      academic: academicForm
    };
  }
  
  /**
   * Analyze template complexity and features
   */
  static analyzeTemplate(template: ProgrammaticTemplate) {
    const analysis = {
      metadata: template.metadata,
      sectionCount: template.sections.length,
      fieldCount: template.sections.reduce((sum, section) => sum + section.fields.length, 0),
      variableCount: Object.keys(template.variables || {}).length,
      hasConditionalLogic: template.sections.some(s => s.conditional || s.fields.some(f => f.conditional)),
      hasControlFlow: template.sections.some(s => s.controlFlow),
      hasValidation: template.sections.some(s => s.fields.some(f => f.validation)),
      complexity: 'unknown' as 'low' | 'medium' | 'high' | 'unknown'
    };
    
    // Calculate complexity
    const complexityScore = analysis.fieldCount + 
                          (analysis.hasConditionalLogic ? 10 : 0) + 
                          (analysis.hasControlFlow ? 15 : 0) + 
                          (analysis.variableCount * 2);
    
    if (complexityScore < 20) analysis.complexity = 'low';
    else if (complexityScore < 50) analysis.complexity = 'medium';
    else analysis.complexity = 'high';
    
    return analysis;
  }
}