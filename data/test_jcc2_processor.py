#!/usr/bin/env python3
"""
Test script for JCC2 Data Processor
Demonstrates processing both questionnaire and data collection formats
"""

from jcc2_data_processor import create_processor, DataFormat
import json
from pathlib import Path


def test_questionnaire_format():
    """Test processing of User Questionnaire format"""
    print("=" * 80)
    print("Testing User Questionnaire Format")
    print("=" * 80)
    
    csv_file = "mock_20_jcc2_user_questionnaire.csv"
    if not Path(csv_file).exists():
        print(f"File {csv_file} not found")
        return
    
    # Create processor
    processor = create_processor(csv_file)
    print(f"Detected format: {processor.format_type.value}")
    
    # Load and process data
    df = processor.load_data()
    print(f"\nData shape: {df.shape}")
    print(f"Sections found: {list(processor.sections.keys())[:5]}...")
    
    # Validate
    errors = processor.validate_data()
    print(f"\nValidation errors: {len(errors)}")
    if errors:
        print(f"First error: {errors[0]}")
    
    # Get section summary
    if processor.sections:
        first_section = list(processor.sections.keys())[0]
        summary = processor.get_section_summary(first_section)
        print(f"\nSection '{first_section}' summary:")
        print(f"  - Total fields: {summary['total_fields']}")
        if summary['field_summaries']:
            first_field = list(summary['field_summaries'].keys())[0]
            print(f"  - Example field '{first_field}':")
            print(f"    - Type: {summary['field_summaries'][first_field]['field_type']}")
            print(f"    - Completion rate: {summary['field_summaries'][first_field]['completion_rate']:.2%}")
    
    # Format-specific summary
    format_summary = processor.get_format_specific_summary()
    print(f"\nEffectiveness ratings analyzed: {len(format_summary.get('effectiveness_ratings', {}))}")
    print(f"Frequency distributions analyzed: {len(format_summary.get('frequency_distributions', {}))}")
    
    # Visualization data
    viz_data = processor.prepare_format_specific_visualizations()
    for key, data in viz_data.items():
        print(f"\nVisualization '{key}': {data.shape if hasattr(data, 'shape') else 'prepared'}")


def test_data_collection_format():
    """Test processing of Data Collection format"""
    print("\n" + "=" * 80)
    print("Testing Data Collection Format")
    print("=" * 80)
    
    csv_file = "JCC2_Data_Collection_and_Interview_Form_v4_mock_data_20_instances.csv"
    if not Path(csv_file).exists():
        print(f"File {csv_file} not found")
        return
    
    # Create processor
    processor = create_processor(csv_file)
    print(f"Detected format: {processor.format_type.value}")
    
    # Load and process data
    df = processor.load_data()
    print(f"\nData shape: {df.shape}")
    print(f"Sections found: {list(processor.sections.keys())[:5]}...")
    print(f"Datatable fields found: {len(processor.datatable_fields)}")
    
    # Validate
    errors = processor.validate_data()
    print(f"\nValidation errors: {len(errors)}")
    
    # Get section summary for a MOP section
    mop_sections = [s for s in processor.sections if s.startswith('mop')]
    if mop_sections:
        mop_section = mop_sections[0]
        summary = processor.get_section_summary(mop_section)
        print(f"\nSection '{mop_section}' summary:")
        print(f"  - Total fields: {summary['total_fields']}")
    
    # Format-specific summary
    format_summary = processor.get_format_specific_summary()
    print(f"\nTask performance metrics: {len(format_summary.get('task_performance_metrics', {}))}")
    print(f"Workaround analysis: {len(format_summary.get('workaround_analysis', {}))}")
    print(f"Datatable summaries: {len(format_summary.get('datatable_summaries', {}))}")
    
    # Show a datatable summary
    if format_summary.get('datatable_summaries'):
        dt_name = list(format_summary['datatable_summaries'].keys())[0]
        dt_summary = format_summary['datatable_summaries'][dt_name]
        print(f"\nExample datatable '{dt_name}':")
        print(f"  - Total entries: {dt_summary['total_entries']}")
        print(f"  - Avg rows per entry: {dt_summary['avg_rows_per_entry']:.1f}")
    
    # Performance analysis
    if hasattr(processor, 'analyze_performance_patterns'):
        perf_patterns = processor.analyze_performance_patterns()
        print(f"\nPerformance Analysis:")
        print(f"  - Task success rates calculated: {len(perf_patterns['task_success_rates'])}")
        print(f"  - Workaround correlations found: {len(perf_patterns['workaround_correlations'])}")
        
        # Show some success rates
        if perf_patterns['task_success_rates']:
            print("\n  Top task success rates:")
            sorted_tasks = sorted(perf_patterns['task_success_rates'].items(), 
                                key=lambda x: x[1], reverse=True)[:3]
            for task, rate in sorted_tasks:
                print(f"    - {task}: {rate:.2%}")


def main():
    """Run tests for both formats"""
    print("JCC2 Data Processor Test Suite")
    print("Testing both data formats...")
    
    # Test User Questionnaire format
    test_questionnaire_format()
    
    # Test Data Collection format
    test_data_collection_format()
    
    print("\n" + "=" * 80)
    print("Testing complete!")


if __name__ == "__main__":
    main()