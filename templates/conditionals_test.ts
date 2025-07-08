import { TemplateBuilder, ProgrammaticTemplate } from "../src/programmatic";

/**
 * Conditionals Test Template
 * 
 * This template demonstrates and tests various conditional logic patterns
 * including field visibility, required field dependencies, and complex conditions.
 */
export class ConditionalsTestTemplate {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create('Conditionals Test Form')
      .description('A comprehensive test of conditional logic features including field visibility, required dependencies, and complex conditions')
      .author('Claude Code')
      .version('1.0.0')
      .tags('test', 'conditionals', 'logic', 'demo');

    // Section 1: Basic Conditional Visibility
    builder.section('Basic Conditional Visibility')
      .field('radio', 'Are you employed?')
        .id('employment_status')
        .options(['Yes', 'No'])
        .required()
        .defaultValue('No')
        .layout('horizontal')
        .end()
      
      .field('text', 'Company Name')
        .id('company_name')
        .required()
        .conditional('employment_status', 'equals', ['Yes'])
        .placeholder('Enter your company name')
        .end()
      
      .field('text', 'Job Title')
        .id('job_title')
        .required()
        .conditional('employment_status', 'equals', ['Yes'])
        .placeholder('Enter your job title')
        .end()
      
      .field('textarea', 'Why are you currently unemployed?')
        .id('unemployment_reason')
        .conditional('employment_status', 'equals', ['No'])
        .placeholder('Please explain your current situation')
        .end();

    // Section 2: Multiple Choice Dependencies
    builder.section('Multiple Choice Dependencies')
      .field('select', 'What is your education level?')
        .id('education_level')
        .options(['High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Other'])
        .required()
        .defaultValue('High School')
        .end()
      
      .field('text', 'University/College Name')
        .id('university_name')
        .required()
        .conditional('education_level', 'equals', ['Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'])
        .placeholder('Enter institution name')
        .end()
      
      .field('text', 'Field of Study')
        .id('field_of_study')
        .required()
        .conditional('education_level', 'equals', ['Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD'])
        .placeholder('Enter your major or field')
        .end()
      
      .field('text', 'Please specify your education type')
        .id('education_other')
        .required()
        .conditional('education_level', 'equals', ['Other'])
        .placeholder('Describe your education background')
        .end();

    // Section 3: Checkbox-based Conditions
    builder.section('Checkbox-based Conditions')
      .field('checkbox', 'Which programming languages do you know?')
        .id('programming_languages')
        .options(['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Other'])
        .multiple()
        .layout('horizontal')
        .end()
      
      .field('textarea', 'Describe your JavaScript experience')
        .id('javascript_experience')
        .conditional('programming_languages', 'contains', ['JavaScript'])
        .placeholder('Years of experience, frameworks used, projects, etc.')
        .end()
      
      .field('textarea', 'Describe your Python experience')
        .id('python_experience')
        .conditional('programming_languages', 'contains', ['Python'])
        .placeholder('Libraries used, project types, experience level, etc.')
        .end()
      
      .field('text', 'What other programming languages do you know?')
        .id('other_languages')
        .conditional('programming_languages', 'contains', ['Other'])
        .placeholder('List other languages')
        .end();

    // Section 4: Chained Conditionals
    builder.section('Chained Conditionals')
      .field('radio', 'Do you have a driver\'s license?')
        .id('has_license')
        .options(['Yes', 'No'])
        .required()
        .layout('horizontal')
        .end()
      
      .field('select', 'What type of license do you have?')
        .id('license_type')
        .options(['Regular', 'Commercial', 'Motorcycle', 'Learner\'s Permit'])
        .required()
        .conditional('has_license', 'equals', ['Yes'])
        .end()
      
      .field('text', 'Commercial License Class')
        .id('commercial_class')
        .required()
        .conditional('license_type', 'equals', ['Commercial'])
        .placeholder('CDL Class A, B, or C')
        .end()
      
      .field('checkbox', 'Commercial License Endorsements')
        .id('cdl_endorsements')
        .options(['Passenger (P)', 'School Bus (S)', 'Hazmat (H)', 'Double/Triple (T)', 'Tanker (N)'])
        .multiple()
        .conditional('license_type', 'equals', ['Commercial'])
        .layout('horizontal')
        .end()
      
      .field('date', 'When did you get your motorcycle license?')
        .id('motorcycle_date')
        .conditional('license_type', 'equals', ['Motorcycle'])
        .end()
      
      .field('text', 'Why don\'t you have a driver\'s license?')
        .id('no_license_reason')
        .conditional('has_license', 'equals', ['No'])
        .placeholder('Personal choice, medical reasons, etc.')
        .end();

    // Section 5: Complex Multi-field Conditions
    builder.section('Complex Multi-field Conditions')
      .field('number', 'What is your age?')
        .id('age')
        .required()
        .min(13)
        .max(120)
        .defaultValue(25)
        .end()
      
      .field('radio', 'Are you a student?')
        .id('is_student')
        .options(['Yes', 'No'])
        .required()
        .layout('horizontal')
        .end()
      
      .field('text', 'Parent/Guardian Name')
        .id('guardian_name')
        .required()
        .conditional('age', 'less_than', [18])
        .placeholder('Required for minors')
        .end()
      
      .field('tel', 'Parent/Guardian Phone')
        .id('guardian_phone')
        .required()
        .conditional('age', 'less_than', [18])
        .placeholder('(555) 123-4567')
        .end()
      
      .field('text', 'School Name')
        .id('school_name')
        .required()
        .conditional('is_student', 'equals', ['Yes'])
        .placeholder('Enter school or university name')
        .end()
      
      .field('text', 'Student ID')
        .id('student_id')
        .conditional('is_student', 'equals', ['Yes'])
        .placeholder('Enter your student ID number')
        .end();

    // Section 6: Negation Conditions
    builder.section('Negation Conditions')
      .field('radio', 'Do you have any dietary restrictions?')
        .id('dietary_restrictions')
        .options(['Yes', 'No'])
        .required()
        .layout('horizontal')
        .end()
      
      .field('textarea', 'Please describe your dietary restrictions')
        .id('dietary_details')
        .required()
        .conditional('dietary_restrictions', 'equals', ['Yes'])
        .placeholder('Allergies, vegetarian, vegan, religious restrictions, etc.')
        .end()
      
      .field('checkbox', 'Which meals would you like to receive?')
        .id('meal_preferences')
        .options(['Breakfast', 'Lunch', 'Dinner', 'Snacks'])
        .multiple()
        .conditional('dietary_restrictions', 'not_equals', ['Yes'])
        .layout('horizontal')
        .end()
      
      .field('text', 'Any food preferences?')
        .id('food_preferences')
        .conditional('dietary_restrictions', 'not_equals', ['Yes'])
        .placeholder('Favorite cuisines, preferences, etc.')
        .end();

    // Section 7: Range and Number Conditions
    builder.section('Range and Number Conditions')
      .field('range', 'Rate your programming experience (1-10)')
        .id('programming_experience')
        .min(1)
        .max(10)
        .defaultValue(5)
        .required()
        .end()
      
      .field('textarea', 'What programming concepts would you like to learn?')
        .id('learning_goals')
        .conditional('programming_experience', 'less_than', [6])
        .placeholder('Data structures, algorithms, frameworks, etc.')
        .end()
      
      .field('textarea', 'What advanced topics interest you?')
        .id('advanced_interests')
        .conditional('programming_experience', 'greater_than', [7])
        .placeholder('Architecture, performance optimization, etc.')
        .end()
      
      .field('checkbox', 'Which technologies would you like to mentor others in?')
        .id('mentoring_topics')
        .options(['Web Development', 'Mobile Development', 'Data Science', 'DevOps', 'Machine Learning'])
        .multiple()
        .conditional('programming_experience', 'greater_than', [8])
        .layout('horizontal')
        .end();

    // Section 8: File Upload Conditions
    builder.section('File Upload Conditions')
      .field('radio', 'Are you applying for a technical position?')
        .id('technical_position')
        .options(['Yes', 'No'])
        .required()
        .layout('horizontal')
        .end()
      
      .field('file', 'Upload your resume/CV')
        .id('resume_upload')
        .required()
        .end()
      
      .field('file', 'Upload your portfolio or code samples')
        .id('portfolio_upload')
        .conditional('technical_position', 'equals', ['Yes'])
        .end()
      
      .field('url', 'GitHub Profile URL')
        .id('github_url')
        .conditional('technical_position', 'equals', ['Yes'])
        .placeholder('https://github.com/username')
        .end()
      
      .field('url', 'LinkedIn Profile URL')
        .id('linkedin_url')
        .conditional('technical_position', 'not_equals', ['Yes'])
        .placeholder('https://linkedin.com/in/username')
        .end();

    // Section 9: Final Validation
    builder.section('Final Validation')
      .field('checkbox', 'Please confirm the following:')
        .id('confirmations')
        .options([
          'I have reviewed all my answers',
          'The information provided is accurate',
          'I understand this is a test form',
          'I consent to data processing'
        ])
        .multiple()
        .required()
        .layout('vertical')
        .end()
      
      .field('textarea', 'Additional comments or questions')
        .id('additional_comments')
        .placeholder('Any additional information you\'d like to share')
        .end()
      
      .field('text', 'Digital Signature')
        .id('digital_signature')
        .required()
        .conditional('confirmations', 'contains', ['I have reviewed all my answers', 'The information provided is accurate'])
        .placeholder('Type your full name as digital signature')
        .end();

    return builder.build();
  }
}