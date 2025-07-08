import { TemplateBuilder, ProgrammaticTemplate } from "../src/programmatic";

/**
 * Section-Level Conditionals Test Template
 * 
 * This template demonstrates section-level conditional logic where entire sections
 * can be shown or hidden based on responses to fields in other sections.
 */
export class SectionConditionalsTestTemplate {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create('Section Conditionals Test')
      .description('Testing section-level conditional logic functionality')
      .author('Claude Code')
      .version('1.0.0')
      .tags('test', 'conditionals', 'sections', 'demo');

    // Section 1: Basic Information (always shown)
    builder.section('Basic Information')
      .field('text', 'Full Name')
        .id('full_name')
        .required()
        .placeholder('Enter your full name')
        .end()
      
      .field('email', 'Email Address')
        .id('email')
        .required()
        .placeholder('Enter your email address')
        .end()
      
      .field('radio', 'Are you a student?')
        .id('is_student')
        .options(['Yes', 'No'])
        .required()
        .layout('horizontal')
        .end()
      
      .field('radio', 'Are you employed?')
        .id('is_employed')
        .options(['Yes', 'No'])
        .required()
        .layout('horizontal')
        .end()
      
      .field('checkbox', 'Which services are you interested in?')
        .id('services_interested')
        .options(['Career Counseling', 'Resume Review', 'Interview Prep', 'Job Search'])
        .multiple()
        .layout('horizontal')
        .end();

    // Section 2: Student Information (conditional on being a student)
    builder.section('Student Information')
      .id('student_info')
      .conditional('is_student', 'equals', ['Yes'])
      .field('text', 'University/College Name')
        .id('university_name')
        .required()
        .placeholder('Enter your institution name')
        .end()
      
      .field('select', 'Year of Study')
        .id('year_of_study')
        .options(['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'])
        .required()
        .end()
      
      .field('text', 'Major/Field of Study')
        .id('major')
        .required()
        .placeholder('Enter your major')
        .end()
      
      .field('date', 'Expected Graduation Date')
        .id('graduation_date')
        .required()
        .end();

    // Section 3: Employment Information (conditional on being employed)
    builder.section('Employment Information')
      .id('employment_info')
      .conditional('is_employed', 'equals', ['Yes'])
      .field('text', 'Company Name')
        .id('company_name')
        .required()
        .placeholder('Enter your company name')
        .end()
      
      .field('text', 'Job Title')
        .id('job_title')
        .required()
        .placeholder('Enter your job title')
        .end()
      
      .field('select', 'Employment Type')
        .id('employment_type')
        .options(['Full-time', 'Part-time', 'Contract', 'Internship'])
        .required()
        .end()
      
      .field('number', 'Years of Experience')
        .id('years_experience')
        .min(0)
        .max(50)
        .placeholder('Enter years of experience')
        .end();

    // Section 4: Career Services (conditional on selecting Career Counseling)
    builder.section('Career Counseling Details')
      .id('career_counseling')
      .conditional('services_interested', 'contains', ['Career Counseling'])
      .field('textarea', 'What career goals are you hoping to achieve?')
        .id('career_goals')
        .required()
        .placeholder('Describe your career aspirations and goals')
        .end()
      
      .field('select', 'Preferred counseling format')
        .id('counseling_format')
        .options(['In-person', 'Video call', 'Phone call', 'Email'])
        .required()
        .end()
      
      .field('checkbox', 'What areas would you like to focus on?')
        .id('focus_areas')
        .options(['Career exploration', 'Skills assessment', 'Goal setting', 'Industry insights'])
        .multiple()
        .layout('horizontal')
        .end();

    // Section 5: Resume Services (conditional on selecting Resume Review)
    builder.section('Resume Review Details')
      .id('resume_review')
      .conditional('services_interested', 'contains', ['Resume Review'])
      .field('file', 'Upload your current resume')
        .id('resume_file')
        .required()
        .end()
      
      .field('select', 'What type of positions are you targeting?')
        .id('position_type')
        .options(['Entry-level', 'Mid-level', 'Senior-level', 'Executive', 'Career change'])
        .required()
        .end()
      
      .field('textarea', 'What specific feedback are you looking for?')
        .id('resume_feedback')
        .placeholder('e.g., formatting, content, keywords, achievements')
        .end();

    // Section 6: Interview Preparation (conditional on selecting Interview Prep)
    builder.section('Interview Preparation Details')
      .id('interview_prep')
      .conditional('services_interested', 'contains', ['Interview Prep'])
      .field('select', 'What type of interview are you preparing for?')
        .id('interview_type')
        .options(['Behavioral', 'Technical', 'Case study', 'Panel interview', 'Phone/Video'])
        .required()
        .end()
      
      .field('text', 'What role/position are you interviewing for?')
        .id('interview_role')
        .required()
        .placeholder('Job title and company if known')
        .end()
      
      .field('textarea', 'What specific areas do you want to practice?')
        .id('practice_areas')
        .placeholder('e.g., answering behavioral questions, technical skills, presentation')
        .end();

    // Section 7: Additional Information (always shown)
    builder.section('Additional Information')
      .field('textarea', 'How did you hear about our services?')
        .id('how_heard')
        .placeholder('Social media, referral, website, etc.')
        .end()
      
      .field('select', 'Preferred contact method')
        .id('contact_method')
        .options(['Email', 'Phone', 'Text message'])
        .required()
        .end()
      
      .field('textarea', 'Any additional comments or questions?')
        .id('additional_comments')
        .placeholder('Feel free to share any other information')
        .end();

    return builder.build();
  }
}