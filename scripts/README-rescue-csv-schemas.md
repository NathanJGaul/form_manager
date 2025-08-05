# CSV Schema Rescue Script

## Overview

This script fixes CSV files exported from JCC2 v4 forms that have "unknown" schemas in their schema row (row 2). It automatically identifies field patterns and applies the correct schema definitions.

## Problem It Solves

When exporting JCC2 form data to CSV, many field schemas were showing as "unknown" instead of their proper type definitions. This affected fields like:
- Task performance questions
- Task workaround questions  
- Problem occurrence questions
- Task outcome questions
- Additional observations
- Interview section questions

## Installation

The script uses Papa Parse for proper CSV handling, which is already included in the project dependencies.

## Usage

### Basic Usage

```bash
npx tsx scripts/rescue-csv-schemas.ts <input-csv-file>
```

This will create a new file with "_fixed" suffix. For example:
- Input: `data.csv`
- Output: `data_fixed.csv`

### Specify Output File

```bash
npx tsx scripts/rescue-csv-schemas.ts <input-csv-file> <output-csv-file>
```

### Get Help

```bash
npx tsx scripts/rescue-csv-schemas.ts --help
```

## Example

```bash
# Fix the example CSV file
npx tsx scripts/rescue-csv-schemas.ts "JCC2_Data_Collection_and_Interview_Form_v4_mock_data_5_instances (2).csv"

# Output will be saved as:
# JCC2_Data_Collection_and_Interview_Form_v4_mock_data_5_instances (2)_fixed.csv
```

## What It Fixes

The script recognizes and fixes schemas for the following field patterns:

### Task-Related Fields
- `task_performance` → `radio|required|options:Yes,N/A,No`
- `task_performance_details` → `textarea|optional`
- `task_workaround` → `radio|required|options:Yes,N/A,No`
- `task_workaround_details` → `textarea|optional`
- `problem_occurrence` → `radio|required|options:Yes,N/A,No`
- `problem_occurrence_details` → `textarea|optional`
- `task_outcome` → `radio|required|options:Yes,N/A,No`
- `task_outcome_details` → `textarea|optional`
- `additional_observations` → `textarea|optional`

### Interview Section Fields
- `workarounds_use` → `radio|required|options:Yes,No`
- `tasc_apps_adequate` → `radio|required|options:Yes,No`
- `jcc2_apps_easier` → `radio|required|options:Yes,No`
- `jcc2_apps_faster` → `radio|required|options:Yes,No`
- `jcc2_apps_future_use` → `radio|required|options:Yes,No`
- `jcc2_recommend` → `radio|required|options:Yes,No`
- Various detail fields → `textarea|optional`

### Data Table Fields
- Fields ending with `_runs` → `datatable` with appropriate column configuration

## Output

The script provides detailed feedback:
- Number of columns found
- Number of unknown schemas detected
- List of all fixed schemas with before/after values
- Summary statistics
- Any schemas that couldn't be automatically fixed

## Example Output

```
🔧 CSV Schema Rescue Script
===========================

📖 Reading input file: data.csv

📊 Found 377 columns

🔍 Found 267 unknown schemas to fix

📝 Fixed schemas:
   ✅ mop111.task_performance
      Old: unknown
      New: radio|required|options:Yes,N/A,No
   [... more fixes ...]

💾 Writing output file: data_fixed.csv

✨ Success! Fixed 267 unknown schemas.
📄 Output saved to: data_fixed.csv

📈 Summary:
   Total columns: 377
   Unknown schemas found: 270
   Schemas fixed: 267
   Remaining unknown: 3
```

## Limitations

Some field schemas may not be automatically fixed if they don't match standard patterns. These will be listed in the output and may require manual review. Common examples:
- Custom fields with non-standard naming
- Fields with complex conditional logic
- Fields with custom validation rules

## Integration with Form Manager

The script is designed to work with CSV files exported from the Form Manager application using the JCC2 v4 template. It preserves all data and only modifies the schema row (row 2) of the CSV file.

## Troubleshooting

### File Not Found
Ensure the CSV file path is correct and the file exists.

### No Unknown Schemas Found
The file may already have correct schemas or may not be from a JCC2 v4 form export.

### Some Schemas Remain Unknown
Fields with non-standard patterns may need manual review. Check the script output for the list of unfixed fields.

## Technical Details

- Uses Papa Parse for RFC 4180-compliant CSV parsing
- Pattern-based schema recognition
- Preserves all data integrity
- Handles complex CSV structures including nested quotes and commas
- Written in TypeScript for type safety

## Future Improvements

To add support for additional field patterns, edit the `SCHEMA_MAPPINGS` object in the script file.