# Developer Tools Suite Documentation

## Overview

The Developer Tools Suite provides powerful utilities for testing, debugging, and validating form functionality during development. These tools are only available in development mode and help ensure data integrity and accelerate the development process.

## Components

### 1. Developer Dropdown Menu

A development-only UI component that provides quick access to all developer tools.

**Location**: Available in the form renderer view when running in development mode
**Component**: `src/components/dev-tools/DevDropdownMenu.tsx`

### 2. Mock Data Generator

Automatically fills forms with realistic test data based on field types and validation rules.

**Features**:
- Context-aware data generation based on field names and types
- Respects validation rules (required fields, patterns, min/max values)
- Configurable fill percentage (25%, 50%, 75%, 100%)
- Required-only mode for minimal testing
- Seed-based generation for reproducible results
- Supports all field types:
  - Text fields with contextual content
  - Email addresses with realistic domains
  - Phone numbers with proper formatting
  - Dates within reasonable ranges
  - Select/radio options with random selection
  - Checkboxes with varied selections

**Component**: `src/utils/MockDataGenerator.ts`

### 3. CSV Integrity Checker

Validates CSV export functionality by comparing exported data with original form data.

**Features**:
- Comprehensive integrity scoring (0-100%)
- Field mapping validation
- Data type preservation checks
- Missing/extra field detection
- Value accuracy comparison
- Detailed integrity reports
- Visual diff display for discrepancies

**Components**:
- `src/components/dev-tools/FormDevTool.tsx`
- `src/components/dev-tools/CSVIntegrityResults.tsx`
- `src/utils/csvIntegrityChecker.ts`

## Usage

### Accessing Developer Tools

1. Ensure the application is running in development mode (`npm run dev`)
2. Navigate to any form view
3. Click the developer tools dropdown in the top navigation
4. Select the desired tool from the menu

### Mock Data Generation

```typescript
import { MockDataGenerator } from '@/utils/MockDataGenerator';

// Generate mock data for a form
const generator = new MockDataGenerator();
const mockData = generator.generateMockData(formTemplate, {
  fillPercentage: 0.75,  // Fill 75% of fields
  requiredOnly: false,    // Fill all fields, not just required
  seed: 'test-seed'       // Optional seed for reproducibility
});
```

### CSV Integrity Validation

The CSV integrity checker automatically:
1. Exports the current form data to CSV
2. Parses the exported CSV
3. Compares parsed data with original
4. Generates an integrity report

**Integrity Score Calculation**:
- Field presence and mapping accuracy
- Data type preservation
- Value exactness (accounting for CSV limitations)
- Special character handling

## Implementation Details

### Mock Data Patterns

The generator uses intelligent patterns based on field names:

```typescript
const contextPatterns = {
  name: () => faker.person.fullName(),
  email: () => faker.internet.email(),
  phone: () => faker.phone.number(),
  company: () => faker.company.name(),
  address: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  // ... more patterns
};
```

### CSV Validation Rules

The integrity checker validates:
- **Field Mapping**: All fields present in correct order
- **Data Types**: Numbers, dates, booleans preserved correctly
- **Special Characters**: Quotes, commas, newlines handled properly
- **Array Data**: Checkbox values correctly serialized
- **Empty Values**: Null/undefined handling

## Best Practices

### For Testing
1. Use consistent seeds for reproducible test scenarios
2. Test with various fill percentages to simulate partial submissions
3. Validate CSV exports after any field type changes
4. Run integrity checks on complex forms with conditional logic

### For Development
1. Keep developer tools code separate from production code
2. Use environment checks to prevent tools in production
3. Document any custom mock data patterns
4. Regularly test export functionality with edge cases

## Troubleshooting

### Common Issues

**Mock Data Not Generating**:
- Check field type definitions
- Verify field IDs are unique
- Ensure validation rules are properly defined

**CSV Integrity Failures**:
- Review special character handling
- Check array serialization format
- Verify date formatting consistency
- Inspect boolean value representation

## Future Enhancements

- **Performance Profiler**: Measure form rendering performance
- **Validation Debugger**: Visual validation rule testing
- **Template Analyzer**: Detect potential issues in templates
- **Export Preview**: Preview exports before generation
- **Field Inspector**: Detailed field state inspection

---

*The Developer Tools Suite is essential for maintaining form quality and accelerating development. These tools help catch issues early and ensure robust form functionality.*