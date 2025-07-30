import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, Merge, CheckCircle, AlertCircle, FileText, Trash2, Edit } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { validateCSV, combineCSVs, parseCSV, CSVValidationResult } from '../utils/csvProcessing';
import { CSVEditor } from '../components/CSVEditor';

interface CSVFile {
  id: string;
  name: string;
  content: string;
  headers: string[];
  schema: string[];
  rowCount: number;
  validation: CSVValidationResult;
}

interface CSVManagerRouteProps {
  onNavigateToDashboard: () => void;
}

export const CSVManagerRoute: React.FC<CSVManagerRouteProps> = ({ onNavigateToDashboard }) => {
  const [csvFiles, setCSVFiles] = useState<CSVFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingFile, setEditingFile] = useState<CSVFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newFiles: CSVFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const content = await file.text();
        const parsed = parseCSV(content);
        const validation = validateCSV(content);
        
        newFiles.push({
          id: `${Date.now()}-${i}`,
          name: file.name,
          content,
          headers: parsed.headers,
          schema: parsed.schema,
          rowCount: parsed.data.length,
          validation
        });
      } catch (error) {
        showError(`Failed to process ${file.name}`, error instanceof Error ? error.message : 'Unknown error');
      }
    }

    setCSVFiles(prev => [...prev, ...newFiles]);
    setIsProcessing(false);
    
    if (newFiles.length > 0) {
      showSuccess('Files uploaded', `Successfully loaded ${newFiles.length} CSV file(s)`);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === csvFiles.length) {
      // If all are selected, deselect all
      setSelectedFiles(new Set());
    } else {
      // Select all files
      setSelectedFiles(new Set(csvFiles.map(f => f.id)));
    }
  };

  const handleCombineFiles = () => {
    const filesToCombine = csvFiles.filter(f => selectedFiles.has(f.id));
    
    if (filesToCombine.length < 2) {
      showError('Select multiple files', 'Please select at least 2 files to combine');
      return;
    }

    try {
      const combined = combineCSVs(
        filesToCombine.map(f => f.content),
        filesToCombine.map(f => f.name)
      );
      const parsed = parseCSV(combined);
      const validation = validateCSV(combined);
      
      const newFile: CSVFile = {
        id: `combined-${Date.now()}`,
        name: `combined_${new Date().toISOString().slice(0, 10)}.csv`,
        content: combined,
        headers: parsed.headers,
        schema: parsed.schema,
        rowCount: parsed.data.length,
        validation
      };

      setCSVFiles(prev => [...prev, newFile]);
      setSelectedFiles(new Set());
      showSuccess('Files combined', `Created ${newFile.name} with ${newFile.rowCount} rows`);
    } catch (error) {
      showError('Combination failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleDownloadFile = (file: CSVFile) => {
    const blob = new Blob([file.content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Download started', `Downloading ${file.name}`);
  };

  const handleDeleteFile = (fileId: string) => {
    setCSVFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
    showSuccess('File removed', 'CSV file has been removed');
  };

  const handleEditFile = (file: CSVFile) => {
    setEditingFile(file);
  };

  const handleSaveEdit = (newContent: string) => {
    if (!editingFile) return;

    try {
      const parsed = parseCSV(newContent);
      const validation = validateCSV(newContent);
      
      setCSVFiles(prev => prev.map(f => 
        f.id === editingFile.id 
          ? {
              ...f,
              content: newContent,
              headers: parsed.headers,
              schema: parsed.schema,
              rowCount: parsed.data.length,
              validation
            }
          : f
      ));
      
      showSuccess('File updated', `${editingFile.name} has been updated successfully`);
    } catch (error) {
      showError('Update failed', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getValidationIcon = (validation: CSVValidationResult) => {
    if (validation.errors.length > 0) {
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
    if (validation.warnings.length > 0) {
      return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getValidationSummary = (validation: CSVValidationResult) => {
    if (validation.errors.length > 0) {
      return `${validation.errors.length} error${validation.errors.length > 1 ? 's' : ''}`;
    }
    if (validation.warnings.length > 0) {
      return `${validation.warnings.length} warning${validation.warnings.length > 1 ? 's' : ''}`;
    }
    return 'Valid';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={onNavigateToDashboard}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">CSV Manager</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Upload CSV Files</h2>
          <div className="flex items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload CSV Files
            </button>
            <button
              onClick={handleCombineFiles}
              disabled={selectedFiles.size < 2}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Merge className="w-4 h-4 mr-2" />
              Combine Selected ({selectedFiles.size})
            </button>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">CSV Files</h2>
            {csvFiles.length > 0 && (
              <label className="flex items-center text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFiles.size === csvFiles.length && csvFiles.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 mr-2"
                />
                Select All
              </label>
            )}
          </div>
          
          {csvFiles.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No CSV files uploaded yet</p>
              <p className="text-sm mt-1">Upload CSV files to validate, combine, and manage them</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {csvFiles.map(file => (
                <div key={file.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.has(file.id)}
                        onChange={() => handleSelectFile(file.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{file.name}</span>
                          {getValidationIcon(file.validation)}
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          {file.rowCount} rows • {file.headers.length} columns • {getValidationSummary(file.validation)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditFile(file)}
                        className="p-2 text-gray-600 hover:text-green-600"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="p-2 text-gray-600 hover:text-blue-600"
                        title="Download"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 text-gray-600 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Validation Details */}
                  {(file.validation.errors.length > 0 || file.validation.warnings.length > 0) && (
                    <div className="mt-3 ml-7">
                      {file.validation.errors.slice(0, 3).map((error, i) => (
                        <div key={i} className="text-sm text-red-600 flex items-start">
                          <span className="mr-1">•</span>
                          <span>{error}</span>
                        </div>
                      ))}
                      {file.validation.warnings.slice(0, 3).map((warning, i) => (
                        <div key={i} className="text-sm text-yellow-600 flex items-start">
                          <span className="mr-1">•</span>
                          <span>{warning}</span>
                        </div>
                      ))}
                      {(file.validation.errors.length > 3 || file.validation.warnings.length > 3) && (
                        <div className="text-sm text-gray-500 mt-1">
                          And {Math.max(0, file.validation.errors.length - 3) + Math.max(0, file.validation.warnings.length - 3)} more...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSV Editor Modal */}
      {editingFile && (
        <CSVEditor
          isOpen={!!editingFile}
          onClose={() => setEditingFile(null)}
          csvContent={editingFile.content}
          fileName={editingFile.name}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default CSVManagerRoute;