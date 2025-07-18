import React, { useState } from 'react';
import { FormTemplate, FormFieldValue, FormInstance } from '../../types/form';
import { MockDataGenerator, MockDataConfig } from '../../utils/mockDataGenerator';
import { storageManager } from '../../utils/storage';
import { validateCSVIntegrity, CSVIntegrityResult } from '../../utils/csvIntegrityChecker';
import { encodeForSharing, decodeFromSharing } from '../../utils/dataSharing';
import * as Icons from 'lucide-react';

interface FormDevToolProps {
  template: FormTemplate;
  formData: Record<string, FormFieldValue>;
  onDataUpdate: (data: Record<string, FormFieldValue>) => void;
  onShowResults: (results: CSVIntegrityResult) => void;
}

export const FormDevTool: React.FC<FormDevToolProps> = ({
  template,
  formData,
  onDataUpdate,
  onShowResults
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastGeneratedData, setLastGeneratedData] = useState<Record<string, FormFieldValue> | null>(null);
  const [exportImportValidated, setExportImportValidated] = useState(false);

  const handleFillMockData = async () => {
    setIsProcessing(true);
    try {
      const mockConfig: MockDataConfig = {
        fillPercentage: 90,
        useRealisticData: true,
        seed: Date.now() // Use current timestamp as seed for varied data
      };
      
      const generator = new MockDataGenerator(mockConfig);
      const mockData = generator.generateMockFormData(template, formData);
      
      setLastGeneratedData(mockData);
      onDataUpdate(mockData);
    } catch (error) {
      console.error('Error generating mock data:', error);
      alert('Failed to generate mock data. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportAndValidate = async () => {
    if (!lastGeneratedData) {
      alert('Please generate mock data first before running integrity checks.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create a temporary submission to test CSV export
      const tempSubmission = {
        id: `temp-${Date.now()}`,
        formInstanceId: `temp-instance-${Date.now()}`,
        templateId: template.id,
        templateName: template.name,
        data: lastGeneratedData,
        submittedAt: new Date().toISOString()
      };

      // Store temporary submission
      const existingSubmissions = storageManager.getSubmissions();
      localStorage.setItem('form_submissions', JSON.stringify([...existingSubmissions, tempSubmission]));
      
      // Export to CSV with preserveOriginalData flag to maintain data integrity for validation
      // This prevents updateConditionalFieldsAsNull from overwriting "Not Applicable" values
      // with null for sections that were marked as N/A by the user
      const csvData = storageManager.exportToCSV(template.id, true);
      
      // Remove temporary submission
      localStorage.setItem('form_submissions', JSON.stringify(existingSubmissions));
      
      if (!csvData) {
        throw new Error('CSV export failed - no data generated');
      }

      // Validate CSV integrity
      const integrityResults = validateCSVIntegrity(
        template,
        lastGeneratedData,
        csvData
      );

      // Show results
      onShowResults(integrityResults);
      
      // Also download the CSV for manual inspection
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `form-dev-tool-export-${template.name}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error during export and validation:', error);
      alert(`Export and validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTestExportImport = async () => {
    if (!lastGeneratedData) {
      alert('Please generate mock data first before testing export/import.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create a temporary form instance with the mock data
      const tempInstance: FormInstance = {
        id: `temp-${Date.now()}`,
        templateId: template.id,
        templateName: template.name,
        data: lastGeneratedData,
        progress: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
        visitedSections: template.sections.map(s => s.id),
        naSections: []
      };

      // Encode the form instance
      const encodedString = await encodeForSharing(tempInstance);
      console.log('Encoded string length:', encodedString.length);

      // Decode it back
      const decodedData = await decodeFromSharing(encodedString) as FormInstance;

      // Compare the data
      const originalDataStr = JSON.stringify(tempInstance.data, null, 2);
      const decodedDataStr = JSON.stringify(decodedData.data, null, 2);
      
      const isIdentical = originalDataStr === decodedDataStr;
      
      if (isIdentical) {
        setExportImportValidated(true);
        alert('✅ Export/Import validation successful! The form data survived the encoding/decoding process intact.');
      } else {
        // Find differences
        const differences: string[] = [];
        for (const key in tempInstance.data) {
          if (JSON.stringify(tempInstance.data[key]) !== JSON.stringify(decodedData.data[key])) {
            differences.push(`Field "${key}": Original=${JSON.stringify(tempInstance.data[key])}, Decoded=${JSON.stringify(decodedData.data[key])}`);
          }
        }
        
        alert(`❌ Export/Import validation failed! Found ${differences.length} differences:\n\n${differences.slice(0, 5).join('\n')}\n${differences.length > 5 ? `\n... and ${differences.length - 5} more differences` : ''}`);
      }

      // Also log to console for debugging
      console.log('Export/Import Test Results:', {
        success: isIdentical,
        originalDataSize: originalDataStr.length,
        decodedDataSize: decodedDataStr.length,
        encodedStringSize: encodedString.length,
        compressionRatio: (encodedString.length / originalDataStr.length).toFixed(2)
      });

    } catch (error) {
      console.error('Error during export/import test:', error);
      alert(`Export/Import test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 mb-2">
        Form Development & Testing Tools
      </div>
      
      <button
        onClick={handleFillMockData}
        disabled={isProcessing}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-md border border-gray-200 disabled:opacity-50"
      >
        <Icons.Database size={16} />
        {isProcessing ? 'Generating...' : 'Fill with Mock Data'}
      </button>

      <button
        onClick={handleExportAndValidate}
        disabled={isProcessing || !lastGeneratedData}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-md border border-gray-200 disabled:opacity-50"
      >
        <Icons.CheckCircle size={16} />
        {isProcessing ? 'Processing...' : 'Export & Validate CSV'}
      </button>

      <button
        onClick={handleTestExportImport}
        disabled={isProcessing || !lastGeneratedData}
        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2 rounded-md border border-gray-200 disabled:opacity-50"
      >
        <Icons.Share2 size={16} />
        {isProcessing ? 'Testing...' : 'Test Form Export/Import'}
      </button>

      {lastGeneratedData && (
        <div className="text-xs text-gray-500 mt-2">
          ✓ Mock data generated. Ready for validation tests.
          {exportImportValidated && (
            <div className="text-green-600 mt-1">
              ✓ Export/Import validation passed
            </div>
          )}
        </div>
      )}
    </div>
  );
};