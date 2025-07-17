/**
 * Import Modal Component
 * Allows users to import form templates or instances from share strings
 */

import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useToast } from "../contexts/ToastContext";
import { FormTemplate, FormInstance } from "../types/form";
import { ProgrammaticTemplate } from "../programmatic/types";
import { decodeFromSharing, DataSharingError, ShareDataError } from "../utils/dataSharing";
import { storageManager } from "../utils/storage";
import { TDLConverter } from "../programmatic/tdl/converter";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (type: 'template' | 'instance', data: FormTemplate | FormInstance) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [shareString, setShareString] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();

  const handleImport = async () => {
    if (!shareString.trim()) {
      setError("Please enter a share string");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      // Decode the share string
      const decodedData = await decodeFromSharing(shareString.trim());
      
      // DEBUG: Log decoded data structure
      console.log('🐛 DEBUG: Decoded data structure:', JSON.stringify(decodedData, null, 2));

      // Determine the type of data and process accordingly
      if (isFormTemplate(decodedData)) {
        // Handle form template import
        const templateId = `imported-${Date.now()}`;
        const template: FormTemplate = {
          ...decodedData,
          id: templateId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        storageManager.saveTemplate(template);
        showSuccess("Template imported successfully!", "Template has been added to your dashboard");
        onImportSuccess('template', template);
        
      } else if (isProgrammaticTemplate(decodedData)) {
        // Convert programmatic template to form template
        const converter = new TDLConverter();
        const conversionResult = converter.convertToGUI(decodedData);
        
        if (!conversionResult.success) {
          throw new Error(`Template conversion failed: ${conversionResult.errors.map(e => e.message).join(', ')}`);
        }

        const formTemplate = conversionResult.result as FormTemplate;
        const templateId = `imported-${Date.now()}`;
        const template: FormTemplate = {
          ...formTemplate,
          id: templateId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        storageManager.saveTemplate(template);
        
        // Show warnings if any
        if (conversionResult.warnings.length > 0) {
          console.warn('Template conversion warnings:', conversionResult.warnings);
          showSuccess("Programmatic template imported with warnings!", "Template has been converted and added to your dashboard");
        } else {
          showSuccess("Programmatic template imported successfully!", "Template has been converted and added to your dashboard");
        }
        
        onImportSuccess('template', template);
        
      } else if (isFormInstance(decodedData)) {
        // Handle form instance import
        console.log('🐛 DEBUG: Form instance detected. Type guard checks:');
        console.log('  - Has templateId:', 'templateId' in decodedData);
        console.log('  - Has data:', 'data' in decodedData);
        console.log('  - Has progress:', 'progress' in decodedData);
        console.log('  - Data object:', decodedData.data);
        console.log('  - Data keys:', Object.keys(decodedData.data || {}));
        console.log('  - Data values:', Object.values(decodedData.data || {}));
        
        const instanceId = `imported-${Date.now()}`;
        const instance: FormInstance = {
          ...decodedData,
          id: instanceId,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        console.log('🐛 DEBUG: Created instance:', JSON.stringify(instance, null, 2));
        
        storageManager.saveInstance(instance);
        showSuccess("Form instance imported successfully!", "Form instance has been added to your dashboard");
        onImportSuccess('instance', instance);
        
      } else {
        throw new Error("Unknown data type in share string");
      }

      // Reset and close modal
      setShareString("");
      onClose();
      
    } catch (error) {
      console.error("Import error:", error);
      
      if (error instanceof DataSharingError) {
        switch (error.type) {
          case ShareDataError.INVALID_FORMAT:
            setError("Invalid share string format. Please check your share string and try again.");
            break;
          case ShareDataError.CHECKSUM_MISMATCH:
            setError("Share string appears to be corrupted. Please verify the complete string.");
            break;
          case ShareDataError.UNSUPPORTED_VERSION:
            setError("This share string was created with a newer version and cannot be imported.");
            break;
          case ShareDataError.SCHEMA_VALIDATION_FAILED:
            setError("The shared data is invalid or corrupted. Please check the source.");
            break;
          case ShareDataError.DECOMPRESSION_FAILED:
            setError("Failed to decompress the share string. It may be incomplete or corrupted.");
            break;
          default:
            setError(`Import failed: ${error.message}`);
        }
      } else {
        setError(`Import failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      showError("Import failed", "Please check your share string and try again");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setShareString("");
    setError("");
    onClose();
  };

  const handleShareStringChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setShareString(e.target.value);
    if (error) {
      setError("");
    }
  };

  // Type guard functions
  const isFormTemplate = (data: any): data is FormTemplate => {
    return data && typeof data === 'object' && 
           'sections' in data && 
           'createdAt' in data && 
           !('metadata' in data);
  };

  const isProgrammaticTemplate = (data: any): data is ProgrammaticTemplate => {
    return data && typeof data === 'object' && 
           'metadata' in data && 
           'sections' in data && 
           'schema' in data;
  };

  const isFormInstance = (data: any): data is FormInstance => {
    return data && typeof data === 'object' && 
           'templateId' in data && 
           'data' in data && 
           'progress' in data;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Icons.Download size={20} />
            Import Form or Template
          </h2>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Share String
            </label>
            <textarea
              value={shareString}
              onChange={handleShareStringChange}
              className={`w-full h-32 px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Paste your form template or instance share string here..."
              disabled={isProcessing}
            />
            <p className="text-xs text-gray-500 mt-1">
              Share strings start with "fm:" and contain compressed form data
            </p>
          </div>

          {error && (
            <div className="text-red-500 text-sm flex items-center gap-1">
              <Icons.AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <Icons.Info size={16} className="text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">What can be imported:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Form templates (blank forms)</li>
                  <li>Programmatic templates (converted automatically)</li>
                  <li>Form instances (filled forms)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!shareString.trim() || isProcessing}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Icons.Loader2 size={16} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Icons.Download size={16} />
                Import
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;