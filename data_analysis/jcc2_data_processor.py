#!/usr/bin/env python3
"""
JCC2 Data Processor - Unified processor for multiple JCC2 data formats

Supports:
- JCC2 User Questionnaire format (effectiveness ratings, frequencies)
- JCC2 Data Collection and Interview format (task performance, datatables)
"""

import pandas as pd
import numpy as np
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, field as dataclass_field
from datetime import datetime
import json
from collections import defaultdict
from abc import ABC, abstractmethod
from enum import Enum


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DataFormat(Enum):
    """Enum for different JCC2 data formats"""
    USER_QUESTIONNAIRE = "user_questionnaire"
    DATA_COLLECTION = "data_collection"
    UNKNOWN = "unknown"


@dataclass
class FieldSchema:
    """Represents the schema definition for a single field"""
    name: str
    section: Optional[str]
    field_id: Optional[str]
    field_type: str
    required: bool = False
    options: List[str] = dataclass_field(default_factory=list)
    depends_on: Optional[str] = None
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    multiple: bool = False
    # New fields for datatable support
    columns: Optional[int] = None
    column_types: Dict[str, str] = dataclass_field(default_factory=dict)
    min_rows: Optional[int] = None
    max_rows: Optional[int] = None
    
    @classmethod
    def parse(cls, column_name: str, schema_string: str) -> 'FieldSchema':
        """Parse schema string into FieldSchema object"""
        # Parse column name for section and field_id
        section = None
        field_id = column_name
        
        if '.' in column_name:
            parts = column_name.split('.', 1)
            section = parts[0]
            field_id = parts[1]
        
        # Parse schema string
        parts = schema_string.split('|')
        field_type = parts[0] if parts else 'text'
        
        schema_obj = cls(
            name=column_name,
            section=section,
            field_id=field_id,
            field_type=field_type
        )
        
        # Parse additional attributes
        for part in parts[1:]:
            if part == 'required':
                schema_obj.required = True
            elif part == 'optional':
                schema_obj.required = False
            elif part == 'multiple':
                schema_obj.multiple = True
            elif part.startswith('options:'):
                options_str = part[8:]
                schema_obj.options = [opt.strip() for opt in options_str.split(',')]
            elif part.startswith('depends_on:'):
                schema_obj.depends_on = part[11:]
            elif part.startswith('min:'):
                schema_obj.min_value = float(part[4:])
            elif part.startswith('max:'):
                schema_obj.max_value = float(part[4:])
            elif part.startswith('columns:'):
                schema_obj.columns = int(part[8:])
            elif part.startswith('column_types:'):
                # Parse column types for datatable
                col_types_str = part[13:]
                for col_def in col_types_str.split('|'):
                    if ':' in col_def:
                        col_name, col_type = col_def.split(':', 1)
                        schema_obj.column_types[col_name] = col_type
            elif part.startswith('minRows:'):
                schema_obj.min_rows = int(part[8:])
            elif part.startswith('maxRows:'):
                schema_obj.max_rows = int(part[8:])
        
        return schema_obj


class BaseJCC2Processor(ABC):
    """Base processor for JCC2 data formats"""
    
    def __init__(self, csv_path: str):
        self.csv_path = Path(csv_path)
        self.df: Optional[pd.DataFrame] = None
        self.schema: Dict[str, FieldSchema] = {}
        self.sections: Dict[str, List[str]] = defaultdict(list)
        self.system_columns: List[str] = []
        self.validation_errors: List[Dict[str, Any]] = []
        self.format_type: DataFormat = DataFormat.UNKNOWN
        self.datatable_fields: Dict[str, Any] = {}
        
    def load_data(self) -> pd.DataFrame:
        """Load CSV data and parse schema"""
        logger.info(f"Loading data from {self.csv_path}")
        
        # Read the CSV file
        raw_df = pd.read_csv(self.csv_path, low_memory=False)
        
        # Extract header and schema rows
        columns = raw_df.columns.tolist()
        schema_row = raw_df.iloc[0].tolist() if len(raw_df) > 0 else []
        
        # Parse schema
        logger.info("Parsing field schemas")
        for col, schema_str in zip(columns, schema_row):
            try:
                field_schema = FieldSchema.parse(col, str(schema_str))
                self.schema[col] = field_schema
                
                # Organize by sections
                if field_schema.section:
                    self.sections[field_schema.section].append(col)
                else:
                    self.system_columns.append(col)
                    
            except Exception as e:
                logger.error(f"Error parsing schema for column '{col}': {e}")
        
        # Extract actual data (skip schema row)
        self.df = raw_df.iloc[1:].copy()
        
        # Convert data types based on schema
        self._convert_data_types()
        
        logger.info(f"Loaded {len(self.df)} data rows with {len(columns)} columns")
        logger.info(f"Found {len(self.sections)} sections and {len(self.system_columns)} system columns")
        
        return self.df
    
    def _convert_data_types(self):
        """Convert column data types based on schema definitions"""
        for col_name, field_schema in self.schema.items():
            if col_name not in self.df.columns:
                continue
                
            try:
                if field_schema.field_type == 'datetime':
                    self.df[col_name] = pd.to_datetime(self.df[col_name], errors='coerce')
                elif field_schema.field_type == 'date':
                    self.df[col_name] = pd.to_datetime(self.df[col_name], errors='coerce').dt.date
                elif field_schema.field_type == 'number':
                    self.df[col_name] = pd.to_numeric(self.df[col_name], errors='coerce')
                elif field_schema.field_type == 'identifier':
                    # Keep as string
                    self.df[col_name] = self.df[col_name].astype(str)
                elif field_schema.field_type == 'checkbox' and field_schema.multiple:
                    # Split multiple values
                    self.df[col_name] = self.df[col_name].apply(
                        lambda x: x.split('; ') if pd.notna(x) and x else []
                    )
                elif field_schema.field_type == 'datatable':
                    # Parse JSON datatable content
                    self.df[col_name] = self.df[col_name].apply(self._parse_datatable)
                    self.datatable_fields[col_name] = field_schema
                elif field_schema.field_type == 'unknown':
                    # Treat unknown fields as text
                    logger.warning(f"Unknown field type for column '{col_name}', treating as text")
                    self.df[col_name] = self.df[col_name].astype(str, errors='ignore')
            except Exception as e:
                logger.error(f"Error converting type for column '{col_name}': {e}")
    
    def validate_data(self) -> List[Dict[str, Any]]:
        """Validate data against schema constraints"""
        logger.info("Validating data against schema")
        self.validation_errors = []
        
        for idx, row in self.df.iterrows():
            for col_name, field_schema in self.schema.items():
                if col_name not in self.df.columns:
                    continue
                    
                value = row[col_name]
                
                # Check required fields
                if field_schema.required and pd.isna(value):
                    self.validation_errors.append({
                        'row': idx,
                        'column': col_name,
                        'error': 'Required field is empty',
                        'value': value
                    })
                
                # Check options for radio/select fields
                if field_schema.options and pd.notna(value):
                    if field_schema.field_type in ['radio', 'select']:
                        if str(value) not in field_schema.options:
                            self.validation_errors.append({
                                'row': idx,
                                'column': col_name,
                                'error': f'Invalid option: {value}',
                                'valid_options': field_schema.options
                            })
                    elif field_schema.field_type == 'checkbox' and field_schema.multiple:
                        if isinstance(value, list):
                            invalid_opts = [v for v in value if v not in field_schema.options]
                            if invalid_opts:
                                self.validation_errors.append({
                                    'row': idx,
                                    'column': col_name,
                                    'error': f'Invalid options: {invalid_opts}',
                                    'valid_options': field_schema.options
                                })
                
                # Check numeric ranges
                if pd.notna(value) and field_schema.field_type == 'number':
                    if field_schema.min_value is not None and value < field_schema.min_value:
                        self.validation_errors.append({
                            'row': idx,
                            'column': col_name,
                            'error': f'Value {value} below minimum {field_schema.min_value}'
                        })
                    if field_schema.max_value is not None and value > field_schema.max_value:
                        self.validation_errors.append({
                            'row': idx,
                            'column': col_name,
                            'error': f'Value {value} above maximum {field_schema.max_value}'
                        })
        
        logger.info(f"Validation complete: found {len(self.validation_errors)} errors")
        return self.validation_errors
    
    def get_section_summary(self, section_name: str) -> Dict[str, Any]:
        """Generate statistical summary for a specific section"""
        if section_name not in self.sections:
            logger.warning(f"Section '{section_name}' not found")
            return {}
        
        section_cols = self.sections[section_name]
        summary = {
            'section': section_name,
            'total_fields': len(section_cols),
            'field_summaries': {}
        }
        
        for col in section_cols:
            field_schema = self.schema[col]
            col_summary = {
                'field_type': field_schema.field_type,
                'non_null_count': self.df[col].notna().sum(),
                'null_count': self.df[col].isna().sum(),
                'completion_rate': self.df[col].notna().mean()
            }
            
            # Add type-specific summaries
            if field_schema.field_type in ['radio', 'select']:
                value_counts = self.df[col].value_counts()
                col_summary['value_distribution'] = value_counts.to_dict()
                col_summary['most_common'] = value_counts.index[0] if len(value_counts) > 0 else None
                
            elif field_schema.field_type == 'checkbox' and field_schema.multiple:
                # Flatten lists and count occurrences
                all_values = []
                for val_list in self.df[col].dropna():
                    if isinstance(val_list, list):
                        all_values.extend(val_list)
                value_counts = pd.Series(all_values).value_counts()
                col_summary['value_distribution'] = value_counts.to_dict()
                
            elif field_schema.field_type == 'number':
                col_summary['mean'] = self.df[col].mean()
                col_summary['std'] = self.df[col].std()
                col_summary['min'] = self.df[col].min()
                col_summary['max'] = self.df[col].max()
                col_summary['median'] = self.df[col].median()
            
            summary['field_summaries'][col] = col_summary
        
        return summary
    
    def get_all_sections_summary(self) -> Dict[str, Dict[str, Any]]:
        """Generate summaries for all sections"""
        all_summaries = {}
        for section_name in self.sections:
            all_summaries[section_name] = self.get_section_summary(section_name)
        return all_summaries
    
    def analyze_application_patterns(self) -> Dict[str, Any]:
        """Analyze response patterns across different applications"""
        # Find all application-related columns
        app_patterns = defaultdict(dict)
        
        # Common application names found in the data
        applications = [
            'jcc2cyberops', 'jcc2readiness', 'a2it', 'cad', 'codex', 
            'crucible', 'cyber9line', 'dispatch', 'madss', 'rally', 
            'redmap', 'sigact', 'threathub', 'triage', 'unity'
        ]
        
        for app in applications:
            app_cols = [col for col in self.df.columns if app in col.lower()]
            
            if not app_cols:
                continue
                
            app_patterns[app] = {
                'total_fields': len(app_cols),
                'sections': defaultdict(list)
            }
            
            # Group by section
            for col in app_cols:
                if col in self.schema:
                    section = self.schema[col].section
                    if section:
                        app_patterns[app]['sections'][section].append(col)
            
            # Calculate overall engagement
            non_null_counts = []
            for col in app_cols:
                if col in self.df.columns:
                    non_null_counts.append(self.df[col].notna().sum())
            
            if non_null_counts:
                app_patterns[app]['avg_responses'] = np.mean(non_null_counts)
                app_patterns[app]['total_responses'] = sum(non_null_counts)
        
        return dict(app_patterns)
    
    def _parse_datatable(self, value: Any) -> Optional[Dict[str, Any]]:
        """Parse datatable JSON content"""
        if pd.isna(value) or value == 'null' or not value:
            return None
        
        try:
            if isinstance(value, str):
                return json.loads(value)
            return value
        except json.JSONDecodeError:
            logger.error(f"Failed to parse datatable JSON: {value[:100]}...")
            return None
    
    @abstractmethod
    def get_format_specific_summary(self) -> Dict[str, Any]:
        """Get format-specific summary data"""
        pass
    
    @abstractmethod
    def prepare_format_specific_visualizations(self) -> Dict[str, Any]:
        """Prepare format-specific visualization data"""
        pass
    
    def prepare_visualization_data(self) -> Dict[str, pd.DataFrame]:
        """Prepare data structures optimized for visualization"""
        viz_data = {}
        
        # Prepare data for effectiveness heatmaps
        effectiveness_cols = [col for col in self.df.columns 
                            if 'effectiveness' in col or 'effective' in col.lower()]
        
        if effectiveness_cols:
            # Extract effectiveness ratings
            effectiveness_data = self.df[effectiveness_cols].copy()
            
            # Map text ratings to numeric values
            rating_map = {
                'Completely Ineffective': 1,
                'Moderately Ineffective': 2,
                'Slightly Ineffective': 3,
                'Slightly Effective': 4,
                'Moderately Effective': 5,
                'Completely Effective': 6,
                'Not Applicable': np.nan
            }
            
            for col in effectiveness_cols:
                effectiveness_data[col] = effectiveness_data[col].map(rating_map)
            
            viz_data['effectiveness_heatmap'] = effectiveness_data
        
        # Prepare data for frequency bar charts
        frequency_cols = [col for col in self.df.columns if 'frequency' in col.lower()]
        if frequency_cols:
            viz_data['frequency_data'] = self.df[frequency_cols].copy()
        
        # Prepare application usage summary
        app_usage = []
        for app, pattern in self.analyze_application_patterns().items():
            app_usage.append({
                'application': app,
                'total_fields': pattern['total_fields'],
                'avg_responses': pattern.get('avg_responses', 0),
                'total_responses': pattern.get('total_responses', 0)
            })
        
        viz_data['application_usage'] = pd.DataFrame(app_usage)
        
        return viz_data
    
    def export_summary(self, output_path: Optional[str] = None) -> Dict[str, Any]:
        """Export comprehensive summary of the data"""
        summary = {
            'metadata': {
                'source_file': str(self.csv_path),
                'processed_at': datetime.now().isoformat(),
                'total_rows': len(self.df),
                'total_columns': len(self.df.columns),
                'total_sections': len(self.sections),
                'validation_errors': len(self.validation_errors)
            },
            'sections': self.get_all_sections_summary(),
            'application_patterns': self.analyze_application_patterns(),
            'validation_errors': self.validation_errors[:10],  # First 10 errors
            'format_type': self.format_type.value,
            'format_specific': self.get_format_specific_summary()
        }
        
        if output_path:
            with open(output_path, 'w') as f:
                json.dump(summary, f, indent=2, default=str)
            logger.info(f"Summary exported to {output_path}")
        
        return summary


class UserQuestionnaireProcessor(BaseJCC2Processor):
    """Processor for JCC2 User Questionnaire format"""
    
    def __init__(self, csv_path: str):
        super().__init__(csv_path)
        self.format_type = DataFormat.USER_QUESTIONNAIRE
    
    def get_format_specific_summary(self) -> Dict[str, Any]:
        """Get questionnaire-specific summary"""
        summary = {
            'effectiveness_ratings': {},
            'frequency_distributions': {},
            'section_completion_rates': {}
        }
        
        # Analyze effectiveness ratings
        effectiveness_cols = [col for col in self.df.columns 
                            if 'effectiveness' in col or 'effective' in col.lower()]
        
        for col in effectiveness_cols:
            if col in self.df.columns:
                value_counts = self.df[col].value_counts()
                summary['effectiveness_ratings'][col] = value_counts.to_dict()
        
        # Analyze frequency distributions
        frequency_cols = [col for col in self.df.columns if 'frequency' in col.lower()]
        for col in frequency_cols:
            if col in self.df.columns:
                value_counts = self.df[col].value_counts()
                summary['frequency_distributions'][col] = value_counts.to_dict()
        
        # Calculate section completion rates
        for section_name, columns in self.sections.items():
            non_null_counts = [self.df[col].notna().sum() for col in columns if col in self.df.columns]
            if non_null_counts:
                avg_completion = np.mean(non_null_counts) / len(self.df) if len(self.df) > 0 else 0
                summary['section_completion_rates'][section_name] = avg_completion
        
        return summary
    
    def prepare_format_specific_visualizations(self) -> Dict[str, Any]:
        """Prepare questionnaire-specific visualizations"""
        viz_data = {}
        
        # Effectiveness heatmap data
        effectiveness_cols = [col for col in self.df.columns 
                            if 'effectiveness' in col or 'effective' in col.lower()]
        
        if effectiveness_cols:
            effectiveness_data = self.df[effectiveness_cols].copy()
            
            # Map text ratings to numeric values
            rating_map = {
                'Completely Ineffective': 1,
                'Moderately Ineffective': 2,
                'Slightly Ineffective': 3,
                'Slightly Effective': 4,
                'Moderately Effective': 5,
                'Completely Effective': 6,
                'Not Applicable': np.nan
            }
            
            for col in effectiveness_cols:
                effectiveness_data[col] = effectiveness_data[col].map(rating_map)
            
            viz_data['effectiveness_heatmap'] = effectiveness_data
        
        # Frequency bar charts data
        frequency_cols = [col for col in self.df.columns if 'frequency' in col.lower()]
        if frequency_cols:
            viz_data['frequency_data'] = self.df[frequency_cols].copy()
        
        return viz_data
    
    def calculate_nps_score(self, df: Optional[pd.DataFrame] = None) -> Optional[float]:
        """
        Calculate Net Promoter Score (NPS) based on recommendation data
        
        NPS = % Promoters - % Detractors
        
        For JCC2 questionnaire:
        - Promoters: Users who would recommend (Yes)
        - Detractors: Users who would not recommend (No)
        - Neutrals: Users who are unsure (Maybe) or no response
        
        Args:
            df: DataFrame to use (defaults to self.df)
            
        Returns:
            NPS score (-100 to 100) or None if data not available
        """
        if df is None:
            df = self.df
            
        if df is None:
            logger.warning("No data loaded for NPS calculation")
            return None
            
        # Check for recommendation field
        recommend_field = 'overall_system_suitability_eval.recommend_jcc2'
        if recommend_field not in df.columns:
            logger.warning(f"Recommendation field '{recommend_field}' not found in data")
            return None
            
        # Get value counts
        rec_counts = df[recommend_field].value_counts()
        total_responses = rec_counts.sum()
        
        if total_responses == 0:
            logger.warning("No valid responses for NPS calculation")
            return None
            
        # Calculate promoters and detractors percentages
        promoters_count = rec_counts.get('Yes', 0)
        detractors_count = rec_counts.get('No', 0)
        
        promoters_pct = (promoters_count / total_responses) * 100
        detractors_pct = (detractors_count / total_responses) * 100
        
        # Calculate NPS
        nps_score = promoters_pct - detractors_pct
        
        logger.info(f"NPS Score: {nps_score:.1f} (Promoters: {promoters_pct:.1f}%, Detractors: {detractors_pct:.1f}%)")
        
        return nps_score
    
    def calculate_sus_scores(self, df: Optional[pd.DataFrame] = None) -> Optional[List[float]]:
        """
        Calculate System Usability Scale (SUS) scores
        
        SUS scoring:
        - For odd questions (1,3,5,7,9): score = scale position - 1
        - For even questions (2,4,6,8,10): score = 5 - scale position
        - Total SUS score = sum of scores * 2.5 (to get 0-100 scale)
        
        Args:
            df: DataFrame to use (defaults to self.df)
            
        Returns:
            List of SUS scores for each valid response or None if data not available
        """
        if df is None:
            df = self.df
            
        if df is None:
            logger.warning("No data loaded for SUS calculation")
            return None
            
        # Find SUS fields
        sus_fields = [f for f in df.columns if f.startswith('overall_system_usability.sus_')]
        
        if len(sus_fields) != 10:
            logger.warning(f"Expected 10 SUS fields, found {len(sus_fields)}")
            return None
            
        # Sort fields to ensure correct order (sus_1 through sus_10)
        sus_fields.sort(key=lambda x: int(x.split('sus_')[-1]))
        
        sus_scores = []
        
        # Calculate SUS score for each row
        for idx, row in df.iterrows():
            row_score = 0
            valid_responses = 0
            
            for i, field in enumerate(sus_fields):
                value = row[field]
                
                if pd.notna(value) and isinstance(value, (int, float)):
                    # Convert to numeric if string
                    try:
                        value = float(value)
                    except:
                        continue
                        
                    # Apply SUS scoring rules
                    if (i + 1) % 2 == 1:  # Odd questions (1,3,5,7,9)
                        score = value - 1
                    else:  # Even questions (2,4,6,8,10)
                        score = 5 - value
                        
                    row_score += score
                    valid_responses += 1
            
            # Only calculate if all 10 questions were answered
            if valid_responses == 10:
                sus_score = row_score * 2.5  # Convert to 0-100 scale
                sus_scores.append(sus_score)
        
        if not sus_scores:
            logger.warning("No complete SUS responses found")
            return None
            
        logger.info(f"Calculated {len(sus_scores)} SUS scores, average: {np.mean(sus_scores):.1f}")
        
        return sus_scores


class DataCollectionProcessor(BaseJCC2Processor):
    """Processor for JCC2 Data Collection and Interview format"""
    
    def __init__(self, csv_path: str):
        super().__init__(csv_path)
        self.format_type = DataFormat.DATA_COLLECTION
        self.task_performance_data: Dict[str, pd.DataFrame] = {}
    
    def get_format_specific_summary(self) -> Dict[str, Any]:
        """Get data collection-specific summary"""
        summary = {
            'task_performance_metrics': {},
            'workaround_analysis': {},
            'problem_occurrence_rates': {},
            'datatable_summaries': {}
        }
        
        # Analyze task performance
        for section_name, columns in self.sections.items():
            if section_name.startswith(('mop', 'mos')):
                section_metrics = self._analyze_task_section(section_name, columns)
                if section_metrics:
                    summary['task_performance_metrics'][section_name] = section_metrics
        
        # Analyze workarounds
        workaround_cols = [col for col in self.df.columns if 'workaround' in col.lower()]
        for col in workaround_cols:
            if col in self.df.columns and 'details' not in col:
                value_counts = self.df[col].value_counts()
                summary['workaround_analysis'][col] = {
                    'yes_count': int(value_counts.get('Yes', 0)),
                    'no_count': int(value_counts.get('No', 0)),
                    'na_count': int(value_counts.get('N/A', 0))
                }
        
        # Analyze problem occurrences
        problem_cols = [col for col in self.df.columns if 'problem_occurrence' in col.lower()]
        for col in problem_cols:
            if col in self.df.columns and 'details' not in col:
                value_counts = self.df[col].value_counts()
                summary['problem_occurrence_rates'][col] = value_counts.to_dict()
        
        # Summarize datatable fields
        for field_name, field_schema in self.datatable_fields.items():
            if field_name in self.df.columns:
                dt_summary = self._summarize_datatable_field(field_name)
                if dt_summary:
                    summary['datatable_summaries'][field_name] = dt_summary
        
        return summary
    
    def _analyze_task_section(self, section_name: str, columns: List[str]) -> Dict[str, Any]:
        """Analyze a task performance section"""
        metrics = {}
        
        # Look for performance columns
        perf_col = f"{section_name}.task_performance"
        if perf_col in columns and perf_col in self.df.columns:
            value_counts = self.df[perf_col].value_counts()
            metrics['performance_distribution'] = value_counts.to_dict()
            
            # Calculate success rate
            yes_count = value_counts.get('Yes', 0)
            total_valid = sum(value_counts.get(val, 0) for val in ['Yes', 'No'])
            if total_valid > 0:
                metrics['success_rate'] = yes_count / total_valid
        
        # Look for outcome columns
        outcome_col = f"{section_name}.task_outcome"
        if outcome_col in columns and outcome_col in self.df.columns:
            value_counts = self.df[outcome_col].value_counts()
            metrics['outcome_distribution'] = value_counts.to_dict()
        
        return metrics
    
    def _summarize_datatable_field(self, field_name: str) -> Dict[str, Any]:
        """Summarize a datatable field"""
        summary = {
            'total_entries': 0,
            'avg_rows_per_entry': 0,
            'column_summaries': {}
        }
        
        valid_datatables = []
        for dt in self.df[field_name].dropna():
            if isinstance(dt, dict) and 'rows' in dt:
                valid_datatables.append(dt)
                summary['total_entries'] += 1
        
        if valid_datatables:
            row_counts = [len(dt.get('rows', [])) for dt in valid_datatables]
            summary['avg_rows_per_entry'] = np.mean(row_counts)
            
            # Analyze columns if present
            if valid_datatables[0].get('columns'):
                for col_def in valid_datatables[0]['columns']:
                    col_id = col_def.get('id', '')
                    col_type = col_def.get('type', '')
                    summary['column_summaries'][col_id] = {
                        'type': col_type,
                        'label': col_def.get('label', '')
                    }
        
        return summary
    
    def prepare_format_specific_visualizations(self) -> Dict[str, Any]:
        """Prepare data collection-specific visualizations"""
        viz_data = {}
        
        # Task performance success rates
        performance_data = []
        for section_name, columns in self.sections.items():
            if section_name.startswith(('mop', 'mos')):
                perf_col = f"{section_name}.task_performance"
                if perf_col in self.df.columns:
                    value_counts = self.df[perf_col].value_counts()
                    yes_count = value_counts.get('Yes', 0)
                    total_valid = sum(value_counts.get(val, 0) for val in ['Yes', 'No'])
                    if total_valid > 0:
                        performance_data.append({
                            'task': section_name,
                            'success_rate': yes_count / total_valid,
                            'total_attempts': total_valid
                        })
        
        if performance_data:
            viz_data['task_performance'] = pd.DataFrame(performance_data)
        
        # Workaround frequency
        workaround_data = []
        for col in self.df.columns:
            if 'workaround' in col.lower() and 'details' not in col:
                value_counts = self.df[col].value_counts()
                if 'Yes' in value_counts:
                    workaround_data.append({
                        'field': col,
                        'workaround_count': int(value_counts['Yes']),
                        'total_responses': int(value_counts.sum())
                    })
        
        if workaround_data:
            viz_data['workaround_frequency'] = pd.DataFrame(workaround_data)
        
        return viz_data
    
    def analyze_performance_patterns(self) -> Dict[str, Any]:
        """Analyze performance patterns across tasks"""
        patterns = {
            'task_success_rates': {},
            'workaround_correlations': {},
            'problem_impact_analysis': {}
        }
        
        # Calculate success rates by task type
        for section_name in self.sections:
            if section_name.startswith(('mop', 'mos')):
                metrics = self._analyze_task_section(section_name, self.sections[section_name])
                if 'success_rate' in metrics:
                    patterns['task_success_rates'][section_name] = metrics['success_rate']
        
        # Analyze workaround impact on success
        for section_name in self.sections:
            perf_col = f"{section_name}.task_performance"
            work_col = f"{section_name}.task_workaround"
            
            if perf_col in self.df.columns and work_col in self.df.columns:
                # Create contingency table
                ct = pd.crosstab(self.df[work_col], self.df[perf_col])
                if 'Yes' in ct.index and 'Yes' in ct.columns:
                    patterns['workaround_correlations'][section_name] = {
                        'workaround_success_rate': ct.loc['Yes', 'Yes'] / ct.loc['Yes'].sum() if ct.loc['Yes'].sum() > 0 else 0
                    }
        
        return patterns


def detect_format(csv_path: str) -> DataFormat:
    """Detect the format of a JCC2 CSV file"""
    try:
        # Read just the header
        df_header = pd.read_csv(csv_path, nrows=0)
        columns = df_header.columns.tolist()
        
        # Check for format-specific columns
        if any('user_information' in col for col in columns):
            return DataFormat.USER_QUESTIONNAIRE
        elif any('basic_info' in col for col in columns) or any(col.startswith('mop') for col in columns):
            return DataFormat.DATA_COLLECTION
        else:
            return DataFormat.UNKNOWN
            
    except Exception as e:
        logger.error(f"Error detecting format: {e}")
        return DataFormat.UNKNOWN


def create_processor(csv_path: str) -> BaseJCC2Processor:
    """Factory function to create appropriate processor based on file format"""
    format_type = detect_format(csv_path)
    
    if format_type == DataFormat.USER_QUESTIONNAIRE:
        logger.info("Detected User Questionnaire format")
        return UserQuestionnaireProcessor(csv_path)
    elif format_type == DataFormat.DATA_COLLECTION:
        logger.info("Detected Data Collection format")
        return DataCollectionProcessor(csv_path)
    else:
        logger.warning("Unknown format, using base processor")
        # Fall back to UserQuestionnaireProcessor as default
        return UserQuestionnaireProcessor(csv_path)


def main():
    """Main execution function"""
    # Example usage - automatically detect format
    csv_file = "mock_20_jcc2_user_questionnaire.csv"
    
    # Create appropriate processor based on format
    processor = create_processor(csv_file)
    
    # Load and process data
    df = processor.load_data()
    print(f"Loaded data shape: {df.shape}")
    
    # Validate data
    errors = processor.validate_data()
    print(f"Validation errors: {len(errors)}")
    
    # Get section summaries
    print("\n=== Section Summaries ===")
    for section_name in list(processor.sections.keys())[:3]:  # First 3 sections
        summary = processor.get_section_summary(section_name)
        print(f"\nSection: {section_name}")
        print(f"Total fields: {summary['total_fields']}")
    
    # Analyze application patterns
    print("\n=== Application Patterns ===")
    app_patterns = processor.analyze_application_patterns()
    for app, pattern in list(app_patterns.items())[:5]:  # First 5 apps
        print(f"\n{app}: {pattern['total_fields']} fields, "
              f"{pattern.get('avg_responses', 0):.1f} avg responses")
    
    # Prepare visualization data
    viz_data = processor.prepare_visualization_data()
    print("\n=== Visualization Data Prepared ===")
    for key, data in viz_data.items():
        print(f"{key}: {data.shape if hasattr(data, 'shape') else len(data)} records")
    
    # Format-specific visualizations
    format_viz = processor.prepare_format_specific_visualizations()
    print("\n=== Format-Specific Visualizations ===")
    for key, data in format_viz.items():
        print(f"{key}: {data.shape if hasattr(data, 'shape') else len(data)} records")
    
    # Export summary
    output_filename = f"jcc2_{processor.format_type.value}_summary.json"
    processor.export_summary(output_filename)
    
    # Handle format-specific analysis
    if isinstance(processor, DataCollectionProcessor):
        print("\n=== Performance Analysis ===")
        perf_patterns = processor.analyze_performance_patterns()
        print(f"Task success rates: {len(perf_patterns['task_success_rates'])} tasks analyzed")
        print(f"Workaround correlations: {len(perf_patterns['workaround_correlations'])} correlations found")
    
    # Return the main dataframe and processor for further use
    return df, processor


if __name__ == "__main__":
    df, processor = main()