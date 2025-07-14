import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FormTemplate, FormInstance, FormField, FormSection } from "../types/form";
import { storageManager } from "../utils/storage";
import {
  getVisibleSections,
  getVisibleFields,
  calculateProgress,
  validateField,
  updateConditionalFieldsAsNull,
} from "../utils/formLogic";
import * as Icons from "lucide-react";
import Tooltip from "./Tooltip";

// Type definitions for form values
type FormValue = string | number | boolean | string[] | File | null | undefined;
type FormData = Record<string, FormValue>;

// Type for grouped fields
interface GroupedField {
  fields: FormField[];
  firstFieldIndex: number;
}

// Type for section completeness
interface SectionCompleteness {
  status: 'complete' | 'incomplete' | 'partial';
  progress: number;
}

// Extended field type with original index for rendering
interface FormFieldWithIndex extends FormField {
  originalIndex: number;
}

// Type for render elements
interface RenderElement {
  type: 'field' | 'group';
  originalIndex: number;
  content: FormFieldWithIndex | FormField[];
  groupKey?: string;
}

interface FormRendererProps {
  template: FormTemplate;
  instance?: FormInstance;
  onSave?: (instance: FormInstance) => void;
  onSubmit?: (instance: FormInstance) => void;
  onExit?: () => void;
}

// Utility function to render individual checkbox/radio fields as table when horizontal layout
const renderFieldAsTable = (
  field: FormField,
  value: FormValue,
  error: string | undefined,
  handleFieldChange: (fieldId: string, value: FormValue) => void,
  sectionId?: string
): JSX.Element => {
  const tooltipContent = sectionId ? `id: ${sectionId}.${field.id}` : `id: ${field.id}`;
  if (!field.options || field.layout !== 'horizontal') {
    throw new Error('renderFieldAsTable should only be used for horizontal checkbox/radio fields with options');
  }

  const optionCount = field.options.length;
  const availableWidth = 65; // 100% - 35% for question column
  const columnWidth = `${availableWidth / optionCount}%`;

  return (
    <Tooltip key={field.id} content={tooltipContent} delay={500}>
      <div className="space-y-2">
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
          {/* Header row with options */}
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-2 pr-2 text-sm font-medium text-gray-700 border-r border-gray-200" style={{ width: '35%' }}>
                Question
              </th>
              {field.options.map((option: string) => (
                <th key={option} className="text-center py-2 px-1 text-xs font-medium text-gray-700 border-r border-gray-200 last:border-r-0" style={{ width: columnWidth }}>
                  <div className="leading-tight break-words hyphens-auto text-center px-1">
                    {option}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          {/* Body row with field name and input controls */}
          <tbody className="divide-y divide-gray-100">
            <tr className="hover:bg-gray-25">
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
              {field.options.map((option: string) => (
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
          </tbody>
        </table>
      </div>
    </div>
    </Tooltip>
  );
};

const FormRenderer: React.FC<FormRendererProps> = ({
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
    
    const defaultData: FormData = {};
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaultData[field.id] = field.defaultValue;
        }
      });
    });
    
    return defaultData;
  };

  const [formData, setFormData] = useState<FormData>(initializeFormData());
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<'continuous' | 'section'>(() => storageManager.getViewMode());
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

  // Refs for pagination scrolling
  const paginationContainerRef = useRef<HTMLDivElement>(null);
  const sectionButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Memoize currentInstance to prevent recreation on every render
  const currentInstance = useMemo(() => 
    instance || storageManager.getOrCreateInstance(template.id, template.name), 
    [instance, template.id, template.name]
  );

  const [visitedSections, setVisitedSections] = useState<Set<string>>(() => {
    // Load visited sections from form instance
    const savedVisitedSections = currentInstance.visitedSections || [];
    return new Set(savedVisitedSections);
  });

  const visibleSections = getVisibleSections(template.sections, formData);
  const progress = calculateProgress(template.sections, formData, Array.from(visitedSections));
  
  // Filter sections for section-by-section view (exclude empty sections)
  const filteredSections = visibleSections.filter(section => {
    const visibleFields = getVisibleFields(section.fields, formData);
    return visibleFields.length > 0;
  });

  const saveForm = useCallback(async () => {
    setSaveStatus("saving");
    try {
      // Apply conditional field nullification before saving
      const nullifiedFormData = updateConditionalFieldsAsNull(template.sections, formData);
      
      const updatedInstance: FormInstance = {
        ...currentInstance,
        data: nullifiedFormData,
        progress,
        visitedSections: Array.from(visitedSections),
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
  }, [formData, progress, visitedSections, onSave, template.sections, currentInstance]);

  // Auto-save functionality - debounced
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    
    const timer = setTimeout(() => {
      setSaveStatus("saving");
      try {
        const nullifiedFormData = updateConditionalFieldsAsNull(template.sections, formData);
        
        const updatedInstance: FormInstance = {
          ...currentInstance,
          data: nullifiedFormData,
          progress,
          visitedSections: Array.from(visitedSections),
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
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, progress, visitedSections, template.sections, currentInstance, onSave]);

  // Sticky header functionality
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const threshold = 100; // Start sticky behavior after 100px scroll
      setIsHeaderSticky(scrollTop > threshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset section index when switching to section view
  useEffect(() => {
    if (viewMode === 'section') {
      setCurrentSectionIndex(0);
    }
  }, [viewMode]);

  // Save view mode to localStorage when it changes
  useEffect(() => {
    storageManager.saveViewMode(viewMode);
  }, [viewMode]);

  // Handle reactive section filtering - adjust current section index when sections change
  useEffect(() => {
    if (viewMode === 'section' && filteredSections.length > 0) {
      // If current section index is out of bounds, adjust it
      if (currentSectionIndex >= filteredSections.length) {
        setCurrentSectionIndex(Math.max(0, filteredSections.length - 1));
      }
    }
  }, [filteredSections.length, currentSectionIndex, viewMode]);

  // Track visited sections
  useEffect(() => {
    if (viewMode === 'section' && filteredSections.length > 0) {
      const currentSection = filteredSections[currentSectionIndex];
      if (currentSection) {
        setVisitedSections(prev => {
          if (prev.has(currentSection.id)) {
            return prev; // Return same instance if already visited to prevent re-render
          }
          return new Set([...prev, currentSection.id]);
        });
      }
    }
  }, [currentSectionIndex, viewMode, filteredSections]);

  // Save visited sections to form instance when they change (debounced)
  useEffect(() => {
    if (visitedSections.size === 0) return;
    
    const timer = setTimeout(() => {
      const updatedInstance: FormInstance = {
        ...currentInstance,
        visitedSections: Array.from(visitedSections),
        updatedAt: new Date(),
      };
      
      storageManager.saveInstance(updatedInstance);
    }, 500);

    return () => clearTimeout(timer);
  }, [visitedSections, currentInstance]);

  // Determine which sections are accessible based on sequential navigation
  const getSectionAccessibility = useCallback((sectionIndex: number) => {
    // First section is always accessible
    if (sectionIndex === 0) {
      return { accessible: true, reason: '' };
    }
    
    // Check if all previous sections have been visited
    for (let i = 0; i < sectionIndex; i++) {
      const previousSection = filteredSections[i];
      if (previousSection && !visitedSections.has(previousSection.id)) {
        return { 
          accessible: false, 
          reason: `Complete section ${i + 1} first` 
        };
      }
    }
    
    return { accessible: true, reason: '' };
  }, [filteredSections, visitedSections]);

  // Keyboard navigation for section view
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (viewMode === 'section') {
        if (e.key === 'ArrowLeft' && currentSectionIndex > 0) {
          setCurrentSectionIndex(currentSectionIndex - 1);
        } else if (e.key === 'ArrowRight' && currentSectionIndex < filteredSections.length - 1) {
          const nextSectionIndex = currentSectionIndex + 1;
          const nextSectionAccessibility = getSectionAccessibility(nextSectionIndex);
          if (nextSectionAccessibility.accessible) {
            setCurrentSectionIndex(nextSectionIndex);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [viewMode, currentSectionIndex, filteredSections.length, visitedSections, getSectionAccessibility]);

  // Auto-scroll active section into view in the pagination container only
  useEffect(() => {
    if (viewMode === 'section' && filteredSections.length > 0) {
      const currentSection = filteredSections[currentSectionIndex];
      if (currentSection) {
        const buttonRef = sectionButtonRefs.current[currentSection.id];
        const containerRef = paginationContainerRef.current;
        
        if (buttonRef && containerRef) {
          // Use a small delay to ensure DOM is updated
          setTimeout(() => {
            // Get button position relative to its offset parent (the scrollable container)
            const buttonOffsetLeft = buttonRef.offsetLeft;
            const buttonWidth = buttonRef.offsetWidth;
            const containerWidth = containerRef.clientWidth;
            const containerScrollLeft = containerRef.scrollLeft;
            
            // Check if button is fully visible
            const buttonLeftEdge = buttonOffsetLeft;
            const buttonRightEdge = buttonOffsetLeft + buttonWidth;
            const visibleLeft = containerScrollLeft;
            const visibleRight = containerScrollLeft + containerWidth;
            
            const isFullyVisible = 
              buttonLeftEdge >= visibleLeft && 
              buttonRightEdge <= visibleRight;
            
            if (!isFullyVisible) {
              // Center the button in the container
              const targetScrollLeft = buttonOffsetLeft - (containerWidth / 2) + (buttonWidth / 2);
              
              containerRef.scrollTo({
                left: Math.max(0, targetScrollLeft),
                behavior: 'smooth'
              });
            }
          }, 50); // Small delay to ensure DOM measurements are accurate
        }
      }
    }
  }, [currentSectionIndex, filteredSections, viewMode]);

  // Calculate section completeness for visual indicators
  // Only considers required AND visible/enabled fields
  // Includes fields with default values as complete
  const getSectionCompleteness = (section: FormSection): SectionCompleteness => {
    const visibleFields = getVisibleFields(section.fields, formData);
    const requiredVisibleFields = visibleFields.filter(field => field.required);
    
    // If no required fields are visible, section is considered complete
    if (requiredVisibleFields.length === 0) {
      return { status: 'complete', progress: 100 };
    }
    
    const completedRequiredFields = requiredVisibleFields.filter(field => {
      const value = formData[field.id];
      const defaultValue = field.defaultValue;
      
      // Check if field has a value (either from user input or default value)
      const hasValue = (() => {
        if (value !== undefined && value !== null && value !== '') {
          // User has provided a value
          if (Array.isArray(value)) {
            return value.length > 0;
          }
          return true;
        }
        
        // Check if field has a default value
        if (defaultValue !== undefined && defaultValue !== null && defaultValue !== '') {
          if (Array.isArray(defaultValue)) {
            return defaultValue.length > 0;
          }
          return true;
        }
        
        return false;
      })();
      
      return hasValue;
    });
    
    const progress = Math.round((completedRequiredFields.length / requiredVisibleFields.length) * 100);
    
    if (progress === 100) {
      return { status: 'complete', progress };
    } else if (progress > 0) {
      return { status: 'partial', progress };
    } else {
      return { status: 'incomplete', progress };
    }
  };

  const handleFieldChange = (fieldId: string, value: FormValue) => {
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
      visitedSections: Array.from(visitedSections),
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

  const groupFields = (fields: FormField[]) => {
    const grouped: { [key: string]: GroupedField } = {};
    const ungrouped: FormFieldWithIndex[] = [];

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

  const renderGroupedFields = (groupKey: string, fields: FormField[], sectionId?: string) => {
    if (fields.length === 0) return null;

    // Helper function to get group label
    const getGroupLabel = (groupKey: string, fields: FormField[]) => {
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
          <Tooltip content={`group: ${groupKey}`} delay={500}>
            <h4 className="text-sm font-semibold text-gray-800 mb-2">
              {getGroupLabel(groupKey, fields)}
            </h4>
          </Tooltip>
          
          {/* Table layout for matrix-style grouped fields */}
          <div className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              {/* Header row with options */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 pr-2 text-sm font-medium text-gray-700 border-r border-gray-200" style={{ width: '35%' }}>
                    Question
                  </th>
                  {firstField.options?.map((option: string) => {
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
                  
                  const fieldTooltipContent = sectionId ? `id: ${sectionId}.${field.id}` : `id: ${field.id}`;
                  return (
                    <tr key={field.id} className="hover:bg-gray-25">
                      {/* Field name/label column */}
                      <td className="py-2 pr-2 text-sm text-gray-900 align-top border-r border-gray-200">
                        <Tooltip content={fieldTooltipContent} delay={500}>
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
                        </Tooltip>
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
          <Tooltip content={`group: ${groupKey}`} delay={500}>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {getGroupLabel(groupKey, fields)}
            </h4>
          </Tooltip>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => {
              const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;
              const error = errors[field.id];
              const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`;

              const tooltipContent = sectionId ? `id: ${sectionId}.${field.id}` : `id: ${field.id}`;
              return (
                <Tooltip key={field.id} content={tooltipContent} delay={500}>
                  <div className="space-y-2">
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
                </Tooltip>
              );
            })}
          </div>
        </div>
      );
    } else {
      // Render fields individually but within a group container
      return (
        <div key={groupKey} className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <Tooltip content={`group: ${groupKey}`} delay={500}>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {getGroupLabel(groupKey, fields)}
            </h4>
          </Tooltip>
          <div className="space-y-4">
            {fields.map(field => renderField(field, sectionId))}
          </div>
        </div>
      );
    }
  };

  const renderField = (field: FormField | FormFieldWithIndex, sectionId?: string) => {
    const value = formData[field.id] !== undefined ? formData[field.id] : field.defaultValue;
    const error = errors[field.id];
    const tooltipContent = sectionId ? `id: ${sectionId}.${field.id}` : `id: ${field.id}`;

    const baseInputClasses = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      error ? "border-red-500" : "border-gray-300"
    }`;

    switch (field.type) {
      case "text":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
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
          </Tooltip>
        );

      case "email":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
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
          </Tooltip>
        );

      case "tel":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
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
          </Tooltip>
        );

      case "textarea":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className="space-y-2">
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
          </Tooltip>
        );

      case "select":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className="space-y-2">
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
          </Tooltip>
        );

      case "radio":
        // Use table rendering for horizontal layout
        if (field.layout === 'horizontal' && field.options) {
          return renderFieldAsTable(field, value, error, handleFieldChange, sectionId);
        }
        
        // Use vertical layout (original implementation)
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="space-y-2">
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
          </Tooltip>
        );

      case "checkbox":
        // Use table rendering for horizontal layout
        if (field.layout === 'horizontal' && field.options) {
          return renderFieldAsTable(field, value, error, handleFieldChange, sectionId);
        }
        
        // Use vertical layout (original implementation)
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              <div className="space-y-2">
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
          </Tooltip>
        );

      case "number":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
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
          </Tooltip>
        );

      case "date":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className={field.layout === 'horizontal' ? "flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0" : "space-y-2"}>
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
          </Tooltip>
        );

      case "file":
        return (
          <Tooltip key={field.id} content={tooltipContent} delay={500}>
            <div className="space-y-2">
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
          </Tooltip>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className={`flex justify-between items-center mb-6 transition-all duration-300 ${
          isHeaderSticky
            ? 'fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200 px-6 py-4 mx-auto max-w-4xl'
            : ''
        }`}>
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
            <button
              onClick={() => setViewMode(viewMode === 'continuous' ? 'section' : 'continuous')}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title={viewMode === 'continuous' ? 'Switch to section view' : 'Switch to continuous view'}
            >
              {viewMode === 'continuous' ? (
                <Icons.List className="w-4 h-4" />
              ) : (
                <Icons.ScrollText className="w-4 h-4" />
              )}
              <span className="text-sm">{viewMode === 'continuous' ? 'Sections' : 'Continuous'}</span>
            </button>
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

        {/* Spacer to prevent content jump when header becomes sticky */}
        {isHeaderSticky && <div className="h-20"></div>}

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="space-y-8">
          {viewMode === 'continuous' ? (
            visibleSections.map((section) => {
            const visibleFields = getVisibleFields(section.fields, formData);
            
            // Don't render the section if it has no visible fields
            if (visibleFields.length === 0) {
              return null;
            }
            
            const { grouped, ungrouped } = groupFields(visibleFields);

            // Create a combined array of all elements (fields and groups) with their original positions
            const allElements: RenderElement[] = [];

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
                <Tooltip content={`id: ${section.id}`} delay={500}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                </Tooltip>
                <div className="space-y-6">
                  {allElements.map((element) => {
                    if (element.type === 'field') {
                      return renderField(element.content as FormFieldWithIndex, section.id);
                    } else {
                      return renderGroupedFields(element.groupKey!, element.content as FormField[], section.id);
                    }
                  })}
                </div>
              </div>
            );
          })
          ) : (
            // Section-by-section view
            (() => {
              const currentSection = filteredSections[currentSectionIndex];
              if (!currentSection) {
                return (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No sections available</p>
                  </div>
                );
              }

              const visibleFields = getVisibleFields(currentSection.fields, formData);
              
              const { grouped, ungrouped } = groupFields(visibleFields);

              // Create a combined array of all elements (fields and groups) with their original positions
              const allElements: RenderElement[] = [];

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
                <div key={currentSection.id} className="border rounded-lg p-6">
                  <Tooltip content={`id: ${currentSection.id}`} delay={500}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {currentSection.title}
                    </h2>
                  </Tooltip>
                  <div className="space-y-6">
                    {allElements.map((element) => {
                      if (element.type === 'field') {
                        return renderField(element.content as FormFieldWithIndex, currentSection.id);
                      } else {
                        return renderGroupedFields(element.groupKey!, element.content as FormField[], currentSection.id);
                      }
                    })}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Navigation controls for section-by-section view */}
        {viewMode === 'section' && filteredSections.length === 0 && (
          <div className="mt-6 text-center py-8">
            <p className="text-gray-500">No sections available with current form data</p>
          </div>
        )}
        {viewMode === 'section' && filteredSections.length > 0 && (
          <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
            {/* Section Navigator Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <Icons.Navigation className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Section Navigator</span>
              </div>
              <span className="text-sm text-gray-600">
                {currentSectionIndex + 1} of {filteredSections.length}
              </span>
            </div>
            
            {/* Progress Indicators */}
            <div ref={paginationContainerRef} className="mb-4 overflow-x-auto scrollbar-thin">
              <div className="flex justify-center items-center space-x-2 min-w-max px-4">
                {filteredSections.map((section, index) => {
                const completeness = getSectionCompleteness(section);
                const isVisited = visitedSections.has(section.id);
                const isCurrent = index === currentSectionIndex;
                const accessibility = getSectionAccessibility(index);
                const isAccessible = accessibility.accessible;
                
                let markerColor = 'bg-gray-300';
                let borderColor = 'border-gray-300';
                let statusIcon = null;
                let buttonClasses = 'w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center';
                
                if (!isAccessible) {
                  // Inaccessible sections - locked state
                  markerColor = 'bg-gray-200';
                  borderColor = 'border-gray-400';
                  statusIcon = <Icons.Lock className="w-2 h-2 text-gray-500" />;
                  buttonClasses += ' cursor-not-allowed opacity-50';
                } else if (isCurrent) {
                  markerColor = 'bg-blue-600';
                  borderColor = 'border-blue-600';
                  statusIcon = <Icons.Circle className="w-2 h-2 text-white" />;
                  buttonClasses += ' hover:scale-110';
                } else if (isVisited) {
                  buttonClasses += ' hover:scale-110';
                  switch (completeness.status) {
                    case 'complete':
                      markerColor = 'bg-green-500';
                      borderColor = 'border-green-500';
                      statusIcon = <Icons.Check className="w-2 h-2 text-white" />;
                      break;
                    case 'partial':
                      markerColor = 'bg-yellow-500';
                      borderColor = 'border-yellow-500';
                      statusIcon = <Icons.Minus className="w-2 h-2 text-white" />;
                      break;
                    case 'incomplete':
                      markerColor = 'bg-red-500';
                      borderColor = 'border-red-500';
                      statusIcon = <Icons.X className="w-2 h-2 text-white" />;
                      break;
                  }
                } else {
                  // Accessible but not visited
                  buttonClasses += ' hover:scale-110';
                }
                
                return (
                  <div key={section.id} className="flex flex-col items-center space-y-1">
                    <button
                      ref={(el) => { sectionButtonRefs.current[section.id] = el; }}
                      onClick={() => {
                        if (isAccessible) {
                          setCurrentSectionIndex(index);
                        }
                      }}
                      disabled={!isAccessible}
                      className={`${buttonClasses} ${markerColor} ${borderColor}`}
                      title={!isAccessible ? accessibility.reason : `${section.title} - ${isVisited ? `${completeness.progress}% complete` : 'Not visited'}`}
                    >
                      {statusIcon}
                    </button>
                    <span className="text-xs text-gray-500">{index + 1}</span>
                  </div>
                );
              })}
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))}
                disabled={currentSectionIndex === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border"
              >
                <Icons.ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">
                  {filteredSections[currentSectionIndex]?.title}
                </div>
                <div className="text-xs text-gray-500">
                  {(() => {
                    const currentSection = filteredSections[currentSectionIndex];
                    const completeness = getSectionCompleteness(currentSection);
                    return `${completeness.progress}% complete`;
                  })()}
                </div>
              </div>
              
              <button
                onClick={() => {
                  const nextIndex = currentSectionIndex + 1;
                  if (nextIndex < filteredSections.length && getSectionAccessibility(nextIndex).accessible) {
                    setCurrentSectionIndex(nextIndex);
                  }
                }}
                disabled={(() => {
                  const nextIndex = currentSectionIndex + 1;
                  if (nextIndex >= filteredSections.length) return true;
                  return !getSectionAccessibility(nextIndex).accessible;
                })()}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed border"
                title={(() => {
                  const nextIndex = currentSectionIndex + 1;
                  if (nextIndex >= filteredSections.length) return "Last section";
                  const accessibility = getSectionAccessibility(nextIndex);
                  return accessibility.accessible ? "Go to next section" : accessibility.reason;
                })()}
              >
                <span>Next</span>
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap justify-center gap-4 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-gray-600">Current</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Complete</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600">Partial</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600">Incomplete</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <span className="text-gray-600">Not visited</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 border border-gray-400 rounded-full opacity-50"></div>
                  <span className="text-gray-600">Locked</span>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default FormRenderer;
