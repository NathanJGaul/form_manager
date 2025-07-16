import { TemplateBuilder } from '../builder/TemplateBuilder';
import { ProgrammaticTemplate } from '../types';

export const ParagraphFieldExample: ProgrammaticTemplate = new TemplateBuilder()
  .metadata({
    name: 'Paragraph Field Example',
    version: '1.0.0',
    description: 'Demonstrates the use of text fields for instructions and information',
    author: 'Form System',
    tags: ['example', 'text', 'instructions'],
  })
  .section('personal-info', 'Personal Information')
    .field('text', 'Instructions')
      .id('instructions')
      .withContent('Please fill out the following personal information. All fields marked with an asterisk (*) are required. Your information will be kept confidential and used only for the purposes stated in our privacy policy.')
      .end()
    .field('text', 'First Name')
      .id('first-name')
      .required()
      .placeholder('Enter your first name')
      .end()
    .field('text', 'Last Name')
      .id('last-name')
      .required()
      .placeholder('Enter your last name')
      .end()
    .field('email', 'Email Address')
      .id('email')
      .required()
      .placeholder('your.email@example.com')
      .end()
    .end()
  .section('survey', 'Survey Questions')
    .field('text', 'About This Survey')
      .id('survey-intro')
      .withContent(`This survey helps us understand your preferences and improve our services.
          
Please answer the following questions honestly. There are no right or wrong answers - we're simply interested in your personal opinions and experiences.

Your responses will be anonymized and aggregated with other participants' responses.`)
      .end()
    .field('radio', 'How satisfied are you with our service?')
      .id('satisfaction')
      .options(['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very Dissatisfied'])
      .required()
      .end()
    .field('radio', 'Would you recommend our service to others?')
      .id('recommendation')
      .options(['Definitely Yes', 'Probably Yes', 'Not Sure', 'Probably Not', 'Definitely Not'])
      .required()
      .end()
    .field('text', '')  // No label for this instruction text
      .id('feedback-instructions')
      .withContent('The following question is optional but your feedback would be greatly appreciated:')
      .end()
    .field('textarea', 'Additional Comments')
      .id('comments')
      .placeholder('Please share any additional thoughts or suggestions...')
      .end()
    .end()
  .build();