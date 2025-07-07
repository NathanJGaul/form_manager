import { TemplateBuilder, ProgrammaticTemplate } from "../src/programmatic";

/**
 * Demonstration Template: Horizontal Layout and Grouping Features
 * 
 * This template showcases the advanced layout capabilities of the Form Manager,
 * including horizontal layouts for radio buttons and checkboxes, intelligent
 * field grouping for matrix-style forms, and sensible default values.
 * 
 * Features demonstrated:
 * - Horizontal radio button layouts
 * - Horizontal checkbox layouts
 * - Matrix-style grouped fields
 * - Mixed layout types
 * - Default value configurations
 * - Real-world survey scenarios
 */

export class HorizontalGroupingDemo {
  static create(): ProgrammaticTemplate {
  const builder = new TemplateBuilder()
  .create('Customer Experience Survey')
  .description('Comprehensive survey demonstrating horizontal layouts, field grouping, and default values')
  .author('Form Manager Demo')
  .version('1.0.0')
  .tags('demo', 'horizontal', 'grouping', 'survey', 'advanced')
  .autoSave(15000) // Auto-save every 15 seconds
  .showProgress()

  // Basic Information Section
  .section('Customer Information')
    .field('text', 'Full Name')
      .id('customer_name')
      .required()
      .placeholder('Enter your full name')
      .defaultValue('John Smith')
      .end()
    
    .field('email', 'Email Address')
      .id('customer_email')
      .required()
      .placeholder('your.email@example.com')
      .defaultValue('john.smith@example.com')
      .end()
    
    .field('radio', 'Customer Type')
      .id('customer_type')
      .options(['First-time Customer', 'Regular Customer', 'Premium Member'])
      .layout('horizontal')
      .defaultValue('Regular Customer')
      .required()
      .end()
    
    .field('radio', 'Visit Frequency')
      .id('visit_frequency')
      .options(['Weekly', 'Monthly', 'Quarterly', 'Annually'])
      .layout('horizontal')
      .defaultValue('Monthly')
      .end()

  // Service Rating Matrix Section
  .section('Service Evaluation Matrix')
    .field('radio', 'Product Quality')
      .id('product_quality')
      .options(['Poor', 'Fair', 'Good', 'Excellent', 'Outstanding'])
      .layout('horizontal')
      .grouping(true, 'service_ratings')
      .defaultValue('Good')
      .required()
      .end()
    
    .field('radio', 'Customer Service')
      .id('customer_service')
      .options(['Poor', 'Fair', 'Good', 'Excellent', 'Outstanding'])
      .layout('horizontal')
      .grouping(true, 'service_ratings')
      .defaultValue('Good')
      .required()
      .end()
    
    .field('radio', 'Value for Money')
      .id('value_for_money')
      .options(['Poor', 'Fair', 'Good', 'Excellent', 'Outstanding'])
      .layout('horizontal')
      .grouping(true, 'service_ratings')
      .defaultValue('Fair')
      .required()
      .end()
    
    .field('radio', 'Delivery Speed')
      .id('delivery_speed')
      .options(['Poor', 'Fair', 'Good', 'Excellent', 'Outstanding'])
      .layout('horizontal')
      .grouping(true, 'service_ratings')
      .defaultValue('Good')
      .required()
      .end()

  // Agreement Scale Section
  .section('Agreement Statements')
    .field('radio', 'I would recommend this service to friends')
      .id('recommend_friends')
      .options(['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'])
      .layout('horizontal')
      .grouping(true, 'agreement_scale')
      .defaultValue('Agree')
      .required()
      .end()
    
    .field('radio', 'The service exceeded my expectations')
      .id('exceeded_expectations')
      .options(['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'])
      .layout('horizontal')
      .grouping(true, 'agreement_scale')
      .defaultValue('Neutral')
      .required()
      .end()
    
    .field('radio', 'I will continue using this service')
      .id('continue_using')
      .options(['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'])
      .layout('horizontal')
      .grouping(true, 'agreement_scale')
      .defaultValue('Agree')
      .required()
      .end()

  // Preferences Section (Horizontal Checkboxes)
  .section('Communication and Service Preferences')
    .field('checkbox', 'Preferred Contact Methods')
      .id('contact_methods')
      .options(['Email', 'Phone', 'SMS', 'Mail', 'In-App'])
      .layout('horizontal')
      .defaultValue(['Email', 'SMS'])
      .end()
    
    .field('checkbox', 'Notification Preferences')
      .id('notification_preferences')
      .options(['Order Updates', 'Promotions', 'New Features', 'Surveys', 'Newsletter'])
      .layout('horizontal')
      .defaultValue(['Order Updates', 'New Features'])
      .end()
    
    .field('checkbox', 'Service Features Used')
      .id('features_used')
      .options(['Mobile App', 'Website', 'Customer Support', 'Live Chat', 'FAQ'])
      .layout('horizontal')
      .defaultValue(['Website', 'Mobile App'])
      .end()

  // Mixed Layout Comparison Section
  .section('Layout Comparison')
    .field('radio', 'Preferred Layout Style (Vertical)')
      .id('layout_vertical')
      .options(['Very Compact', 'Compact', 'Normal', 'Spacious', 'Very Spacious'])
      .layout('vertical') // Explicitly vertical for comparison
      .defaultValue('Normal')
      .end()
    
    .field('radio', 'Preferred Layout Style (Horizontal)')
      .id('layout_horizontal')
      .options(['Very Compact', 'Compact', 'Normal', 'Spacious', 'Very Spacious'])
      .layout('horizontal')
      .defaultValue('Normal')
      .end()

  // Priority Matrix Section
  .section('Feature Priority Matrix')
    .field('radio', 'User Interface Improvements')
      .id('ui_priority')
      .options(['Low', 'Medium', 'High', 'Critical'])
      .layout('horizontal')
      .grouping(true, 'feature_priorities')
      .defaultValue('Medium')
      .end()
    
    .field('radio', 'Performance Enhancements')
      .id('performance_priority')
      .options(['Low', 'Medium', 'High', 'Critical'])
      .layout('horizontal')
      .grouping(true, 'feature_priorities')
      .defaultValue('High')
      .end()
    
    .field('radio', 'New Feature Development')
      .id('features_priority')
      .options(['Low', 'Medium', 'High', 'Critical'])
      .layout('horizontal')
      .grouping(true, 'feature_priorities')
      .defaultValue('Medium')
      .end()
    
    .field('radio', 'Bug Fixes')
      .id('bugfix_priority')
      .options(['Low', 'Medium', 'High', 'Critical'])
      .layout('horizontal')
      .grouping(true, 'feature_priorities')
      .defaultValue('High')
      .end()

  // Department Satisfaction Matrix
  .section('Department-Specific Feedback')
    .field('radio', 'Sales Team')
      .id('sales_satisfaction')
      .options(['1', '2', '3', '4', '5'])
      .layout('horizontal')
      .grouping(true, 'department_ratings')
      .defaultValue('4')
      .end()
    
    .field('radio', 'Technical Support')
      .id('support_satisfaction')
      .options(['1', '2', '3', '4', '5'])
      .layout('horizontal')
      .grouping(true, 'department_ratings')
      .defaultValue('4')
      .end()
    
    .field('radio', 'Account Management')
      .id('account_satisfaction')
      .options(['1', '2', '3', '4', '5'])
      .layout('horizontal')
      .grouping(true, 'department_ratings')
      .defaultValue('3')
      .end()
    
    .field('radio', 'Billing Department')
      .id('billing_satisfaction')
      .options(['1', '2', '3', '4', '5'])
      .layout('horizontal')
      .grouping(true, 'department_ratings')
      .defaultValue('3')
      .end()

  // Time-based Preferences
  .section('Time and Availability Preferences')
    .field('checkbox', 'Preferred Contact Times')
      .id('contact_times')
      .options(['Morning (8-12)', 'Afternoon (12-5)', 'Evening (5-8)', 'Weekend'])
      .layout('horizontal')
      .defaultValue(['Morning (8-12)', 'Afternoon (12-5)'])
      .end()
    
    .field('checkbox', 'Preferred Service Days')
      .id('service_days')
      .options(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
      .layout('horizontal')
      .defaultValue(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
      .end()

  // Final Feedback Section
  .section('Additional Feedback')
    .field('range', 'Overall Satisfaction Score')
      .id('overall_score')
      .min(1)
      .max(10)
      .defaultValue(7)
      .end()
    
    .field('radio', 'Likelihood to Recommend (NPS)')
      .id('nps_score')
      .options(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'])
      .layout('horizontal')
      .defaultValue('7')
      .required()
      .end()
    
    .field('textarea', 'Additional Comments')
      .id('additional_comments')
      .placeholder('Please share any additional thoughts, suggestions, or feedback...')
      .defaultValue('Overall, I am satisfied with the service and would recommend it to others.')
      .maxLength(1000)
      .end()
    
    .field('checkbox', 'Follow-up Preferences')
      .id('followup_preferences')
      .options(['Email Summary', 'Phone Call', 'Survey Results', 'No Follow-up'])
      .layout('horizontal')
      .defaultValue(['Email Summary'])
      .end()

  return builder.build();
  }
}