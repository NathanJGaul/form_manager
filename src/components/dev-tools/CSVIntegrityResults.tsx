import React from 'react';
import { CSVIntegrityResult } from '../../utils/csvIntegrityChecker';
import * as Icons from 'lucide-react';

interface CSVIntegrityResultsProps {
  results: CSVIntegrityResult;
  onClose: () => void;
}

export const CSVIntegrityResults: React.FC<CSVIntegrityResultsProps> = ({ 
  results, 
  onClose 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Icons.CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 70) return <Icons.AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <Icons.XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">CSV Export Integrity Report</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          {/* Overall Status */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              {getScoreIcon(results.summary.overallScore)}
              <h3 className="text-lg font-semibold">
                Overall Status: {results.isValid ? 'PASSED' : 'FAILED'}
              </h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(results.summary.overallScore)}`}>
                  {results.summary.overallScore}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(results.summary.completenessScore)}`}>
                  {Math.round(results.summary.completenessScore)}%
                </div>
                <div className="text-sm text-gray-600">Completeness</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(results.summary.accuracyScore)}`}>
                  {Math.round(results.summary.accuracyScore)}%
                </div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(results.summary.integrityScore)}`}>
                  {Math.round(results.summary.integrityScore)}%
                </div>
                <div className="text-sm text-gray-600">Integrity</div>
              </div>
            </div>
          </div>

          {/* Completeness Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Icons.List size={20} />
              Field Completeness
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-sm text-gray-600">Expected Fields:</span>
                  <span className="ml-2 font-semibold">{results.completeness.expectedFieldCount}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Present Fields:</span>
                  <span className="ml-2 font-semibold">{results.completeness.presentFieldCount}</span>
                </div>
              </div>
              
              {results.completeness.missingFields.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-red-600 mb-1">
                    Missing Fields ({results.completeness.missingFields.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {results.completeness.missingFields.map(field => (
                      <span key={field} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {results.completeness.extraFields.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-yellow-600 mb-1">
                    Extra Fields ({results.completeness.extraFields.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {results.completeness.extraFields.map(field => (
                      <span key={field} className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Accuracy Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Icons.Target size={20} />
              Data Accuracy
            </h4>
            
            {/* Data Type Errors */}
            {results.accuracy.dataTypeErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-3">
                <div className="text-sm font-medium text-red-800 mb-2">
                  Data Type Errors ({results.accuracy.dataTypeErrors.length}):
                </div>
                <div className="space-y-1">
                  {results.accuracy.dataTypeErrors.map((error, index) => (
                    <div key={index} className="text-sm text-red-700">
                      <span className="font-medium">{error.field}:</span> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraint Violations */}
            {results.accuracy.constraintViolations.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                <div className="text-sm font-medium text-yellow-800 mb-2">
                  Constraint Violations ({results.accuracy.constraintViolations.length}):
                </div>
                <div className="space-y-1">
                  {results.accuracy.constraintViolations.map((error, index) => (
                    <div key={index} className="text-sm text-yellow-700">
                      <span className="font-medium">{error.field}:</span> {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Value Discrepancies */}
            {results.accuracy.valueDiscrepancies.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                <div className="text-sm font-medium text-orange-800 mb-2">
                  Value Discrepancies ({results.accuracy.valueDiscrepancies.length}):
                </div>
                <div className="space-y-1">
                  {results.accuracy.valueDiscrepancies.map((error, index) => (
                    <div key={index} className="text-sm text-orange-700">
                      <span className="font-medium">{error.field}:</span> {error.error}
                      {error.expected && error.actual && (
                        <div className="ml-4 text-xs">
                          Expected: <code className="bg-white px-1 rounded">{error.expected}</code>, 
                          Got: <code className="bg-white px-1 rounded">{error.actual}</code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.accuracy.dataTypeErrors.length === 0 && 
             results.accuracy.constraintViolations.length === 0 && 
             results.accuracy.valueDiscrepancies.length === 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-green-800 flex items-center gap-2">
                  <Icons.CheckCircle size={16} />
                  No accuracy issues found
                </div>
              </div>
            )}
          </div>

          {/* Integrity Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Icons.Shield size={20} />
              Data Integrity
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-sm text-gray-600">Total Records:</span>
                  <span className="ml-2 font-semibold">{results.integrity.totalRecords}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Valid Records:</span>
                  <span className="ml-2 font-semibold">{results.integrity.validRecords}</span>
                </div>
              </div>
              
              {results.integrity.corruptedRecords.length > 0 && (
                <div className="mb-3">
                  <div className="text-sm font-medium text-red-600 mb-1">
                    Integrity Issues ({results.integrity.corruptedRecords.length}):
                  </div>
                  <div className="space-y-1">
                    {results.integrity.corruptedRecords.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        <span className="font-medium">{error.field}:</span> {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                {results.integrity.nullFieldsHandled ? (
                  <Icons.CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Icons.XCircle className="w-4 h-4 text-red-600" />
                )}
                <span className="text-gray-600">
                  Conditional fields properly handled: {results.integrity.nullFieldsHandled ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              CSV export integrity verification completed
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};