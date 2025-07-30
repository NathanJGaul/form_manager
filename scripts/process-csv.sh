#!/bin/bash

# CSV Processing Utility Script
# This script validates and combines CSV files exported from the form manager system
# Usage: ./process-csv.sh [validate|combine] [options]

set -euo pipefail

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$*${NC}"
}

# Function to validate CSV structure and data against schema
validate_csv() {
    local csv_file="$1"
    local verbose="${2:-false}"
    
    if [[ ! -f "$csv_file" ]]; then
        print_color "$RED" "Error: File '$csv_file' not found"
        return 1
    fi
    
    print_color "$BLUE" "Validating: $csv_file"
    
    # Read header and schema lines
    local headers=$(head -n 1 "$csv_file")
    local schema=$(sed -n '2p' "$csv_file")
    
    if [[ -z "$headers" ]] || [[ -z "$schema" ]]; then
        print_color "$RED" "Error: Missing header or schema row"
        return 1
    fi
    
    # Count columns using Python for proper CSV parsing
    local header_count=$(echo "$headers" | python3 -c "import csv, sys; print(len(next(csv.reader(sys.stdin))))" 2>/dev/null || echo "0")
    local schema_count=$(echo "$schema" | python3 -c "import csv, sys; print(len(next(csv.reader(sys.stdin))))" 2>/dev/null || echo "0")
    
    if [[ "$header_count" -ne "$schema_count" ]]; then
        print_color "$RED" "Error: Header columns ($header_count) don't match schema columns ($schema_count)"
        return 1
    fi
    
    print_color "$GREEN" "✓ Structure validation passed: $header_count columns"
    
    # Validate data rows
    local line_num=3
    local errors=0
    local warnings=0
    
    # Convert headers and schema to arrays using Python for proper CSV parsing
    mapfile -t header_array < <(echo "$headers" | python3 -c "import csv, sys; [print(f) for f in next(csv.reader(sys.stdin))]")
    mapfile -t schema_array < <(echo "$schema" | python3 -c "import csv, sys; [print(f) for f in next(csv.reader(sys.stdin))]")
    
    # Process data rows
    while IFS= read -r line; do
        if [[ -z "$line" ]]; then
            continue
        fi
        
        # Parse CSV line properly using Python
        mapfile -t fields < <(echo "$line" | python3 -c "import csv, sys; [print(f) for f in next(csv.reader(sys.stdin))]" 2>/dev/null || echo)
        
        local field_count=${#fields[@]}
        
        if [[ "$field_count" -ne "$header_count" ]]; then
            print_color "$RED" "Error: Line $line_num has $field_count fields, expected $header_count"
            ((errors++))
            continue
        fi
        
        # Validate each field against schema
        for i in "${!fields[@]}"; do
            local value="${fields[$i]}"
            local field_schema="${schema_array[$i]}"
            local field_name="${header_array[$i]}"
            
            # Parse schema rules
            if [[ "$field_schema" =~ ^([^|]+)(\|.+)?$ ]]; then
                local field_type="${BASH_REMATCH[1]}"
                local rules="${BASH_REMATCH[2]:-}"
                
                # Type validation
                case "$field_type" in
                    "system|identifier")
                        if [[ ! "$value" =~ ^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$ ]] && [[ -n "$value" ]]; then
                            [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Invalid UUID format"
                            ((warnings++))
                        fi
                        ;;
                    "system|datetime")
                        if [[ ! "$value" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{3})?Z?$ ]] && [[ -n "$value" ]]; then
                            [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Invalid datetime format"
                            ((warnings++))
                        fi
                        ;;
                    "system|number"*)
                        if [[ -n "$value" ]] && ! [[ "$value" =~ ^-?[0-9]+(\.[0-9]+)?$ ]]; then
                            [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Invalid number format"
                            ((warnings++))
                        fi
                        ;;
                    "email"*)
                        if [[ -n "$value" ]] && ! [[ "$value" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
                            [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Invalid email format"
                            ((warnings++))
                        fi
                        ;;
                    "date"*)
                        if [[ -n "$value" ]] && ! [[ "$value" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
                            [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Invalid date format"
                            ((warnings++))
                        fi
                        ;;
                    "tel"*)
                        # Very lenient phone validation - just check for basic phone characters
                        if [[ -n "$value" ]] && ! [[ "$value" =~ ^[+0-9\ \-\(\)\.ext\#,]+$ ]]; then
                            [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Invalid phone format"
                            ((warnings++))
                        fi
                        ;;
                esac
                
                # Check required fields
                # Note: 'null' as a string value indicates the field was hidden by conditional logic
                if [[ "$rules" =~ "required" ]] && [[ -z "$value" ]] && [[ "$value" != "null" ]]; then
                    print_color "$RED" "Error: Line $line_num, field '$field_name': Required field is empty"
                    ((errors++))
                fi
                
                # Check enum values (skip 'null' values as they indicate hidden fields)
                if [[ "$rules" =~ options:([^|]+) ]] && [[ "$value" != "null" ]] && [[ -n "$value" ]]; then
                    local options="${BASH_REMATCH[1]}"
                    
                    # Check if field supports multiple values
                    if [[ "$rules" =~ "multiple" ]]; then
                        # Split value by semicolon for multiple values
                        IFS=';' read -ra value_array <<< "$value"
                        IFS=',' read -ra option_array <<< "$options"
                        
                        for val in "${value_array[@]}"; do
                            val=$(echo "$val" | xargs) # Trim whitespace
                            if [[ -n "$val" ]] && [[ "$val" != "null" ]]; then
                                local valid=false
                                for option in "${option_array[@]}"; do
                                    if [[ "$val" == "$option" ]]; then
                                        valid=true
                                        break
                                    fi
                                done
                                if [[ "$valid" == "false" ]]; then
                                    [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Value '$val' not in allowed options"
                                    ((warnings++))
                                fi
                            fi
                        done
                    else
                        # Single value check
                        local valid=false
                        IFS=',' read -ra option_array <<< "$options"
                        for option in "${option_array[@]}"; do
                            if [[ "$value" == "$option" ]]; then
                                valid=true
                                break
                            fi
                        done
                        if [[ "$valid" == "false" ]] && [[ -n "$value" ]]; then
                            [[ "$verbose" == "true" ]] && print_color "$YELLOW" "Warning: Line $line_num, field '$field_name': Value '$value' not in allowed options"
                            ((warnings++))
                        fi
                    fi
                fi
            fi
        done
        
        ((line_num++))
    done < <(tail -n +3 "$csv_file")
    
    # Summary
    local data_rows=$((line_num - 3))
    print_color "$BLUE" "Processed $data_rows data rows"
    
    if [[ "$errors" -eq 0 ]]; then
        print_color "$GREEN" "✓ Validation passed with $warnings warnings"
        return 0
    else
        print_color "$RED" "✗ Validation failed with $errors errors and $warnings warnings"
        return 1
    fi
}

# Function to combine multiple CSV files
combine_csv() {
    local output_file="$1"
    shift
    local input_files=("$@")
    
    if [[ ${#input_files[@]} -eq 0 ]]; then
        print_color "$RED" "Error: No input files provided"
        return 1
    fi
    
    print_color "$BLUE" "Combining ${#input_files[@]} CSV files..."
    
    # Verify all files exist and have the same structure
    local reference_headers=""
    local reference_schema=""
    local all_valid=true
    
    for file in "${input_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            print_color "$RED" "Error: File '$file' not found"
            all_valid=false
            continue
        fi
        
        local headers=$(head -n 1 "$file")
        local schema=$(sed -n '2p' "$file")
        
        if [[ -z "$reference_headers" ]]; then
            reference_headers="$headers"
            reference_schema="$schema"
        else
            if [[ "$headers" != "$reference_headers" ]]; then
                print_color "$RED" "Error: Headers in '$file' don't match reference headers"
                all_valid=false
            fi
            if [[ "$schema" != "$reference_schema" ]]; then
                print_color "$RED" "Error: Schema in '$file' doesn't match reference schema"
                all_valid=false
            fi
        fi
    done
    
    if [[ "$all_valid" == "false" ]]; then
        return 1
    fi
    
    # Create output file with headers and schema
    echo "$reference_headers" > "$output_file"
    echo "$reference_schema" >> "$output_file"
    
    # Combine data rows from all files
    local total_rows=0
    for file in "${input_files[@]}"; do
        local rows=$(tail -n +3 "$file" | grep -v '^$' | wc -l)
        tail -n +3 "$file" | grep -v '^$' >> "$output_file"
        total_rows=$((total_rows + rows))
        print_color "$GREEN" "✓ Added $rows rows from $file"
    done
    
    print_color "$GREEN" "✓ Successfully combined $total_rows rows into $output_file"
    return 0
}

# Function to show usage
show_usage() {
    cat << EOF
CSV Processing Utility for Form Manager

Usage: $0 [command] [options]

Commands:
  validate <file.csv> [-v|--verbose]
    Validate a single CSV file against its schema
    Options:
      -v, --verbose    Show detailed validation warnings

  combine <output.csv> <input1.csv> [input2.csv ...]
    Combine multiple CSV files with the same schema
    
  help
    Show this help message

Examples:
  # Validate a single CSV file
  $0 validate "data/JCC2 User Questionnaire V4_mock_combine_1.csv"
  
  # Validate with verbose output
  $0 validate "data/form_data.csv" --verbose
  
  # Combine multiple CSV files
  $0 combine "combined_output.csv" data/*.csv
  
  # Combine specific files
  $0 combine "output.csv" "file1.csv" "file2.csv" "file3.csv"

EOF
}

# Main script logic
main() {
    local command="${1:-}"
    
    case "$command" in
        validate)
            shift
            if [[ $# -eq 0 ]]; then
                print_color "$RED" "Error: No file specified for validation"
                show_usage
                exit 1
            fi
            
            local file="$1"
            local verbose=false
            
            shift
            while [[ $# -gt 0 ]]; do
                case "$1" in
                    -v|--verbose)
                        verbose=true
                        ;;
                    *)
                        print_color "$RED" "Error: Unknown option '$1'"
                        show_usage
                        exit 1
                        ;;
                esac
                shift
            done
            
            validate_csv "$file" "$verbose"
            ;;
            
        combine)
            shift
            if [[ $# -lt 2 ]]; then
                print_color "$RED" "Error: Combine requires output file and at least one input file"
                show_usage
                exit 1
            fi
            
            combine_csv "$@"
            ;;
            
        help|--help|-h)
            show_usage
            ;;
            
        *)
            print_color "$RED" "Error: Unknown command '$command'"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"