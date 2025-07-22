import React, { useState, useEffect } from 'react';
import { FormField, DataTableValue, DataTableRow, DataTableColumn } from '../../types/form';
import * as Icons from 'lucide-react';
import Tooltip from '../Tooltip';

interface DataTableFieldProps {
  field: FormField;
  value: DataTableValue | undefined;
  onChange: (value: DataTableValue) => void;
  error?: string;
  disabled?: boolean;
}

// Initialize empty row based on column definitions
const createEmptyRow = (columns: DataTableColumn[]): DataTableRow => {
  const row: DataTableRow = {};
  columns.forEach(col => {
    switch (col.type) {
      case 'checkbox':
        row[col.id] = [];
        break;
      case 'number':
        row[col.id] = '';
        break;
      default:
        row[col.id] = '';
    }
  });
  return row;
};

// Validate cell value based on column validation rules
const validateCellValue = (value: string | number | boolean | string[], column: DataTableColumn): string | null => {
  if (column.required && !value) {
    return 'Required';
  }
  
  if (column.validation) {
    const { min, max, minLength, maxLength, pattern } = column.validation;
    
    if (column.type === 'number') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        if (min !== undefined && numValue < min) return `Min: ${min}`;
        if (max !== undefined && numValue > max) return `Max: ${max}`;
      }
    }
    
    if (typeof value === 'string') {
      if (minLength && value.length < minLength) return `Min length: ${minLength}`;
      if (maxLength && value.length > maxLength) return `Max length: ${maxLength}`;
      if (pattern && !new RegExp(pattern).test(value)) return 'Invalid format';
    }
  }
  
  return null;
};

const DataTableField: React.FC<DataTableFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false
}) => {
  // Initialize value if not provided
  const [tableValue, setTableValue] = useState<DataTableValue>(() => {
    if (value && value.columns && value.rows) {
      return value;
    }
    
    // Use default value if provided
    if (field.defaultValue && typeof field.defaultValue === 'object' && 'columns' in field.defaultValue) {
      return field.defaultValue as DataTableValue;
    }
    
    // Initialize with column definitions and one empty row
    const columns = field.columns || [];
    return {
      columns,
      rows: [createEmptyRow(columns)]
    };
  });

  const [cellErrors, setCellErrors] = useState<Record<string, string>>({});

  // Update parent when table value changes
  useEffect(() => {
    onChange(tableValue);
  }, [tableValue, onChange]);

  // Handle cell value change
  const handleCellChange = (rowIndex: number, columnId: string, newValue: string | number | boolean | string[]) => {
    const newRows = [...tableValue.rows];
    newRows[rowIndex] = {
      ...newRows[rowIndex],
      [columnId]: newValue
    };
    
    setTableValue({
      ...tableValue,
      rows: newRows
    });

    // Validate the cell
    const column = tableValue.columns.find(col => col.id === columnId);
    if (column) {
      const error = validateCellValue(newValue, column);
      const errorKey = `${rowIndex}-${columnId}`;
      setCellErrors(prev => {
        if (error) {
          return { ...prev, [errorKey]: error };
        } else {
          const { [errorKey]: removed, ...rest } = prev;
          return rest;
        }
      });
    }
  };

  // Add new row
  const addRow = () => {
    const maxRows = field.maxRows || field.validation?.maxRows;
    if (!maxRows || tableValue.rows.length < maxRows) {
      setTableValue({
        ...tableValue,
        rows: [...tableValue.rows, createEmptyRow(tableValue.columns)]
      });
    }
  };

  // Remove row
  const removeRow = (index: number) => {
    const minRows = field.minRows || field.validation?.minRows || 1;
    if (tableValue.rows.length > minRows) {
      const newRows = tableValue.rows.filter((_, i) => i !== index);
      setTableValue({
        ...tableValue,
        rows: newRows
      });
      
      // Clean up errors for removed row
      const newCellErrors = { ...cellErrors };
      Object.keys(newCellErrors).forEach(key => {
        if (key.startsWith(`${index}-`)) {
          delete newCellErrors[key];
        }
      });
      setCellErrors(newCellErrors);
    }
  };

  // Render cell based on column type
  const renderCell = (column: DataTableColumn, rowIndex: number) => {
    const cellValue = tableValue.rows[rowIndex][column.id];
    const errorKey = `${rowIndex}-${column.id}`;
    const cellError = cellErrors[errorKey];
    const columnHeaderId = `${field.id}-header-${column.id}`;
    const inputId = `${field.id}-${rowIndex}-${column.id}`;
    
    const baseInputClasses = `w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 ${
      cellError ? 'border-red-500' : 'border-gray-300'
    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`;

    switch (column.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
        return (
          <input
            id={inputId}
            aria-labelledby={columnHeaderId}
            type={column.type}
            value={cellValue as string || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            placeholder={column.placeholder}
            className={baseInputClasses}
            disabled={disabled}
          />
        );

      case 'number':
        return (
          <input
            id={inputId}
            aria-labelledby={columnHeaderId}
            type="number"
            value={cellValue as string || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            placeholder={column.placeholder}
            min={column.validation?.min}
            max={column.validation?.max}
            className={baseInputClasses}
            disabled={disabled}
          />
        );

      case 'textarea':
        return (
          <textarea
            id={inputId}
            aria-labelledby={columnHeaderId}
            value={cellValue as string || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            placeholder={column.placeholder}
            className={`${baseInputClasses} resize-none`}
            rows={2}
            disabled={disabled}
          />
        );

      case 'select':
        return (
          <select
            id={inputId}
            aria-labelledby={columnHeaderId}
            value={cellValue as string || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            className={baseInputClasses}
            disabled={disabled}
          >
            <option value="">Select...</option>
            {column.options?.map((option) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </select>
        );

      case 'checkbox': {
        const checkboxValues = Array.isArray(cellValue) ? cellValue : [];
        return (
          <div className="space-y-1" role="group" aria-labelledby={columnHeaderId}>
            {column.options?.map((option, optIndex) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              const checkboxId = `${inputId}-opt-${optIndex}`;
              return (
                <label key={optValue} htmlFor={checkboxId} className="flex items-center space-x-2">
                  <input
                    id={checkboxId}
                    type="checkbox"
                    checked={checkboxValues.includes(optValue)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkboxValues, optValue]
                        : checkboxValues.filter(v => v !== optValue);
                      handleCellChange(rowIndex, column.id, newValues);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <span className="text-sm">{optLabel}</span>
                </label>
              );
            })}
          </div>
        );
      }

      case 'radio':
        return (
          <div className="space-y-1" role="group" aria-labelledby={columnHeaderId}>
            {column.options?.map((option, optIndex) => {
              const optValue = typeof option === 'string' ? option : option.value;
              const optLabel = typeof option === 'string' ? option : option.label;
              const radioId = `${inputId}-opt-${optIndex}`;
              return (
                <label key={optValue} htmlFor={radioId} className="flex items-center space-x-2">
                  <input
                    id={radioId}
                    type="radio"
                    name={`${field.id}-${rowIndex}-${column.id}`}
                    checked={cellValue === optValue}
                    onChange={() => handleCellChange(rowIndex, column.id, optValue)}
                    className="border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={disabled}
                  />
                  <span className="text-sm">{optLabel}</span>
                </label>
              );
            })}
          </div>
        );

      case 'date':
        return (
          <input
            id={inputId}
            aria-labelledby={columnHeaderId}
            type="date"
            value={cellValue as string || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            className={baseInputClasses}
            disabled={disabled}
          />
        );

      default:
        return (
          <input
            id={inputId}
            aria-labelledby={columnHeaderId}
            type="text"
            value={cellValue as string || ''}
            onChange={(e) => handleCellChange(rowIndex, column.id, e.target.value)}
            placeholder={column.placeholder}
            className={baseInputClasses}
            disabled={disabled}
          />
        );
    }
  };

  const canAddRows = field.allowAddRows !== false && (!field.maxRows || tableValue.rows.length < field.maxRows);
  const canDeleteRows = field.allowDeleteRows !== false && tableValue.rows.length > (field.minRows || 1);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {canAddRows && !disabled && (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Icons.Plus className="h-4 w-4 mr-1" />
            Add Row
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {tableValue.columns.map((column) => {
                const columnHeaderId = `${field.id}-header-${column.id}`;
                return (
                  <th
                    key={column.id}
                    id={columnHeaderId}
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {column.label}
                    {column.required && <span className="text-red-500 ml-1">*</span>}
                  </th>
                );
              })}
              {canDeleteRows && !disabled && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableValue.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {tableValue.columns.map((column) => {
                  const errorKey = `${rowIndex}-${column.id}`;
                  const cellError = cellErrors[errorKey];
                  return (
                    <td key={column.id} className="px-3 py-2 whitespace-nowrap">
                      {cellError ? (
                        <Tooltip content={cellError} delay={100}>
                          <div className="relative">
                            {renderCell(column, rowIndex)}
                            <div className="absolute -top-1 -right-1">
                              <Icons.AlertCircle className="h-3 w-3 text-red-500" />
                            </div>
                          </div>
                        </Tooltip>
                      ) : (
                        renderCell(column, rowIndex)
                      )}
                    </td>
                  );
                })}
                {canDeleteRows && !disabled && (
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIndex)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Icons.Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {field.minRows && tableValue.rows.length < field.minRows && (
        <p className="text-yellow-600 text-sm">
          Minimum {field.minRows} row{field.minRows > 1 ? 's' : ''} required
        </p>
      )}
    </div>
  );
};

export default DataTableField;