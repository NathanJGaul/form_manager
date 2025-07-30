# CSV Processing Utility Script for PowerShell
# This script validates and combines CSV files exported from the form manager system
# Usage: .\process-csv.ps1 [validate|combine] [options]

param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet('validate', 'combine', 'help')]
    [string]$Command,
    
    [Parameter(Position = 1, ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

# Color functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [ConsoleColor]$Color = 'White'
    )
    Write-Host $Message -ForegroundColor $Color
}

# Function to validate CSV structure and data against schema
function Validate-FormCSV {
    param(
        [string]$FilePath,
        [switch]$Verbose
    )
    
    if (-not (Test-Path $FilePath)) {
        Write-ColorOutput "Error: File '$FilePath' not found" -Color Red
        return $false
    }
    
    Write-ColorOutput "Validating: $FilePath" -Color Blue
    
    # Read the CSV file
    $lines = Get-Content $FilePath
    
    if ($lines.Count -lt 2) {
        Write-ColorOutput "Error: Missing header or schema row" -Color Red
        return $false
    }
    
    $headers = $lines[0]
    $schema = $lines[1]
    
    # Parse headers and schema using proper CSV parsing
    $headerArray = $headers | ConvertFrom-Csv -Header (1..1000 | ForEach-Object { "Col$_" }) | ForEach-Object { $_.PSObject.Properties.Value } | Where-Object { $_ -ne $null }
    $schemaArray = $schema | ConvertFrom-Csv -Header (1..1000 | ForEach-Object { "Col$_" }) | ForEach-Object { $_.PSObject.Properties.Value } | Where-Object { $_ -ne $null }
    
    $headerCount = $headerArray.Count
    $schemaCount = $schemaArray.Count
    
    if ($headerCount -ne $schemaCount) {
        Write-ColorOutput "Error: Header columns ($headerCount) don't match schema columns ($schemaCount)" -Color Red
        return $false
    }
    
    Write-ColorOutput "✓ Structure validation passed: $headerCount columns" -Color Green
    
    # Validate data rows
    $errors = 0
    $warnings = 0
    $lineNum = 3
    $dataRows = 0
    
    for ($i = 2; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ([string]::IsNullOrWhiteSpace($line)) {
            continue
        }
        
        $dataRows++
        
        # Parse CSV line using proper CSV parsing
        $fields = $line | ConvertFrom-Csv -Header (1..1000 | ForEach-Object { "Col$_" }) | ForEach-Object { $_.PSObject.Properties.Value } | Where-Object { $_ -ne $null }
        
        $fieldCount = $fields.Count
        
        if ($fieldCount -ne $headerCount) {
            Write-ColorOutput "Error: Line $lineNum has $fieldCount fields, expected $headerCount" -Color Red
            $errors++
            $lineNum++
            continue
        }
        
        # Validate each field against schema
        for ($j = 0; $j -lt $fields.Count; $j++) {
            $value = if ($fields[$j]) { $fields[$j] } else { "" }
            $fieldSchema = $schemaArray[$j]
            $fieldName = $headerArray[$j]
            
            # Parse schema rules
            $schemaParts = $fieldSchema -split '\|'
            $fieldType = $schemaParts[0]
            $rules = $schemaParts[1..($schemaParts.Count - 1)]
            
            # Type validation
            switch -Regex ($fieldType) {
                'system\|identifier' {
                    if ($value -and $value -notmatch '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$') {
                        if ($Verbose) {
                            Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Invalid UUID format" -Color Yellow
                        }
                        $warnings++
                    }
                }
                'system\|datetime' {
                    if ($value -and $value -notmatch '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$') {
                        if ($Verbose) {
                            Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Invalid datetime format" -Color Yellow
                        }
                        $warnings++
                    }
                }
                'system\|number' {
                    if ($value -and $value -notmatch '^-?\d+(\.\d+)?$') {
                        if ($Verbose) {
                            Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Invalid number format" -Color Yellow
                        }
                        $warnings++
                    }
                }
                'email' {
                    if ($value -and $value -notmatch '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$') {
                        if ($Verbose) {
                            Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Invalid email format" -Color Yellow
                        }
                        $warnings++
                    }
                }
                'date' {
                    if ($value -and $value -notmatch '^\d{4}-\d{2}-\d{2}$') {
                        if ($Verbose) {
                            Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Invalid date format" -Color Yellow
                        }
                        $warnings++
                    }
                }
                'tel' {
                    # Very lenient phone validation - just check for basic phone characters
                    if ($value -and $value -notmatch '^[\+0-9\-\(\)\ \.\,ext\#]+$') {
                        if ($Verbose) {
                            Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Invalid phone format" -Color Yellow
                        }
                        $warnings++
                    }
                }
            }
            
            # Check required fields
            # Note: 'null' as a string value indicates the field was hidden by conditional logic
            if ($rules -contains 'required' -and [string]::IsNullOrWhiteSpace($value) -and $value -ne 'null') {
                Write-ColorOutput "Error: Line $lineNum, field '$fieldName': Required field is empty" -Color Red
                $errors++
            }
            
            # Check enum values
            foreach ($rule in $rules) {
                if ($rule -match '^options:(.+)$') {
                    $options = $Matches[1] -split ','
                    $isMultiple = $rules -contains 'multiple'
                    
                    # Skip validation for 'null' values as they indicate hidden fields
                    if ($value -and $value -ne 'null') {
                        if ($isMultiple) {
                            # For multiple values, split by semicolon and check each
                            $values = $value -split ';' | ForEach-Object { $_.Trim() }
                            foreach ($val in $values) {
                                if ($val -and $val -ne 'null' -and $val -notin $options) {
                                    if ($Verbose) {
                                        Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Value '$val' not in allowed options" -Color Yellow
                                    }
                                    $warnings++
                                }
                            }
                        } else {
                            # Single value check
                            if ($value -notin $options) {
                                if ($Verbose) {
                                    Write-ColorOutput "Warning: Line $lineNum, field '$fieldName': Value '$value' not in allowed options" -Color Yellow
                                }
                                $warnings++
                            }
                        }
                    }
                }
            }
        }
        
        $lineNum++
    }
    
    # Summary
    Write-ColorOutput "Processed $dataRows data rows" -Color Blue
    
    if ($errors -eq 0) {
        Write-ColorOutput "✓ Validation passed with $warnings warnings" -Color Green
        return $true
    } else {
        Write-ColorOutput "✗ Validation failed with $errors errors and $warnings warnings" -Color Red
        return $false
    }
}

# Function to combine multiple CSV files
function Combine-FormCSV {
    param(
        [string]$OutputFile,
        [string[]]$InputFiles
    )
    
    if ($InputFiles.Count -eq 0) {
        Write-ColorOutput "Error: No input files provided" -Color Red
        return $false
    }
    
    Write-ColorOutput "Combining $($InputFiles.Count) CSV files..." -Color Blue
    
    # Verify all files exist and have the same structure
    $referenceHeaders = ""
    $referenceSchema = ""
    $allValid = $true
    
    foreach ($file in $InputFiles) {
        if (-not (Test-Path $file)) {
            Write-ColorOutput "Error: File '$file' not found" -Color Red
            $allValid = $false
            continue
        }
        
        $lines = Get-Content $file
        if ($lines.Count -lt 2) {
            Write-ColorOutput "Error: File '$file' missing header or schema" -Color Red
            $allValid = $false
            continue
        }
        
        $headers = $lines[0]
        $schema = $lines[1]
        
        if ([string]::IsNullOrEmpty($referenceHeaders)) {
            $referenceHeaders = $headers
            $referenceSchema = $schema
        } else {
            if ($headers -ne $referenceHeaders) {
                Write-ColorOutput "Error: Headers in '$file' don't match reference headers" -Color Red
                $allValid = $false
            }
            if ($schema -ne $referenceSchema) {
                Write-ColorOutput "Error: Schema in '$file' doesn't match reference schema" -Color Red
                $allValid = $false
            }
        }
    }
    
    if (-not $allValid) {
        return $false
    }
    
    # Create output file with headers and schema
    Set-Content -Path $OutputFile -Value $referenceHeaders
    Add-Content -Path $OutputFile -Value $referenceSchema
    
    # Combine data rows from all files
    $totalRows = 0
    foreach ($file in $InputFiles) {
        $lines = Get-Content $file
        $dataLines = $lines[2..($lines.Count - 1)] | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
        $rowCount = $dataLines.Count
        
        if ($rowCount -gt 0) {
            Add-Content -Path $OutputFile -Value $dataLines
            $totalRows += $rowCount
            Write-ColorOutput "✓ Added $rowCount rows from $file" -Color Green
        }
    }
    
    Write-ColorOutput "✓ Successfully combined $totalRows rows into $OutputFile" -Color Green
    return $true
}

# Function to show usage
function Show-Usage {
    $usage = @"
CSV Processing Utility for Form Manager

Usage: .\process-csv.ps1 [command] [options]

Commands:
  validate <file.csv> [-Verbose]
    Validate a single CSV file against its schema
    Options:
      -Verbose    Show detailed validation warnings

  combine <output.csv> <input1.csv> [input2.csv ...]
    Combine multiple CSV files with the same schema
    
  help
    Show this help message

Examples:
  # Validate a single CSV file
  .\process-csv.ps1 validate "data\JCC2 User Questionnaire V4_mock_combine_1.csv"
  
  # Validate with verbose output
  .\process-csv.ps1 validate "data\form_data.csv" -Verbose
  
  # Combine multiple CSV files using wildcards
  .\process-csv.ps1 combine "combined_output.csv" data\*.csv
  
  # Combine specific files
  .\process-csv.ps1 combine "output.csv" "file1.csv" "file2.csv" "file3.csv"

"@
    Write-Host $usage
}

# Main script logic
switch ($Command) {
    'validate' {
        if ($Arguments.Count -eq 0) {
            Write-ColorOutput "Error: No file specified for validation" -Color Red
            Show-Usage
            exit 1
        }
        
        $file = $Arguments[0]
        $verbose = $Arguments -contains '-Verbose'
        
        $result = Validate-FormCSV -FilePath $file -Verbose:$verbose
        if (-not $result) {
            exit 1
        }
    }
    
    'combine' {
        if ($Arguments.Count -lt 2) {
            Write-ColorOutput "Error: Combine requires output file and at least one input file" -Color Red
            Show-Usage
            exit 1
        }
        
        $outputFile = $Arguments[0]
        $inputFiles = $Arguments[1..($Arguments.Count - 1)]
        
        # Expand wildcards
        $expandedFiles = @()
        foreach ($pattern in $inputFiles) {
            if ($pattern -match '[\*\?]') {
                $expandedFiles += Get-ChildItem -Path $pattern -File | Select-Object -ExpandProperty FullName
            } else {
                $expandedFiles += $pattern
            }
        }
        
        $result = Combine-FormCSV -OutputFile $outputFile -InputFiles $expandedFiles
        if (-not $result) {
            exit 1
        }
    }
    
    'help' {
        Show-Usage
    }
    
    default {
        Write-ColorOutput "Error: Unknown command '$Command'" -Color Red
        Show-Usage
        exit 1
    }
}