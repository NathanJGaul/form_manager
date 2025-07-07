import React, { useState, useEffect, useCallback } from "react";
import { FormTemplate, FormInstance } from "../types/form";
import { storageManager } from "../utils/storage";
import {
  getVisibleSections,
  getVisibleFields,
  calculateProgress,
  validateField,
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
      const updatedInstance: FormInstance = {
        ...currentInstance,
        data: formData,
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
  }, [formData, progress, currentInstance, onSave]);

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
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
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

    const submissionInstance: FormInstance = {
      ...currentInstance,
      data: formData,
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
      data: formData,
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
    const grouped: { [key: string]: any[] } = {};
    const ungrouped: any[] = [];

    fields.forEach(field => {
      if (field.grouping?.enabled && field.grouping?.groupKey) {
        const groupKey = field.grouping.groupKey;
        if (!grouped[groupKey]) {
          grouped[groupKey] = [];
        }
        grouped[groupKey].push(field);
      } else {
        ungrouped.push(field);
      }
    });

    return { grouped, ungrouped };
  };

  const renderGroupedFields = (groupKey: string, fields: any[]) => {
    if (fields.length === 0) return null;

    // Check if all fields in group have the same options for horizontal grouping
    const firstField = fields[0];
    const allHaveSameOptions = fields.every(field => 
      field.options && firstField.options &&
      JSON.stringify(field.options) === JSON.stringify(firstField.options) &&
      field.layout === 'horizontal'
    );

    if (allHaveSameOptions && (firstField.type === 'radio' || firstField.type === 'checkbox')) {
      // Render as horizontal grouped fields with shared options
      return (
        <div key={groupKey} className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {groupKey.charAt(0).toUpperCase() + groupKey.slice(1)} Options
          </h4>
          <div className="flex flex-wrap gap-6">
            {firstField.options?.map((option: string) => (
              <div key={option} className="flex flex-col space-y-2">
                <span className="text-sm font-medium text-gray-600">{option}</span>
                <div className="flex flex-col space-y-1">
                  {fields.map(field => {
                    const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;
                    const error = errors[field.id];
                    
                    return (
                      <label key={field.id} className="flex items-center space-x-2 cursor-pointer text-sm">
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
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{field.label}</span>
                        {field.required && <span className="text-red-500">*</span>}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          {fields.some(field => errors[field.id]) && (
            <div className="text-red-500 text-sm space-y-1">
              {fields.map(field => errors[field.id] && (
                <p key={field.id}>{field.label}: {errors[field.id]}</p>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      // Render fields individually but within a group container
      return (
        <div key={groupKey} className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}
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
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label}`}
              className={baseInputClasses}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case "email":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="email"
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label}`}
              className={baseInputClasses}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case "tel":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="tel"
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={field.placeholder || `Enter ${field.label}`}
              className={baseInputClasses}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
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
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        );

      case "date":
        return (
          <div key={field.id} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="date"
              value={value || ""}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={baseInputClasses}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
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
            const { grouped, ungrouped } = groupFields(visibleFields);

            return (
              <div key={section.id} className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {/* Render ungrouped fields */}
                  {ungrouped.map(renderField)}
                  
                  {/* Render grouped fields */}
                  {Object.entries(grouped).map(([groupKey, fields]) =>
                    renderGroupedFields(groupKey, fields)
                  )}
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
