import React, { useState, useEffect, useCallback } from "react";
import { FormTemplate, FormInstance } from "../types/form";
import { storageManager } from "../utils/storage";
import {
  getVisibleSections,
  getVisibleFields,
  calculateProgress,
  validateField,
  updateConditionalFieldsAsNull,
} from "../utils/formLogic";
import * as Icons from "lucide-react";

interface FormRendererProps {
  template: FormTemplate;
  instance?: FormInstance;
  onSave?: (instance: FormInstance) => void;
  onSubmit?: (instance: FormInstance) => void;
  onExit?: () => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  template,
  instance,
  onSave,
  onSubmit,
  onExit,
}) => {
  // Initialize form data with default values if no instance data exists
  const initializeFormData = () => {
    if (instance?.data && Object.keys(instance.data).length > 0) {
      return instance.data;
    }
    
    const defaultData: Record<string, any> = {};
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultData[field.id] = field.defaultValue;
        }
      });
    });
    
    return defaultData;
  };

  const [formData, setFormData] = useState<Record<string, any>>(initializeFormData());
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const currentInstance: FormInstance =
    instance || storageManager.getOrCreateInstance(template.id, template.name);

  const visibleSections = getVisibleSections(template.sections, formData);
  const progress = calculateProgress(template.sections, formData);

  const saveForm = useCallback(async () => {
    setSaveStatus("saving");
    try {
      // Apply conditional field nullification before saving
      const nullifiedFormData = updateConditionalFieldsAsNull(template.sections, formData);
      
      const updatedInstance: FormInstance = {
        ...currentInstance,
        data: nullifiedFormData,
        progress,
        updatedAt: new Date(),
      };

      storageManager.saveInstance(updatedInstance);
      onSave?.(updatedInstance);
      setSaveStatus("saved");
      setHasUnsavedChanges(false);

      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }
  }, [formData, progress, currentInstance, onSave, template.sections]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        saveForm();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, saveForm]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [fieldId]: value,
      };
      // Apply conditional field nullification when form data changes
      return updateConditionalFieldsAsNull(template.sections, updated);
    });
    setHasUnsavedChanges(true);

    // Clear error when field is updated
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Validate all visible fields
    const newErrors: Record<string, string> = {};

    visibleSections.forEach((section) => {
      const visibleFields = getVisibleFields(section.fields, formData);
      visibleFields.forEach((field) => {
        const error = validateField(field, formData[field.id]);
        if (error) {
          newErrors[field.id] = error;
        }
      });
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Apply conditional field nullification before submission
    const nullifiedFormData = updateConditionalFieldsAsNull(template.sections, formData);
    
    const submissionInstance: FormInstance = {
      ...currentInstance,
      data: nullifiedFormData,
      progress: 100,
      completed: true,
      updatedAt: new Date(),
    };

    // Save the completed instance (this overwrites the draft)
    storageManager.saveInstance(submissionInstance);

    // Create submission record
    const submission = {
      id: crypto.randomUUID(),
      formInstanceId: submissionInstance.id,
      templateId: template.id,
      templateName: template.name,
      data: nullifiedFormData,
      submittedAt: new Date(),
    };

    storageManager.saveSubmission(submission);
    onSubmit?.(submissionInstance);
  };

  const handleExit = async () => {
    if (hasUnsavedChanges && saveStatus !== "saved") {
      const shouldSave = window.confirm(
        "You have unsaved changes. Would you like to save them before exiting?"
      );
      
      if (shouldSave) {
        await saveForm();
        onExit?.();
      } else {
        const shouldDiscard = window.confirm(
          "Are you sure you want to discard your changes and exit?"
        );
        if (shouldDiscard) {
          onExit?.();
        }
      }
    } else {
      onExit?.();
    }
  };

  const groupFields = (fields: any[]) => {
    const grouped: { [key: string]: { fields: any[], firstFieldIndex: number } } = {};
    const ungrouped: any[] = [];

    fields.forEach((field, index) => {
      if (field.grouping?.enabled && field.grouping?.groupKey) {
        const groupKey = field.grouping.groupKey;
        if (!grouped[groupKey]) {
          grouped[groupKey] = { fields: [], firstFieldIndex: index };
        }
        grouped[groupKey].fields.push(field);
      } else {
        ungrouped.push({ ...field, originalIndex: index });
      }
    });

    return { grouped, ungrouped };
  };

  const renderGroupedFields = (groupKey: string, fields: any[]) => {
    if (fields.length === 0) return null;

    // Helper function to get group label
    const getGroupLabel = (groupKey: string, fields: any[]) => {
      const firstField = fields[0];
      // Use custom label if provided, otherwise transform groupKey
      return firstField?.grouping?.label || groupKey.charAt(0).toUpperCase() + groupKey.slice(1).replace(/_/g, ' ');
    };

    // Check if all fields in group have the same options for horizontal grouping
    const firstField = fields[0];
    const allHaveSameOptions = fields.every(field => 
      field.options && firstField.options &&
      JSON.stringify(field.options) === JSON.stringify(firstField.options) &&
      field.layout === 'horizontal'
    );

    // Check if all fields are text/input types with horizontal layout
    const allHorizontalTextFields = fields.every(field => 
      ['text', 'email', 'tel', 'number', 'date'].includes(field.type) &&
      field.layout === 'horizontal'
    );

    if (allHaveSameOptions && (firstField.type === 'radio' || firstField.type === 'checkbox')) {
      // Render as a table/matrix with field names on left axis and options on top axis
      return (
        <div key={groupKey} className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">
            {getGroupLabel(groupKey, fields)}
          </h4>
          
          {/* Table layout for matrix-style grouped fields */}
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              {/* Header row with options */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 pr-2 text-sm font-medium text-gray-700 border-r border-gray-200" style={{ width: '35%' }}>
                    Question
                  </th>
                  {firstField.options?.map((option: string, index: number) => {
                    const optionCount = firstField.options!.length;
                    const availableWidth = 65; // 100% - 35% for question column
                    const columnWidth = `${availableWidth / optionCount}%`;
                    return (
                    <th key={option} className="text-center py-2 px-1 text-xs font-medium text-gray-700 border-r border-gray-200 last:border-r-0" style={{ width: columnWidth }}>
                      <div className="leading-tight break-words hyphens-auto text-center px-1">
                        {option}
                      </div>
                    </th>
                    );
                  })}
                </tr>
              </thead>
              
              {/* Body rows with field names and input controls */}
              <tbody className="divide-y divide-gray-100">
                {fields.map(field => {
                  const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;
                  const error = errors[field.id];
                  
                  return (
                    <tr key={field.id} className="hover:bg-gray-25">
                      {/* Field name/label column */}
                      <td className="py-2 pr-2 text-sm text-gray-900 align-top border-r border-gray-200">
                        <div className="flex flex-col">
                          <div className="flex items-start">
                            <span className="leading-tight break-words hyphens-auto">
                              {field.label}
                            </span>
                            {field.required && <span className="text-red-500 ml-1 flex-shrink-0">*</span>}
                          </div>
                          {error && (
                            <div className="text-red-500 text-xs mt-1">{error}</div>
                          )}
                        </div>
                      </td>
                      
                      {/* Option columns with input controls */}
                      {firstField.options?.map((option: string) => (
                        <td key={option} className="py-2 px-1 text-center align-middle border-r border-gray-200 last:border-r-0">
                          <div className="flex justify-center items-center h-8">
                            <input
                              type={field.type}
                              name={field.type === 'radio' ? field.id : undefined}
                              value={option}
                              checked={field.type === 'radio' 
                                ? value === option 
                                : Array.isArray(value) && value.includes(option)
                              }
                              onChange={(e) => {
                                if (field.type === 'radio') {
                                  handleFieldChange(field.id, e.target.value);
                                } else {
                                  const currentValues = Array.isArray(value) ? value : [];
                                  if (e.target.checked) {
                                    handleFieldChange(field.id, [...currentValues, option]);
                                  } else {
                                    handleFieldChange(field.id, currentValues.filter((v) => v !== option));
                                  }
                                }
                              }}
                              className="text-blue-600 focus:ring-blue-500 focus:ring-offset-0 h-4 w-4"
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (allHorizontalTextFields) {
      // Render text fields in horizontal layout
      return (
        <div key={groupKey} className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {getGroupLabel(groupKey, fields)}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => {
              const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;
              const error = errors[field.id];
              const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`;

              return (
                <div key={field.id} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.id}
                    value={value || ""}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label}`}
                    min={field.type === 'number' ? field.validation?.min : undefined}
                    max={field.type === 'number' ? field.validation?.max : undefined}
                    className={baseInputClasses}
                  />
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      // Render fields individually but within a group container
      return (
        <div key={groupKey} className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {getGroupLabel(groupKey, fields)}
          </h4>
          <div className="space-y-4">
            {fields.map(renderField)}
          </div>
        </div>
      );
    }
  };

  const renderField = (field: any) => {
    const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;
    const error = errors[field.id];

    const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? "border-red-500" : "border-gray-300"
    }`;

    switch (field.type) {
      case "text":
        return (
          <div key={field.id} className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
            <label className={field.layout === 'horizontal' ? "block text-sm font-medium text-gray-700 sm:w-1/3 sm:flex-shrink-0" : "block text-sm font-medium text-gray-700"}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={field.layout === 'horizontal' ? "flex-1" : ""}>
              <input
                type="text"
                name={field.id}
                value={value || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label}`}
                className={baseInputClasses}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        );

      case "email":
        return (
          <div key={field.id} className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
            <label className={field.layout === 'horizontal' ? "block text-sm font-medium text-gray-700 sm:w-1/3 sm:flex-shrink-0" : "block text-sm font-medium text-gray-700"}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={field.layout === 'horizontal' ? "flex-1" : ""}>
              <input
                type="email"
                name={field.id}
                value={value || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label}`}
                className={baseInputClasses}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        );

      case "tel":
        return (
          <div key={field.id} className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
            <label className={field.layout === 'horizontal' ? "block text-sm font-medium text-gray-700 sm:w-1/3 sm:flex-shrink-0" : "block text-sm font-medium text-gray-700"}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={field.layout === 'horizontal' ? "flex-1" : ""}>
              <input
                type="tel"
                name={field.id}
                value={value || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder || `Enter ${field.label}`}
                className={baseInputClasses}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name={field.id}
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label}`}
              rows={4}
              className={baseInputClasses}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              name={field.id}
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={baseInputClasses}
            >
              <option value="">Select an option</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={field.layout === 'horizontal' ? "flex flex-wrap gap-4" : "space-y-2"}>
              {field.options?.map((option: string) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) =>
                      handleFieldChange(field.id, e.target.value)
                    }
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={field.layout === 'horizontal' ? "flex flex-wrap gap-4" : "space-y-2"}>
              {field.options?.map((option: string) => (
                <label
                  key={option}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name={field.id}
                    value={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleFieldChange(field.id, [...currentValues, option]);
                      } else {
                        handleFieldChange(
                          field.id,
                          currentValues.filter((v) => v !== option)
                        );
                      }
                    }}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case "number":
        return (
          <div key={field.id} className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
            <label className={field.layout === 'horizontal' ? "block text-sm font-medium text-gray-700 sm:w-1/3 sm:flex-shrink-0" : "block text-sm font-medium text-gray-700"}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={field.layout === 'horizontal' ? "flex-1" : ""}>
              <input
                type="number"
                value={value || ""}
                onChange={(e) =>
                  handleFieldChange(
                    field.id,
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                placeholder={field.placeholder || `Enter ${field.label}`}
                min={field.validation?.min}
                max={field.validation?.max}
                className={baseInputClasses}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        );

      case "date":
        return (
          <div key={field.id} className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
            <label className={field.layout === 'horizontal' ? "block text-sm font-medium text-gray-700 sm:w-1/3 sm:flex-shrink-0" : "block text-sm font-medium text-gray-700"}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={field.layout === 'horizontal' ? "flex-1" : ""}>
              <input
                type="date"
                name={field.id}
                value={value || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                className={baseInputClasses}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
          </div>
        );

      case "file":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    handleFieldChange(field.id, {
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      data: e.target?.result,
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className={baseInputClasses}
            />
            {value && (
              <div className="text-sm text-gray-600">
                Selected: {value.name} ({Math.round(value.size / 1024)}KB)
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {saveStatus === "saving" && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Icons.Save className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              {saveStatus === "saved" && (
                <div className="flex items-center space-x-2 text-green-600">
                  <Icons.CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Saved</span>
                </div>
              )}
              {saveStatus === "error" && (
                <div className="flex items-center space-x-2 text-red-600">
                  <Icons.AlertCircle className="w-4 h-4" />
                  <span className="text-sm">Error saving</span>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">Progress: {progress}%</div>
            {onExit && (
              <button
                onClick={handleExit}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
                <span>Exit</span>
              </button>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-8">
          {visibleSections.map((section) => {
            const visibleFields = getVisibleFields(section.fields, formData);
            
            // Don't render the section if it has no visible fields
            if (visibleFields.length === 0) {
              return null;
            }
            
            const { grouped, ungrouped } = groupFields(visibleFields);

            // Create a combined array of all elements (fields and groups) with their original positions
            const allElements: Array<{
              type: 'field' | 'group';
              originalIndex: number;
              content: any;
              groupKey?: string;
            }> = [];

            // Add ungrouped fields
            ungrouped.forEach(field => {
              allElements.push({
                type: 'field',
                originalIndex: field.originalIndex,
                content: field
              });
            });

            // Add grouped fields (represented by their first field's position)
            Object.entries(grouped).forEach(([groupKey, groupData]) => {
              allElements.push({
                type: 'group',
                originalIndex: groupData.firstFieldIndex,
                content: groupData.fields,
                groupKey
              });
            });

            // Sort by original index to maintain template creation order
            allElements.sort((a, b) => a.originalIndex - b.originalIndex);

            return (
              <div key={section.id} className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {allElements.map((element, index) => {
                    if (element.type === 'field') {
                      return renderField(element.content);
                    } else {
                      return renderGroupedFields(element.groupKey!, element.content);
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={saveForm}
            disabled={saveStatus === "saving"}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={progress < 100}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Submit Form
          </button>
        </div>
      </div>
    </div>
  );
};
