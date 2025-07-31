# Using JCC2 Data Processor in Jupyter Notebooks and Databricks

## Table of Contents
1. [Jupyter Notebook Setup](#jupyter-notebook-setup)
2. [Databricks Setup](#databricks-setup)
3. [Example Notebook Code](#example-notebook-code)
4. [Visualization Examples](#visualization-examples)
5. [Best Practices](#best-practices)

## Jupyter Notebook Setup

### Option 1: Local File Import
Place the `jcc2_data_processor.py` file in the same directory as your notebook or in a known location.

```python
# Cell 1: Import the processor
import sys
import os

# Add the directory containing the script to Python path
sys.path.append('/path/to/your/data/directory')

# Import the processor
from jcc2_data_processor import create_processor, DataFormat

# Verify import
print("JCC2 Processor imported successfully!")
```

### Option 2: Install as a Package
Create a simple setup.py file to install the processor as a package:

```python
# setup.py
from setuptools import setup, find_packages

setup(
    name="jcc2-processor",
    version="1.0.0",
    py_modules=["jcc2_data_processor"],
    install_requires=[
        "pandas>=1.3.0",
        "numpy>=1.21.0",
    ],
)
```

Then install it:
```bash
pip install -e /path/to/directory/containing/setup.py
```

### Option 3: Use %run Magic Command
```python
# In Jupyter cell
%run /path/to/jcc2_data_processor.py
```

## Databricks Setup

### Option 1: Upload to Databricks File System (DBFS)

```python
# Cell 1: Upload the file through Databricks UI or CLI
# Then copy to DBFS
dbutils.fs.cp("file:/path/to/jcc2_data_processor.py", "dbfs:/shared/jcc2_data_processor.py")

# Cell 2: Copy to local file system for import
dbutils.fs.cp("dbfs:/shared/jcc2_data_processor.py", "file:/databricks/driver/jcc2_data_processor.py")

# Cell 3: Import the module
import sys
sys.path.append('/databricks/driver/')
from jcc2_data_processor import create_processor, DataFormat
```

### Option 2: Create a Databricks Notebook Library

1. Create a new Python notebook in Databricks
2. Copy the entire jcc2_data_processor.py content into cells
3. Run all cells to define the classes
4. Import from other notebooks using `%run`

```python
# In your analysis notebook
%run /path/to/jcc2_processor_library_notebook

# Now you can use the processor
processor = create_processor("/path/to/data.csv")
```

### Option 3: Install as Cluster Library

1. Package the processor as a wheel file:
```bash
python setup.py bdist_wheel
```

2. Upload the wheel file to Databricks
3. Install it as a cluster library through the UI

## Example Notebook Code

### Basic Usage Example

```python
# Cell 1: Imports and Setup
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from jcc2_data_processor import create_processor, DataFormat

# Configure display options
pd.set_option('display.max_columns', None)
pd.set_option('display.max_rows', 100)
plt.style.use('seaborn-v0_8-darkgrid')

# Cell 2: Load and Process Data
# Specify your data file path
csv_file = "/path/to/your/jcc2_data.csv"

# Create processor (auto-detects format)
processor = create_processor(csv_file)
print(f"Detected format: {processor.format_type.value}")

# Load data
df = processor.load_data()
print(f"Loaded {len(df)} rows and {len(df.columns)} columns")

# Cell 3: Data Exploration
# View basic info
display(df.head())
display(df.info())

# Check sections
print("Available sections:")
for section, fields in list(processor.sections.items())[:10]:
    print(f"  {section}: {len(fields)} fields")

# Cell 4: Validation
errors = processor.validate_data()
print(f"Found {len(errors)} validation errors")

if errors:
    # Convert to DataFrame for better display
    errors_df = pd.DataFrame(errors[:20])  # First 20 errors
    display(errors_df)

# Cell 5: Section Analysis
# Analyze specific section
section_name = list(processor.sections.keys())[0]
section_summary = processor.get_section_summary(section_name)

print(f"Section: {section_name}")
print(f"Total fields: {section_summary['total_fields']}")
print(f"Field types: {set(f['field_type'] for f in section_summary['field_summaries'].values())}")

# Cell 6: Format-Specific Analysis
format_summary = processor.get_format_specific_summary()

if processor.format_type == DataFormat.USER_QUESTIONNAIRE:
    print(f"Effectiveness ratings: {len(format_summary['effectiveness_ratings'])}")
    print(f"Frequency distributions: {len(format_summary['frequency_distributions'])}")
    
elif processor.format_type == DataFormat.DATA_COLLECTION:
    print(f"Task performance metrics: {len(format_summary['task_performance_metrics'])}")
    print(f"Workaround analysis: {len(format_summary['workaround_analysis'])}")
    print(f"Datatable fields: {len(format_summary['datatable_summaries'])}")
```

## Visualization Examples

### For User Questionnaire Data

```python
# Cell 1: Prepare Visualization Data
viz_data = processor.prepare_format_specific_visualizations()

# Cell 2: Effectiveness Heatmap
if 'effectiveness_heatmap' in viz_data:
    effectiveness_df = viz_data['effectiveness_heatmap']
    
    # Calculate mean effectiveness by section
    section_means = {}
    for col in effectiveness_df.columns:
        if col in processor.schema:
            section = processor.schema[col].section
            if section:
                if section not in section_means:
                    section_means[section] = []
                section_means[section].append(effectiveness_df[col].mean())
    
    # Create heatmap data
    heatmap_data = pd.DataFrame({
        section: [np.mean(means)] for section, means in section_means.items()
    }).T
    
    # Plot
    plt.figure(figsize=(10, 8))
    sns.heatmap(heatmap_data, annot=True, cmap='RdYlGn', center=3.5, 
                vmin=1, vmax=6, cbar_kws={'label': 'Effectiveness Score'})
    plt.title('Average Effectiveness by Section')
    plt.tight_layout()
    plt.show()

# Cell 3: Frequency Distribution
if 'frequency_data' in viz_data:
    freq_df = viz_data['frequency_data']
    
    # Count frequency responses
    freq_counts = {}
    for col in freq_df.columns[:5]:  # First 5 frequency columns
        counts = freq_df[col].value_counts()
        freq_counts[col.split('.')[-1]] = counts
    
    # Plot
    fig, axes = plt.subplots(1, len(freq_counts), figsize=(15, 5))
    for idx, (field, counts) in enumerate(freq_counts.items()):
        counts.plot(kind='bar', ax=axes[idx])
        axes[idx].set_title(field)
        axes[idx].set_xlabel('Frequency')
        axes[idx].set_ylabel('Count')
    plt.tight_layout()
    plt.show()
```

### For Data Collection Data

```python
# Cell 1: Task Performance Analysis
if processor.format_type == DataFormat.DATA_COLLECTION:
    perf_patterns = processor.analyze_performance_patterns()
    
    # Task success rates
    if perf_patterns['task_success_rates']:
        success_df = pd.DataFrame(
            list(perf_patterns['task_success_rates'].items()),
            columns=['Task', 'Success Rate']
        )
        success_df = success_df.sort_values('Success Rate', ascending=True)
        
        # Plot
        plt.figure(figsize=(10, 8))
        success_df.plot(x='Task', y='Success Rate', kind='barh')
        plt.xlabel('Success Rate')
        plt.title('Task Success Rates')
        plt.xlim(0, 1)
        
        # Add percentage labels
        for idx, row in success_df.iterrows():
            plt.text(row['Success Rate'], idx, f"{row['Success Rate']:.1%}", 
                    va='center', ha='left', fontsize=9)
        plt.tight_layout()
        plt.show()

# Cell 2: Workaround Analysis
if 'workaround_frequency' in viz_data:
    workaround_df = viz_data['workaround_frequency']
    
    # Calculate workaround percentage
    workaround_df['workaround_pct'] = (
        workaround_df['workaround_count'] / workaround_df['total_responses']
    )
    
    # Top 10 workarounds
    top_workarounds = workaround_df.nlargest(10, 'workaround_pct')
    
    plt.figure(figsize=(12, 6))
    plt.bar(range(len(top_workarounds)), top_workarounds['workaround_pct'])
    plt.xticks(range(len(top_workarounds)), 
               [f.split('.')[-1] for f in top_workarounds['field']], 
               rotation=45, ha='right')
    plt.ylabel('Workaround Frequency (%)')
    plt.title('Top 10 Tasks Requiring Workarounds')
    plt.tight_layout()
    plt.show()

# Cell 3: Datatable Analysis
if processor.datatable_fields:
    # Analyze a specific datatable field
    dt_field = list(processor.datatable_fields.keys())[0]
    dt_data = df[dt_field].dropna()
    
    # Extract row counts
    row_counts = []
    for entry in dt_data:
        if isinstance(entry, dict) and 'rows' in entry:
            row_counts.append(len(entry['rows']))
    
    if row_counts:
        plt.figure(figsize=(8, 5))
        plt.hist(row_counts, bins=range(min(row_counts), max(row_counts)+2), 
                 edgecolor='black', alpha=0.7)
        plt.xlabel('Number of Rows')
        plt.ylabel('Frequency')
        plt.title(f'Distribution of Row Counts in {dt_field}')
        plt.grid(True, alpha=0.3)
        plt.show()
```

## Best Practices

### 1. Memory Management in Databricks
```python
# For large datasets, process in chunks
def process_large_file(file_path, chunk_size=10000):
    processor = create_processor(file_path)
    
    # Read schema first
    schema_df = pd.read_csv(file_path, nrows=2)
    processor.schema = processor._parse_schema(schema_df)
    
    # Process in chunks
    chunks = []
    for chunk in pd.read_csv(file_path, chunksize=chunk_size, skiprows=1):
        # Process chunk
        processed_chunk = processor._process_chunk(chunk)
        chunks.append(processed_chunk)
    
    return pd.concat(chunks, ignore_index=True)
```

### 2. Caching Results
```python
# Cache processed data for faster analysis
import pickle

# Save processed data
def save_processed_data(processor, filename):
    with open(filename, 'wb') as f:
        pickle.dump({
            'df': processor.df,
            'schema': processor.schema,
            'sections': processor.sections,
            'format_type': processor.format_type
        }, f)

# Load processed data
def load_processed_data(filename):
    with open(filename, 'rb') as f:
        return pickle.load(f)
```

### 3. Spark DataFrame Integration (Databricks)
```python
# Convert to Spark DataFrame for distributed processing
from pyspark.sql import SparkSession

spark = SparkSession.builder.appName("JCC2Analysis").getOrCreate()

# Load with pandas first
processor = create_processor("/path/to/data.csv")
pandas_df = processor.load_data()

# Convert to Spark DataFrame
spark_df = spark.createDataFrame(pandas_df)

# Register as temporary view for SQL queries
spark_df.createOrReplaceTempView("jcc2_data")

# Query with SQL
results = spark.sql("""
    SELECT section, COUNT(*) as response_count
    FROM jcc2_data
    WHERE status = 'Completed'
    GROUP BY section
""")

display(results)
```

### 4. Interactive Widgets (Jupyter)
```python
import ipywidgets as widgets
from IPython.display import display

# Create section selector
section_dropdown = widgets.Dropdown(
    options=list(processor.sections.keys()),
    description='Section:',
    style={'description_width': 'initial'}
)

# Create analysis function
def analyze_section(section):
    summary = processor.get_section_summary(section)
    
    print(f"Section: {section}")
    print(f"Fields: {summary['total_fields']}")
    
    # Show completion rates
    completion_data = []
    for field, data in summary['field_summaries'].items():
        completion_data.append({
            'Field': field.split('.')[-1],
            'Completion Rate': data['completion_rate']
        })
    
    comp_df = pd.DataFrame(completion_data)
    display(comp_df.sort_values('Completion Rate'))

# Create interactive widget
interactive_plot = widgets.interactive(analyze_section, section=section_dropdown)
display(interactive_plot)
```

### 5. Export Results
```python
# Export analysis results to Excel
def export_analysis(processor, output_file):
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        # Main data
        processor.df.to_excel(writer, sheet_name='Raw Data', index=False)
        
        # Section summaries
        for section in list(processor.sections.keys())[:10]:
            summary = processor.get_section_summary(section)
            summary_df = pd.DataFrame(summary['field_summaries']).T
            summary_df.to_excel(writer, sheet_name=f'Summary_{section[:20]}')
        
        # Format-specific data
        if processor.format_type == DataFormat.DATA_COLLECTION:
            patterns = processor.analyze_performance_patterns()
            perf_df = pd.DataFrame(list(patterns['task_success_rates'].items()),
                                  columns=['Task', 'Success Rate'])
            perf_df.to_excel(writer, sheet_name='Performance', index=False)

# Usage
export_analysis(processor, 'jcc2_analysis_results.xlsx')
```