import { TemplateBuilder, ProgrammaticTemplate } from "../src/programmatic";

/**
 * Simple Conditionals Test Template
 * 
 * A focused template for testing basic conditional logic patterns.
 * Perfect for quick testing and demonstration of conditional features.
 */
export class SimpleConditionalsTestTemplate {
  static create(): ProgrammaticTemplate {
    const builder = new TemplateBuilder()
      .create('Simple Conditionals Test')
      .description('A focused test of basic conditional logic features')
      .author('Claude Code')
      .version('1.0.0')
      .tags('test', 'conditionals', 'simple', 'demo');

    // Section 1: Basic Yes/No Conditionals
    builder.section('Basic Yes/No Conditionals')
      .field('radio', 'Do you own a car?')
        .id('owns_car')
        .options(['Yes', 'No'])
        .required()
        .layout('horizontal')
        .defaultValue('No')
        .end()
      
      .field('text', 'What make is your car?')
        .id('car_make')
        .required()
        .conditional('owns_car', 'equals', ['Yes'])
        .placeholder('Toyota, Honda, Ford, etc.')
        .end()
      
      .field('text', 'What model is your car?')
        .id('car_model')
        .required()
        .conditional('owns_car', 'equals', ['Yes'])
        .placeholder('Camry, Accord, F-150, etc.')
        .end()
      
      .field('number', 'What year is your car?')
        .id('car_year')
        .conditional('owns_car', 'equals', ['Yes'])
        .min(1900)
        .max(2024)
        .placeholder('2020')
        .end()
      
      .field('textarea', 'Why don\'t you own a car?')
        .id('no_car_reason')
        .conditional('owns_car', 'equals', ['No'])
        .placeholder('Cost, environmental concerns, live in city, etc.')
        .end();

    // Section 2: Multiple Choice Conditionals
    builder.section('Multiple Choice Conditionals')
      .field('select', 'What is your favorite season?')
        .id('favorite_season')
        .options(['Spring', 'Summer', 'Fall', 'Winter'])
        .required()
        .defaultValue('Spring')
        .end()
      
      .field('text', 'What do you like about spring?')
        .id('spring_likes')
        .conditional('favorite_season', 'equals', ['Spring'])
        .placeholder('Flowers blooming, mild weather, etc.')
        .end()
      
      .field('text', 'What\'s your favorite summer activity?')
        .id('summer_activity')
        .conditional('favorite_season', 'equals', ['Summer'])
        .placeholder('Swimming, hiking, barbecues, etc.')
        .end()
      
      .field('text', 'What do you enjoy about fall?')
        .id('fall_enjoys')
        .conditional('favorite_season', 'equals', ['Fall'])
        .placeholder('Changing leaves, cooler weather, etc.')
        .end()
      
      .field('text', 'What\'s your favorite winter activity?')
        .id('winter_activity')
        .conditional('favorite_season', 'equals', ['Winter'])
        .placeholder('Skiing, hot chocolate, holidays, etc.')
        .end();

    // Section 3: Checkbox Conditionals
    builder.section('Checkbox Conditionals')
      .field('checkbox', 'Which pets do you have?')
        .id('pets')
        .options(['Dog', 'Cat', 'Bird', 'Fish', 'Other'])
        .multiple()
        .layout('horizontal')
        .end()
      
      .field('text', 'What is your dog\'s name?')
        .id('dog_name')
        .conditional('pets', 'contains', ['Dog'])
        .placeholder('Enter your dog\'s name')
        .end()
      
      .field('text', 'What is your cat\'s name?')
        .id('cat_name')
        .conditional('pets', 'contains', ['Cat'])
        .placeholder('Enter your cat\'s name')
        .end()
      
      .field('text', 'What kind of bird do you have?')
        .id('bird_type')
        .conditional('pets', 'contains', ['Bird'])
        .placeholder('Parakeet, canary, parrot, etc.')
        .end()
      
      .field('text', 'What other pets do you have?')
        .id('other_pets')
        .conditional('pets', 'contains', ['Other'])
        .placeholder('Describe your other pets')
        .end();

    // Section 4: Chained Conditionals
    builder.section('Chained Conditionals')
      .field('radio', 'Do you work from home?')
        .id('works_from_home')
        .options(['Yes', 'No', 'Sometimes'])
        .required()
        .layout('horizontal')
        .end()
      
      .field('text', 'What is your home office setup like?')
        .id('home_office')
        .conditional('works_from_home', 'equals', ['Yes'])
        .placeholder('Describe your workspace')
        .end()
      
      .field('radio', 'Do you prefer working from home?')
        .id('prefers_home')
        .options(['Yes', 'No'])
        .required()
        .conditional('works_from_home', 'equals', ['Yes'])
        .layout('horizontal')
        .end()
      
      .field('textarea', 'What do you like about working from home?')
        .id('home_benefits')
        .conditional('prefers_home', 'equals', ['Yes'])
        .placeholder('No commute, flexible schedule, etc.')
        .end()
      
      .field('textarea', 'What challenges do you face working from home?')
        .id('home_challenges')
        .conditional('prefers_home', 'equals', ['No'])
        .placeholder('Distractions, isolation, etc.')
        .end()
      
      .field('number', 'How many days per week do you work from home?')
        .id('home_days')
        .conditional('works_from_home', 'equals', ['Sometimes'])
        .min(1)
        .max(7)
        .placeholder('3')
        .end();

    // Section 5: Number Range Conditionals
    builder.section('Number Range Conditionals')
      .field('number', 'How many hours of sleep do you get per night?')
        .id('sleep_hours')
        .required()
        .min(0)
        .max(24)
        .defaultValue(8)
        .end()
      
      .field('textarea', 'You might not be getting enough sleep. What prevents you from sleeping more?')
        .id('sleep_issues')
        .conditional('sleep_hours', 'less_than', [7])
        .placeholder('Work schedule, stress, insomnia, etc.')
        .end()
      
      .field('text', 'What helps you get such good sleep?')
        .id('sleep_tips')
        .conditional('sleep_hours', 'greater_than', [8])
        .placeholder('Good routine, comfortable bed, etc.')
        .end()
      
      .field('radio', 'Do you feel rested when you wake up?')
        .id('feels_rested')
        .options(['Always', 'Usually', 'Sometimes', 'Rarely', 'Never'])
        .required()
        .conditional('sleep_hours', 'greater_than', [5])
        .end();

    // Section 6: Final Summary
    builder.section('Final Summary')
      .field('range', 'How would you rate this form\'s conditional logic? (1-10)')
        .id('form_rating')
        .min(1)
        .max(10)
        .defaultValue(5)
        .required()
        .end()
      
      .field('textarea', 'What improvements would you suggest?')
        .id('improvements')
        .conditional('form_rating', 'less_than', [8])
        .placeholder('What could make this form better?')
        .end()
      
      .field('text', 'What did you like most about this form?')
        .id('liked_most')
        .conditional('form_rating', 'greater_than', [7])
        .placeholder('Easy to use, good logic, etc.')
        .end()
      
      .field('checkbox', 'Would you recommend this form system?')
        .id('recommend')
        .options(['Yes, definitely', 'Yes, with reservations', 'No, needs work', 'No, not at all'])
        .required()
        .conditional('form_rating', 'greater_than', [3])
        .end();

    return builder.build();
  }
}