import { TemplateBuilder } from '../builder/TemplateBuilder';
import { ProgrammaticTemplate } from '../types';

/**
 * Example template demonstrating default value functionality
 */
export class DefaultValueExample {
  static create(): ProgrammaticTemplate {
    return new TemplateBuilder()
      .create('Default Value Example')
      .description('Demonstrates default value functionality in programmatic templates')
      .author('Claude')
      .version('1.0.0')
      .tags('example', 'default-values', 'demo')
      
      .section('Basic Fields with Defaults')
        .field('text', 'Company Name').id('company_name').defaultValue('Acme Corp').end()
        .field('email', 'Contact Email').id('contact_email').defaultValue('contact@acme.com').end()
        .field('number', 'Employee Count').id('employee_count').defaultValue(50).end()
        .field('date', 'Founded Date').id('founded_date').defaultValue('2020-01-01').end()
        .field('text', 'Website').id('website').defaultValue('https://acme.com').placeholder('Enter website URL').end()
        
      .section('Selection Fields with Defaults')
        .field('radio', 'Company Type').id('company_type')
          .options(['Startup', 'SME', 'Enterprise', 'Non-profit'])
          .defaultValue('Startup')
          .end()
        .field('select', 'Industry').id('industry')
          .options(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Other'])
          .defaultValue('Technology')
          .end()
        .field('checkbox', 'Services Offered').id('services')
          .options(['Consulting', 'Development', 'Support', 'Training'])
          .multiple()
          .defaultValue(['Development', 'Support'])
          .end()
        .field('range', 'Annual Revenue (M)').id('revenue')
          .min(0)
          .max(1000)
          .defaultValue(5)
          .end()
          
      .section('Advanced Fields with Defaults')
        .field('textarea', 'Company Description').id('description')
          .defaultValue('We are a leading technology company focused on innovative solutions.')
          .maxLength(500)
          .end()
        .field('radio', 'Remote Work Policy').id('remote_policy')
          .options(['Fully Remote', 'Hybrid', 'On-site Only'])
          .defaultValue('Hybrid')
          .end()
        .field('checkbox', 'Benefits Offered').id('benefits')
          .options(['Health Insurance', 'Dental', 'Vision', '401k', 'Flexible Hours', 'Remote Work'])
          .multiple()
          .defaultValue(['Health Insurance', 'Flexible Hours'])
          .end()
          
      .build();
  }
}