#!/usr/bin/env python3
"""Debug script to examine field structure in JCC2 data"""

import pandas as pd
import sys

# Add the parent directory to the path
sys.path.insert(0, '.')

from jcc2_data_processor import create_processor

# Load data
data_file = '/home/nathanjgaul/Downloads/DCDC UQ Combined_2025-07-30_pii_scrubbed.csv'
processor = create_processor(data_file)
df = processor.load_data()

print("Examining field structure for application-specific ratings...\n")

# Target sections
target_sections = ['mop_1_1_1', 'mos_1_1_2', 'mop_1_1_3', 'reporting_and_data_export']

# Applications to check
applications = ['a2it', 'cad', 'threathub', 'madss', 'sigact']

for section in target_sections[:4]:  # Check first 4 sections
    print(f"\n{'='*80}")
    print(f"Section: {section}")
    print(f"{'='*80}")
    
    if section in processor.sections:
        fields = processor.sections[section]
        print(f"Total fields in section: {len(fields)}")
        
        # Check for effectiveness/suitability fields
        rating_fields = [f for f in fields if 'effectiveness' in f or 'suitability' in f]
        print(f"\nRating fields found: {len(rating_fields)}")
        
        # Print first 10 rating fields
        for field in rating_fields[:10]:
            print(f"  - {field}")
            
            # Check if it's app-specific
            app_found = None
            for app in applications:
                if app in field.lower():
                    app_found = app
                    break
            
            if app_found:
                print(f"    -> App-specific for: {app_found}")
            else:
                # Check for other patterns
                if any(x in field for x in ['overall', 'general', 'combined']):
                    print(f"    -> Overall/General rating")
                else:
                    # Try to identify what it might be for
                    parts = field.split('.')
                    if len(parts) > 1:
                        print(f"    -> Field parts: {parts[1]}")

# Also check for unique patterns in field names
print(f"\n{'='*80}")
print("Checking for unique patterns in effectiveness/suitability fields...")
print(f"{'='*80}")

all_rating_fields = [col for col in df.columns if 'effectiveness' in col or 'suitability' in col]
print(f"\nTotal rating fields in dataset: {len(all_rating_fields)}")

# Extract patterns
patterns = set()
for field in all_rating_fields[:50]:  # Check first 50
    parts = field.split('.')
    if len(parts) >= 2:
        # Extract the part after section name
        field_suffix = parts[1]
        patterns.add(field_suffix)

print(f"\nUnique field patterns found:")
for pattern in sorted(patterns)[:20]:
    print(f"  - {pattern}")

# Check a specific section in detail
print(f"\n{'='*80}")
print("Detailed look at mop_1_1_1 fields:")
print(f"{'='*80}")

if 'mop_1_1_1' in processor.sections:
    mop_fields = processor.sections['mop_1_1_1']
    for field in sorted(mop_fields):
        print(f"  {field}")
        # Check sample values
        if field in df.columns:
            non_null = df[field].dropna()
            if len(non_null) > 0:
                print(f"    Sample values: {non_null.value_counts().head(3).to_dict()}")