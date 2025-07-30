import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { parseCSV, validateCSV } from '../utils/csvProcessing';

interface CSVEditorProps {
  isOpen: boolean;
  onClose: () => void;
  csvContent: string;
  fileName: string;
  onSave: (newContent: string) => void;
}

export const CSVEditor: React.FC<CSVEditorProps> = ({
  isOpen,
  onClose,
  csvContent,
  fileName,
  onSave
}) => {
  const [editedContent, setEditedContent] = useState('');
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [schema, setSchema] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<'table' | 'raw'>('table');
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateCSV> | null>(null);

  useEffect(() => {
    if (csvContent) {
      setEditedContent(csvContent);
      try {
        const parsed = parseCSV(csvContent);
        setHeaders(parsed.headers);
        setSchema(parsed.schema);
        setRows(parsed.data);
        setValidationResult(validateCSV(csvContent));
      } catch (error) {
        console.error('Failed to parse CSV:', error);
        setEditMode('raw');
      }
    }
  }, [csvContent]);

  const handleCellEdit = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...rows];
    newRows[rowIndex][colIndex] = value;
    setRows(newRows);
    updateContentFromTable();
  };

  const updateContentFromTable = () => {
    const formatRow = (row: string[]): string => {
      return row.map(field => {
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
          return `"${field.replace(/"/g, '""')}"`;
        }
        return field;
      }).join(',');
    };

    const lines = [
      formatRow(headers),
      formatRow(schema),
      ...rows.map(row => formatRow(row))
    ];

    const newContent = lines.join('\n');
    setEditedContent(newContent);
    setValidationResult(validateCSV(newContent));
  };

  const handleRawEdit = (content: string) => {
    setEditedContent(content);
    try {
      const parsed = parseCSV(content);
      setHeaders(parsed.headers);
      setSchema(parsed.schema);
      setRows(parsed.data);
      setValidationResult(validateCSV(content));
    } catch (error) {
      // Keep raw mode if parsing fails
      setValidationResult({
        isValid: false,
        errors: ['Failed to parse CSV format'],
        warnings: [],
        columnCount: 0,
        rowCount: 0
      });
    }
  };

  const handleSave = () => {
    onSave(editedContent);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit CSV: {fileName}</h2>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setEditMode('table')}
                className={`text-sm px-3 py-1 rounded ${
                  editMode === 'table' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Table View
              </button>
              <button
                onClick={() => setEditMode('raw')}
                className={`text-sm px-3 py-1 rounded ${
                  editMode === 'raw' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Raw Text
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Status */}
        {validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0) && (
          <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-100">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                {validationResult.errors.length > 0 && (
                  <p className="text-red-600">{validationResult.errors.length} validation errors</p>
                )}
                {validationResult.warnings.length > 0 && (
                  <p className="text-yellow-600">{validationResult.warnings.length} warnings</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {editMode === 'table' ? (
            <div className="overflow-auto h-full p-6">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-700">
                      Row
                    </th>
                    {headers.map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-300 px-4 py-2 bg-gray-100 text-left text-sm font-medium text-gray-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border border-gray-300 px-4 py-2 text-sm text-gray-600">
                        {rowIndex + 3}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td key={colIndex} className="border border-gray-300 p-0">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => handleCellEdit(rowIndex, colIndex, e.target.value)}
                            onBlur={updateContentFromTable}
                            className="w-full px-4 py-2 text-sm border-0 focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <textarea
              value={editedContent}
              onChange={(e) => handleRawEdit(e.target.value)}
              className="w-full h-full p-6 font-mono text-sm resize-none focus:outline-none"
              spellCheck={false}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};