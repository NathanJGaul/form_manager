# Field Types and Programmatic API Documentation

## Overview

This document provides comprehensive documentation for all supported field types, their options, validation rules, and the programmatic template API for the Form Manager application.

## Table of Contents

1. [Field Types](#field-types)
2. [Field Properties](#field-properties)
3. [Validation Rules](#validation-rules)
4. [Conditional Logic](#conditional-logic)
5. [Programmatic API](#programmatic-api)
6. [Control Flow](#control-flow)
7. [Template Configuration](#template-configuration)
8. [Examples](#examples)

## Field Types

### 1. Text Input (`text`)

Basic single-line text input field.

**Properties:**
- `label` (required): Display label for the field
- `placeholder` (optional): Hint text shown in the input
- `required` (optional): Whether the field is required
- `defaultValue` (optional): Pre-filled value
- `validation` (optional): Validation rules (minLength, maxLength, pattern)

**Example:**
```typescript
.field('text', 'Full Name')
  .placeholder('Enter your full name')
  .required()
  .defaultValue('John Doe')
  .minLength(2)
  .maxLength(50)
  .end()
```

### 2. Text Area (`textarea`)

Multi-line text input field.

**Properties:**
- Same as text input
- Typically renders with multiple rows

**Example:**
```typescript
.field('textarea', 'Description')
  .placeholder('Enter a detailed description')
  .defaultValue('Tell us about yourself...')
  .maxLength(500)
  .end()
```

### 3. Number Input (`number`)

Numeric input field with optional min/max constraints.

**Properties:**
- `min` (optional): Minimum allowed value
- `max` (optional): Maximum allowed value
- `defaultValue` (optional): Default numeric value

**Example:**
```typescript
.field('number', 'Age')
  .min(18)
  .max(120)
  .defaultValue(25)
  .required()
  .end()
```

### 4. Date Input (`date`)

Date picker field.

**Properties:**
- `defaultValue` (optional): Default date in 'YYYY-MM-DD' format

**Example:**
```typescript
.field('date', 'Birth Date')
  .defaultValue('1990-01-01')
  .required()
  .end()
```

### 5. Email Input (`email`)

Email address input with built-in validation.

**Example:**
```typescript
.field('email', 'Email Address')
  .placeholder('user@example.com')
  .defaultValue('john@example.com')
  .required()
  .end()
```

### 6. Phone Input (`tel`)

Telephone number input field.

**Example:**
```typescript
.field('tel', 'Phone Number')
  .placeholder('+1 (555) 123-4567')
  .pattern('[0-9\-\+\s\(\)]*')
  .end()
```

### 7. URL Input (`url`)

URL input field.

**Note:** This field type is available programmatically but not yet in the Form Builder UI.

**Example:**
```typescript
.field('url', 'Website')
  .placeholder('https://example.com')
  .defaultValue('https://acme.com')
  .end()
```

### 8. Time Input (`time`)

Time picker field.

**Note:** This field type is available programmatically but not yet in the Form Builder UI.

**Example:**
```typescript
.field('time', 'Appointment Time')
  .defaultValue('14:30')
  .end()
```

### 9. Select Dropdown (`select`)

Single-selection dropdown menu.

**Properties:**
- `options` (required): Array of available options
- `defaultValue` (optional): Pre-selected option

**Example:**
```typescript
.field('select', 'Country')
  .options(['USA', 'Canada', 'UK', 'Australia'])
  .defaultValue('USA')
  .required()
  .end()
```

### 10. Radio Buttons (`radio`)

Single-selection radio button group with support for horizontal layout and grouping.

**Properties:**
- `options` (required): Array of available options
- `defaultValue` (optional): Pre-selected option
- `layout` (optional): Display layout - 'vertical' (default) or 'horizontal'
- `grouping` (optional): Grouping configuration for related fields

**Examples:**

Basic radio buttons:
```typescript
.field('radio', 'Experience Level')
  .options(['Beginner', 'Intermediate', 'Advanced'])
  .defaultValue('Intermediate')
  .required()
  .end()
```

Horizontal layout:
```typescript
.field('radio', 'Priority Level')
  .options(['Low', 'Medium', 'High', 'Critical'])
  .layout('horizontal')
  .required()
  .end()
```

Grouped radio buttons (for matrix-style forms):
```typescript
.field('radio', 'Product Quality')
  .options(['Poor', 'Fair', 'Good', 'Excellent'])
  .layout('horizontal')
  .grouping(true, 'satisfaction_ratings')
  .end()
.field('radio', 'Customer Service')
  .options(['Poor', 'Fair', 'Good', 'Excellent'])
  .layout('horizontal')
  .grouping(true, 'satisfaction_ratings')
  .end()
```

### 11. Checkboxes (`checkbox`)

Multi-selection checkbox group with support for horizontal layout and grouping.

**Properties:**
- `options` (required): Array of available options
- `multiple` (automatic): Always true for checkboxes
- `defaultValue` (optional): Array of pre-selected options
- `layout` (optional): Display layout - 'vertical' (default) or 'horizontal'
- `grouping` (optional): Grouping configuration for related fields

**Examples:**

Basic checkboxes:
```typescript
.field('checkbox', 'Skills')
  .options(['JavaScript', 'TypeScript', 'React', 'Node.js'])
  .defaultValue(['JavaScript', 'TypeScript'])
  .end()
```

Horizontal layout:
```typescript
.field('checkbox', 'Interests')
  .options(['Technology', 'Sports', 'Music', 'Travel', 'Reading'])
  .layout('horizontal')
  .end()
```

Grouped checkboxes:
```typescript
.field('checkbox', 'Morning Activities')
  .options(['Exercise', 'Coffee', 'News', 'Email'])
  .layout('horizontal')
  .grouping(true, 'daily_activities')
  .end()
.field('checkbox', 'Evening Activities')
  .options(['Exercise', 'Coffee', 'News', 'Email'])
  .layout('horizontal')
  .grouping(true, 'daily_activities')
  .end()
```

### 12. Range Slider (`range`)

Numeric range slider input.

**Note:** This field type is available programmatically but not yet in the Form Builder UI.

**Properties:**
- `min` (required): Minimum value
- `max` (required): Maximum value
- `defaultValue` (optional): Default position

**Example:**
```typescript
.field('range', 'Budget (K)')
  .min(0)
  .max(1000)
  .defaultValue(100)
  .end()
```

### 13. File Upload (`file`)

File upload input. The `FormRenderer` currently defaults to `accept="image/*"`.

**Properties:**
- `accept` (optional): MIME types or file extensions (programmatic only)
- `multiple` (optional): Allow multiple file selection

**Example:**
```typescript
.field('file', 'Resume')
  .required()
  .end()
```

## Field Properties

### Core Properties

All fields support these core properties:

```typescript
interface BaseField {
  id: string;                    // Unique identifier (auto-generated if not specified)
  type: FieldType;              // Field type (see above)
  label: string;                // Display label
  placeholder?: string;         // Placeholder text
  required?: boolean;           // Whether field is required
  defaultValue?: any;           // Default value
  validation?: ValidationRules; // Validation configuration
  conditional?: ConditionalRule; // Conditional display logic
}
```

### Validation Rules

```typescript
interface ValidationRules {
  min?: number;                 // Minimum value (numbers) or minimum selections
  max?: number;                 // Maximum value (numbers) or maximum selections
  minLength?: number;           // Minimum text length
  maxLength?: number;           // Maximum text length
  pattern?: string;             // Regular expression pattern
  custom?: (value: any) => boolean | string; // Custom validation function
}
```

### Conditional Logic

Fields can be shown/hidden based on other field values:

```typescript
interface ConditionalRule {
  dependsOn: string;            // ID of the field to depend on
  values: string[];             // Values that trigger showing this field
  operator: 'equals' | 'contains' | 'not_equals'; // Comparison operator
}
```

## Programmatic API

### TemplateBuilder

The main class for building templates programmatically.

#### Constructor Options

```typescript
interface FluentBuilderOptions {
  strict?: boolean;             // Enable strict validation
  validateOnBuild?: boolean;    // Validate template when building
  autoId?: boolean;             // Auto-generate field IDs
  defaultRequired?: boolean;    // Make all fields required by default
}
```

#### Core Methods

```typescript
// Template metadata
.create(name: string)                    // Set template name
.description(description: string)        // Set template description
.version(version: string)               // Set template version
.author(author: string)                 // Set template author
.tags(...tags: string[])               // Add tags

// Template configuration
.variables(variables: Record<string, any>) // Set template variables
.schema(validation: 'strict' | 'loose' | 'none') // Set validation schema
.requiredFields(...fields: string[])    // Mark fields as required
.autoSave(interval?: number)            // Enable auto-save
.showProgress()                         // Show progress indicator
.styling(config: StylingConfig)         // Configure styling

// Structure
.section(title: string)                 // Create a new section
.field(type: FieldType, label: string)  // Add a field to current section

// Build
.build()                               // Build and return the template
```

### SectionBuilder

Returned by `.section()` method for configuring sections.

```typescript
// Section methods
.conditional(dependsOn: string, operator: string, values: string[]) // Add conditional logic
.end()                                  // Return to TemplateBuilder
```

### FieldBuilder

Returned by `.field()` method for configuring individual fields.

#### Field Configuration Methods

```typescript
// Basic properties
.id(id: string)                        // Set custom field ID
.required(required?: boolean)          // Make field required
.optional()                           // Make field optional
.placeholder(text: string)            // Set placeholder text
.defaultValue(value: any)             // Set default value

// Options (for select, radio, checkbox)
.options(options: string[] | {value: string, label: string}[]) // Set field options
.multiple(multiple?: boolean)         // Enable multiple selection

// Validation
.validation(rules: ValidationRules)   // Set validation rules
.min(min: number)                     // Set minimum value/length
.max(max: number)                     // Set maximum value/length
.minLength(length: number)            // Set minimum text length
.maxLength(length: number)            // Set maximum text length
.pattern(pattern: string)             // Set regex pattern

// Conditional logic
.conditional(dependsOn: string, operator: string, values: string[]) // Add conditional logic

// Layout and Grouping (for radio and checkbox fields)
.layout(layout: 'vertical' | 'horizontal') // Set field layout
.grouping(enabled: boolean, groupKey?: string) // Configure field grouping

// Navigation
.end()                                // Return to SectionBuilder
.field(type: FieldType, label: string) // Add another field to same section
```

## Control Flow

### Conditional Logic

Show/hide fields based on other field values:

```typescript
.field('radio', 'Has Experience')
  .options(['Yes', 'No'])
  .end()
.field('number', 'Years of Experience')
  .conditional('has_experience', 'equals', ['Yes'])
  .min(0)
  .max(50)
  .end()
```

### Loops and Iteration

Create dynamic sections with loops:

```typescript
// forEach loop
.forEach(['Frontend', 'Backend', 'DevOps'], (skill, index, builder) => {
  builder.field('radio', `${skill} Experience`)
    .options(['None', 'Basic', 'Intermediate', 'Expert'])
    .end();
})

// repeat loop
.repeat(3, (index, builder) => {
  builder.field('text', `Reference ${index + 1} Name`)
    .required()
    .end();
})

// while loop with condition
.while('user.needsMoreInfo === true', (builder) => {
  builder.field('textarea', 'Additional Information')
    .end();
})
```

## Horizontal Layout and Grouping

### Overview

The Form Manager supports advanced layout options for radio buttons and checkboxes, including horizontal layouts and intelligent grouping of related fields. These features help optimize form space usage and create more intuitive user interfaces.

### Horizontal Layout

By default, radio buttons and checkboxes are displayed vertically (stacked). The horizontal layout option displays options side-by-side, which is ideal for:

- Short option lists (2-5 items)
- Rating scales
- Yes/No questions
- Priority levels
- Forms with limited vertical space

#### Usage

```typescript
// Horizontal radio buttons
.field('radio', 'Satisfaction Level')
  .options(['Poor', 'Fair', 'Good', 'Excellent'])
  .layout('horizontal')
  .end()

// Horizontal checkboxes
.field('checkbox', 'Preferred Contact Methods')
  .options(['Email', 'Phone', 'SMS', 'Mail'])
  .layout('horizontal')
  .end()
```

### Field Grouping

Field grouping allows you to visually group related fields that share the same options. When multiple fields have:
- The same group key
- Identical options
- Horizontal layout

They are rendered in a matrix format with shared column headers, creating a compact and intuitive interface.

#### Grouping Benefits

1. **Space Efficiency**: Reduces repetitive option labels
2. **Visual Clarity**: Related questions are clearly grouped together
3. **User Experience**: Easier to compare and answer related questions
4. **Consistency**: Ensures consistent option presentation

#### Matrix Rendering

When grouped fields meet the criteria, they are rendered as:

```
                Poor    Fair    Good    Excellent
Product Quality  ○       ○       ●       ○
Customer Service ○       ●       ○       ○
Delivery Speed   ○       ○       ○       ●
```

#### Usage Examples

**Simple Grouping:**
```typescript
.field('radio', 'Product Quality')
  .options(['Poor', 'Fair', 'Good', 'Excellent'])
  .layout('horizontal')
  .grouping(true, 'service_ratings')
  .end()
.field('radio', 'Customer Service')
  .options(['Poor', 'Fair', 'Good', 'Excellent'])
  .layout('horizontal')
  .grouping(true, 'service_ratings')
  .end()
```

**Checkbox Grouping:**
```typescript
.field('checkbox', 'Morning Preferences')
  .options(['Coffee', 'Exercise', 'News', 'Music'])
  .layout('horizontal')
  .grouping(true, 'daily_preferences')
  .end()
.field('checkbox', 'Evening Preferences')
  .options(['Coffee', 'Exercise', 'News', 'Music'])
  .layout('horizontal')
  .grouping(true, 'daily_preferences')
  .end()
```

**Complex Survey Rating:**
```typescript
const ratingOptions = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

.section('Service Evaluation')
  .field('radio', 'Staff was helpful')
    .options(ratingOptions)
    .layout('horizontal')
    .grouping(true, 'service_evaluation')
    .required()
    .end()
  .field('radio', 'Response time was adequate')
    .options(ratingOptions)
    .layout('horizontal')
    .grouping(true, 'service_evaluation')
    .required()
    .end()
  .field('radio', 'Problem was resolved effectively')
    .options(ratingOptions)
    .layout('horizontal')
    .grouping(true, 'service_evaluation')
    .required()
    .end()
```

### Best Practices

#### When to Use Horizontal Layout

✅ **Good use cases:**
- Rating scales (1-5, Poor-Excellent)
- Binary choices (Yes/No, True/False)
- Priority levels (Low/Medium/High)
- Short option lists (2-5 items)
- Demographic questions with few options

❌ **Avoid for:**
- Long option lists (6+ items)
- Options with lengthy text
- Mobile-first designs (consider responsive behavior)
- Complex multi-line options

#### When to Use Grouping

✅ **Ideal scenarios:**
- Survey rating matrices
- Evaluation forms with consistent rating scales
- Preference questionnaires with repeated categories
- Assessment forms with standardized criteria

❌ **Not recommended for:**
- Fields with different option sets
- Unrelated questions
- Fields requiring different validation rules
- Mixed field types in the same group

#### Responsive Considerations

Horizontal layouts automatically wrap on smaller screens, but consider:

```typescript
// For mobile-responsive forms, test horizontal layouts
.field('radio', 'Experience Rating')
  .options(['Poor', 'Fair', 'Good', 'Excellent'])
  .layout('horizontal') // Will wrap on small screens
  .end()
```

### Form Builder Integration

The visual form builder supports these features through:

1. **Layout Selector**: Choose vertical or horizontal layout for radio/checkbox fields
2. **Grouping Controls**: Enable grouping and set group keys
3. **Live Preview**: See the grouped layout in real-time
4. **Validation**: Warnings for incompatible grouping configurations

#### UI Controls

- **Layout Dropdown**: Select "Vertical" or "Horizontal"
- **Enable Grouping Checkbox**: Toggle grouping functionality
- **Group Key Input**: Set the grouping identifier
- **Helper Text**: Guidance on grouping requirements

### Technical Implementation

#### Type Definitions

```typescript
interface FormField {
  // ... existing properties
  layout?: 'vertical' | 'horizontal';
  grouping?: {
    enabled: boolean;
    groupKey?: string;
  };
}
```

#### Grouping Logic

The renderer automatically:
1. Groups fields by `groupKey`
2. Validates identical options and horizontal layout
3. Renders matrix-style interface for compatible groups
4. Falls back to individual field rendering for incompatible groups

#### CSS Classes

```css
/* Horizontal layout */
.flex.flex-wrap.gap-4

/* Grouped field container */
.border.border-gray-200.rounded-lg.p-4.bg-gray-50

/* Matrix layout */
.flex.flex-wrap.gap-6
```

## Template Configuration

### Metadata

```typescript
interface TemplateMetadata {
  name: string;                 // Template name
  version: string;              // Version number
  description: string;          // Template description
  author: string;               // Author name
  tags: string[];               // Tags for categorization
  extends?: string;             // Parent template (for inheritance)
  created: Date;                // Creation timestamp
  updated: Date;                // Last update timestamp
}
```

### Styling Configuration

```typescript
interface StylingConfig {
  theme: string;                           // Theme name ('default', 'dark', etc.)
  layout: 'fixed' | 'fluid' | 'adaptive'; // Layout type
  spacing: 'compact' | 'normal' | 'comfortable'; // Spacing density
  colors?: string[];                       // Custom color palette
  animations?: boolean;                    // Enable animations
  conditionalStyling?: ConditionalStyling[]; // Conditional styling rules
}
```

### Behavior Configuration

```typescript
interface BehaviorConfig {
  autoSave: boolean;            // Enable auto-save
  autoSaveInterval?: number;    // Auto-save interval in milliseconds
  showProgress: boolean;        // Show progress indicator
  conditionalLogic?: ConditionalLogic[]; // Global conditional logic
  functions?: Record<string, string>;    // Custom functions
}
```

## Examples

### Basic Contact Form

```typescript
const contactForm = new TemplateBuilder()
  .create('Contact Form')
  .description('Basic contact information form')
  .author('System')
  .tags('contact', 'basic')
  
  .section('Personal Information')
    .field('text', 'Full Name')
      .required()
      .minLength(2)
      .maxLength(50)
      .end()
    .field('email', 'Email Address')
      .required()
      .end()
    .field('tel', 'Phone Number')
      .pattern('[0-9\-\+\s\(\)]*')
      .end()
      
  .section('Message')
    .field('textarea', 'Message')
      .required()
      .minLength(10)
      .maxLength(500)
      .placeholder('Please enter your message...')
      .end()
      
  .build();
```

### Advanced Survey with Conditional Logic and Horizontal Layouts

```typescript
const survey = new TemplateBuilder()
  .create('Customer Satisfaction Survey')
  .description('Advanced survey with conditional branching, horizontal layouts, and grouping')
  .autoSave(30000) // Auto-save every 30 seconds
  .showProgress()
  
  .section('Basic Information')
    .field('radio', 'Customer Type')
      .id('customer_type')
      .options(['New Customer', 'Existing Customer', 'Former Customer'])
      .layout('horizontal')
      .required()
      .end()
    .field('select', 'How did you hear about us?')
      .conditional('customer_type', 'equals', ['New Customer'])
      .options(['Search Engine', 'Social Media', 'Friend Referral', 'Advertisement'])
      .end()
      
  .section('Service Evaluation Matrix')
    .field('radio', 'Product Quality')
      .options(['Poor', 'Fair', 'Good', 'Excellent'])
      .layout('horizontal')
      .grouping(true, 'service_ratings')
      .required()
      .end()
    .field('radio', 'Customer Support')
      .options(['Poor', 'Fair', 'Good', 'Excellent'])
      .layout('horizontal')
      .grouping(true, 'service_ratings')
      .required()
      .end()
    .field('radio', 'Delivery Speed')
      .options(['Poor', 'Fair', 'Good', 'Excellent'])
      .layout('horizontal')
      .grouping(true, 'service_ratings')
      .required()
      .end()
      
  .section('Experience Rating')
    .field('range', 'Overall Satisfaction')
      .min(1)
      .max(10)
      .defaultValue(5)
      .end()
    .field('checkbox', 'What did you like?')
      .options(['Product Quality', 'Customer Service', 'Pricing', 'Delivery Speed'])
      .layout('horizontal')
      .multiple()
      .end()
    .field('textarea', 'Additional Comments')
      .placeholder('Please share any additional feedback...')
      .maxLength(1000)
      .end()
      
  .build();
```

### Dynamic Form with Loops

```typescript
const teamForm = new TemplateBuilder()
  .create('Team Registration')
  .variables({ teamSize: 5 })
  
  .section('Team Information')
    .field('text', 'Team Name')
      .required()
      .end()
    .field('number', 'Team Size')
      .id('team_size')
      .min(1)
      .max(10)
      .defaultValue(5)
      .end()
      
  .repeat(5, (index, builder) => {
    builder.section(`Team Member ${index + 1}`)
      .field('text', 'Full Name')
        .required()
        .end()
      .field('email', 'Email')
        .required()
        .end()
      .field('select', 'Role')
        .options(['Team Lead', 'Developer', 'Designer', 'QA', 'Other'])
        .end();
  })
  
  .build();
```

### Form with Default Values

```typescript
const profileForm = new TemplateBuilder()
  .create('User Profile')
  .description('User profile form with sensible defaults')
  
  .section('Basic Information')
    .field('text', 'Company Name')
      .defaultValue('Acme Corp')
      .end()
    .field('email', 'Contact Email')
      .defaultValue('contact@acme.com')
      .required()
      .end()
    .field('select', 'Industry')
      .options(['Technology', 'Healthcare', 'Finance', 'Manufacturing', 'Other'])
      .defaultValue('Technology')
      .end()
    .field('checkbox', 'Services')
      .options(['Consulting', 'Development', 'Support', 'Training'])
      .defaultValue(['Development', 'Support'])
      .end()
    .field('date', 'Founded Date')
      .defaultValue('2020-01-01')
      .end()
      
  .build();
```

## Web Application Integration

### Form Builder UI

The web application provides a visual form builder that supports all programmatic features:

1. **Field Type Selection**: Choose from all supported field types
2. **Property Configuration**: Set labels, placeholders, validation rules
3. **Default Values**: Configure default values with type-appropriate inputs
4. **Options Management**: Add/remove options for select, radio, and checkbox fields
5. **Conditional Logic**: Set up field dependencies visually
6. **Import/Export**: Import programmatic templates or export to programmatic format

### Form Rendering

The form renderer automatically:

1. **Applies Default Values**: Pre-fills forms with configured defaults
2. **Validates Input**: Real-time validation based on configured rules
3. **Handles Conditional Logic**: Shows/hides fields based on dependencies
4. **Auto-saves Progress**: Saves form state automatically
5. **Tracks Completion**: Shows progress indicators and completion status

### Data Management

Forms support:

1. **Draft Saving**: Automatic saving of incomplete forms
2. **Resume Capability**: Users can return to incomplete forms
3. **Version Control**: Templates can be versioned and updated
4. **Export Options**: Data can be exported in multiple formats (JSON, CSV)
5. **Validation**: Server-side validation of submitted data

## Best Practices

### Field Design

1. **Clear Labels**: Use descriptive, user-friendly field labels
2. **Helpful Placeholders**: Provide examples or hints in placeholder text
3. **Logical Grouping**: Group related fields into sections
4. **Progressive Disclosure**: Use conditional logic to show relevant fields only
5. **Sensible Defaults**: Pre-fill fields with common or likely values

### Validation

1. **Client-side First**: Implement validation rules for immediate feedback
2. **User-friendly Messages**: Provide clear, actionable error messages
3. **Progressive Validation**: Validate as users type, not just on submit
4. **Required Field Indicators**: Clearly mark required fields
5. **Pattern Validation**: Use regex patterns for format validation

### User Experience

1. **Auto-save**: Enable auto-save for long forms
2. **Progress Indicators**: Show completion progress
3. **Responsive Design**: Ensure forms work on all device sizes
4. **Accessibility**: Include proper ARIA labels and keyboard navigation
5. **Performance**: Optimize for fast loading and rendering

### Template Organization

1. **Consistent Naming**: Use clear, consistent naming conventions
2. **Modular Design**: Create reusable sections and components
3. **Version Control**: Track template changes with versioning
4. **Documentation**: Include descriptions and usage notes
5. **Testing**: Test templates thoroughly before deployment