import React, { useState, Suspense, lazy } from "react";
import { FormTemplate, FormSection, FormField } from "../types/form";
import { storageManager } from "../utils/storage";
import { exportTemplateToPdf, downloadPdf } from "../utils/pdfExport";
import { ErrorBoundary } from "./ErrorBoundary";
import { bundleAnalyzer } from "../utils/bundleAnalyzer";
import * as Icons from "lucide-react";

// Lazy load the ProgrammaticImportModal for better performance
const ProgrammaticImportModal = lazy(() => {
  bundleAnalyzer.trackLazyLoad('ProgrammaticImportModal');
  return import("./ProgrammaticImportModal").then(module => {
    bundleAnalyzer.trackLazyComplete('ProgrammaticImportModal');
    return { default: module.ProgrammaticImportModal };
  });
});

interface FormBuilderField extends FormField {
  optionsText?: string;
  defaultValueText?: string;
}

interface FormBuilderProps {
  template?: FormTemplate;
  onSave: (template: FormTemplate) => void;
  onCancel: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  template,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(template?.name || "");
  const [description, setDescription] = useState(template?.description || "");
  const [sections, setSections] = useState<FormSection[]>(
    template?.sections?.map((section) => ({
      ...section,
      fields: section.fields.map((field) => ({
        ...field,
        // Initialize text fields from existing options if they don't exist
        optionsText:
          (field as FormBuilderField).optionsText || field.options?.join("\n") || "",
        defaultValueText:
          (field as FormBuilderField).defaultValueText ||
          (Array.isArray(field.defaultValue)
            ? field.defaultValue.join("\n")
            : ""),
      })),
    })) || []
  );
  const [showImportModal, setShowImportModal] = useState(false);

  // Helper function to handle textarea key events properly
  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // For Enter key, just stop event bubbling but allow default behavior
    if (e.key === "Enter") {
      e.stopPropagation();
      // Don't prevent default - let the textarea handle the newline naturally
    }
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: crypto.randomUUID(),
      title: "New Section",
      fields: [],
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const updateSection = (sectionId: string, updates: Partial<FormSection>) => {
    setSections(
      sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s))
    );
  };

  const addField = (sectionId: string) => {
    const newField: FormBuilderField = {
      id: crypto.randomUUID(),
      type: "text",
      label: "New Field",
      required: false,
      optionsText: "",
      defaultValueText: "",
    };

    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, fields: [...s.fields, newField] } : s
      )
    );
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, fields: s.fields.filter((f) => f.id !== fieldId) }
          : s
      )
    );
  };

  const updateField = (
    sectionId: string,
    fieldId: string,
    updates: Partial<FormField>
  ) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              fields: s.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : s
      )
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert("Please enter a form name");
      return;
    }

    const formTemplate: FormTemplate = {
      id: template?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      sections,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    storageManager.saveTemplate(formTemplate);
    onSave(formTemplate);
  };

  const handleImportTemplate = (importedTemplate: FormTemplate) => {
    // Debug: Log imported template to check field properties
    // console.log('Importing template:', importedTemplate);
    // console.log('Sample field in FormBuilder:', importedTemplate.sections[1]?.fields[0]);

    setName(importedTemplate.name);
    setDescription(importedTemplate.description);
    setSections(importedTemplate.sections);
    setShowImportModal(false);
  };

  const handleExportToPdf = async () => {
    if (!name.trim()) {
      alert("Please enter a form name before exporting");
      return;
    }

    const formTemplate: FormTemplate = {
      id: template?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      sections,
      createdAt: template?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    try {
      const result = await exportTemplateToPdf(formTemplate);
      if (result.success && result.pdfBytes) {
        downloadPdf(result.pdfBytes, `${formTemplate.name}_form.pdf`);
      } else {
        alert(`Failed to export PDF: ${result.error}`);
      }
    } catch (error) {
      alert(
        `Error exporting PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const getAllFields = () => {
    return sections.flatMap((s) =>
      s.fields.map((f) => ({ sectionId: s.id, field: f }))
    );
  };

  const renderFieldEditor = (sectionId: string, field: FormField) => {
    const allFields = getAllFields();
    const availableFields = allFields.filter((f) => f.field.id !== field.id);

    return (
      <div key={field.id} className="bg-gray-50 p-4 rounded-lg border">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) =>
                    updateField(sectionId, field.id, { label: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={field.type}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      type: e.target.value as FormField['type'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text Input</option>
                  <option value="email">Email Input</option>
                  <option value="tel">Telephone Input</option>
                  <option value="textarea">Text Area</option>
                  <option value="select">Select Dropdown</option>
                  <option value="radio">Radio Buttons</option>
                  <option value="checkbox">Checkboxes</option>
                  <option value="number">Number Input</option>
                  <option value="date">Date Picker</option>
                  <option value="file">File Upload</option>
                </select>
              </div>
            </div>

            {field.type === "text" || field.type === "textarea" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={field.placeholder || ""}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      placeholder: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ) : null}

            {/* Default Value Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Value
              </label>
              {field.type === "checkbox" ? (
                <div>
                  <textarea
                    value={
                      (field as FormBuilderField).defaultValueText ||
                      (Array.isArray(field.defaultValue)
                        ? field.defaultValue.join("\n")
                        : "")
                    }
                    onChange={(e) => {
                      const text = e.target.value;
                      updateField(sectionId, field.id, {
                        defaultValueText: text,
                        defaultValue: text.split("\n").filter((v) => v.trim()),
                      });
                    }}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Type a default value and press Enter for next line:&#10;Option A&#10;Option C"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ resize: "vertical" }}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Press Enter to create new lines. Each non-empty line becomes
                    a default selection.
                  </p>
                </div>
              ) : field.type === "radio" || field.type === "select" ? (
                <select
                  value={field.defaultValue || ""}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      defaultValue: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No default value</option>
                  {field.options?.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "date" ? (
                <input
                  type="date"
                  value={field.defaultValue || ""}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      defaultValue: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : field.type === "number" ? (
                <input
                  type="number"
                  value={field.defaultValue || ""}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      defaultValue: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="Enter default number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <input
                  type="text"
                  value={field.defaultValue || ""}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      defaultValue: e.target.value || undefined,
                    })
                  }
                  placeholder="Enter default value"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {(field.type === "select" ||
              field.type === "radio" ||
              field.type === "checkbox") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Options (one per line)
                </label>
                <textarea
                  value={
                    (field as FormBuilderField).optionsText ||
                    field.options?.join("\n") ||
                    ""
                  }
                  onChange={(e) => {
                    const text = e.target.value;
                    updateField(sectionId, field.id, {
                      optionsText: text,
                      options: text.split("\n").filter((opt) => opt.trim()),
                    });
                  }}
                  onKeyDown={handleTextareaKeyDown}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type an option and press Enter for the next line:&#10;Option 1&#10;Option 2&#10;Option 3"
                  style={{ resize: "vertical" }}
                  autoComplete="off"
                  spellCheck="false"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Press Enter to create a new line. Each non-empty line becomes
                  an option.
                </p>
              </div>
            )}

            {(field.type === "radio" || field.type === "checkbox") && (
              <div className="space-y-4">
                {/* Layout Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Layout
                  </label>
                  <select
                    value={field.layout || "vertical"}
                    onChange={(e) =>
                      updateField(sectionId, field.id, {
                        layout: e.target.value as "vertical" | "horizontal",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                </div>

                {/* Grouping Control */}
                <div>
                  <label className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={field.grouping?.enabled || false}
                      onChange={(e) =>
                        updateField(sectionId, field.id, {
                          grouping: {
                            enabled: e.target.checked,
                            groupKey: field.grouping?.groupKey || "",
                          },
                        })
                      }
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Enable grouping
                    </span>
                  </label>
                  {field.grouping?.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Key
                      </label>
                      <input
                        type="text"
                        value={field.grouping?.groupKey || ""}
                        onChange={(e) =>
                          updateField(sectionId, field.id, {
                            grouping: {
                              enabled: true,
                              groupKey: e.target.value,
                            },
                          })
                        }
                        placeholder="e.g., preferences, ratings"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Fields with the same group key will be grouped together
                        if they have identical options and horizontal layout.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      required: e.target.checked,
                    })
                  }
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Required field</span>
              </label>
            </div>

            {availableFields.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Conditional Logic
                </h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Show this field when:
                    </label>
                    <select
                      value={field.conditional?.dependsOn || ""}
                      onChange={(e) => {
                        if (e.target.value) {
                          updateField(sectionId, field.id, {
                            conditional: {
                              dependsOn: e.target.value,
                              values: [],
                              operator: "equals",
                            },
                          });
                        } else {
                          updateField(sectionId, field.id, {
                            conditional: undefined,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Always show</option>
                      {availableFields.map((f) => (
                        <option key={f.field.id} value={f.field.id}>
                          {f.field.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {field.conditional && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <select
                        value={field.conditional.operator}
                        onChange={(e) =>
                          updateField(sectionId, field.id, {
                            conditional: {
                              dependsOn: field.conditional?.dependsOn || "",
                              values: field.conditional?.values || [],
                              operator: e.target.value as
                                | "equals"
                                | "contains"
                                | "not_equals",
                            },
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="equals">equals</option>
                        <option value="contains">contains</option>
                        <option value="not_equals">does not equal</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Value(s) - comma separated"
                        value={field.conditional.values.join(", ")}
                        onChange={(e) =>
                          updateField(sectionId, field.id, {
                            conditional: {
                              dependsOn: field.conditional?.dependsOn || "",
                              operator: field.conditional?.operator || "equals",
                              values: e.target.value
                                .split(",")
                                .map((v) => v.trim())
                                .filter((v) => v),
                            },
                          })
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => removeField(sectionId, field.id)}
            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <Icons.Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {template ? "Edit Form Template" : "Create New Form Template"}
            </h1>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
              >
                <Icons.Download className="w-4 h-4" />
                <span>Import Programmatic</span>
              </button>
              <button
                onClick={onCancel}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
              >
                <Icons.ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter form name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the form"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Form Sections
              </h2>
              <button
                onClick={addSection}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Icons.Plus className="w-4 h-4" />
                <span>Add Section</span>
              </button>
            </div>

            {sections.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sections yet. Click "Add Section" to get started.
              </div>
            ) : (
              <div className="space-y-6">
                {sections.map((section) => (
                  <ErrorBoundary
                    key={section.id}
                    fallback={({ error, resetError }) => (
                      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                        <div className="flex items-center space-x-2 text-red-600 mb-3">
                          <Icons.AlertTriangle className="w-5 h-5" />
                          <span className="font-medium">Section Error</span>
                        </div>
                        <p className="text-red-700 text-sm mb-4">
                          Failed to render section: {section.title || 'Untitled Section'}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={resetError}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Retry
                          </button>
                          <button
                            onClick={() => removeSection(section.id)}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                          >
                            Remove Section
                          </button>
                        </div>
                      </div>
                    )}
                  >
                    <div className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) =>
                            updateSection(section.id, { title: e.target.value })
                          }
                          className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                        />
                      </div>
                      <button
                        onClick={() => removeSection(section.id)}
                        className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Icons.Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Section Conditional Logic */}
                    {(() => {
                      const allFields = getAllFields();
                      const availableFields = allFields.filter(
                        (f) => f.sectionId !== section.id
                      );

                      return availableFields.length > 0 ? (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="text-sm font-medium text-blue-900 mb-3">
                            Section Conditional Logic
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-blue-800 mb-1">
                                Show this section when:
                              </label>
                              <select
                                value={section.conditional?.dependsOn || ""}
                                onChange={(e) => {
                                  if (e.target.value) {
                                    updateSection(section.id, {
                                      conditional: {
                                        dependsOn: e.target.value,
                                        values: [],
                                        operator: "equals",
                                      },
                                    });
                                  } else {
                                    updateSection(section.id, {
                                      conditional: undefined,
                                    });
                                  }
                                }}
                                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                              >
                                <option value="">Always show</option>
                                {availableFields.map((f) => (
                                  <option key={f.field.id} value={f.field.id}>
                                    {f.field.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {section.conditional && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <select
                                  value={section.conditional.operator}
                                  onChange={(e) =>
                                    updateSection(section.id, {
                                      conditional: {
                                        dependsOn:
                                          section.conditional?.dependsOn || "",
                                        values:
                                          section.conditional?.values || [],
                                        operator: e.target.value as
                                          | "equals"
                                          | "contains"
                                          | "not_equals",
                                      },
                                    })
                                  }
                                  className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                  <option value="equals">equals</option>
                                  <option value="contains">contains</option>
                                  <option value="not_equals">
                                    does not equal
                                  </option>
                                </select>

                                <input
                                  type="text"
                                  placeholder="Value(s) - comma separated"
                                  value={section.conditional.values.join(", ")}
                                  onChange={(e) =>
                                    updateSection(section.id, {
                                      conditional: {
                                        dependsOn:
                                          section.conditional?.dependsOn || "",
                                        operator:
                                          section.conditional?.operator ||
                                          "equals",
                                        values: e.target.value
                                          .split(",")
                                          .map((v) => v.trim())
                                          .filter((v) => v),
                                      },
                                    })
                                  }
                                  className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <div className="space-y-4">
                      {section.fields.map((field) => (
                        <ErrorBoundary
                          key={field.id}
                          fallback={({ error, resetError }) => (
                            <div className="border border-red-200 rounded p-4 bg-red-50">
                              <div className="flex items-center space-x-2 text-red-600 mb-2">
                                <Icons.AlertTriangle className="w-4 h-4" />
                                <span className="text-sm font-medium">Field Error</span>
                              </div>
                              <p className="text-red-700 text-sm mb-3">
                                Failed to render field: {field.label || field.id}
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={resetError}
                                  className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                >
                                  Retry
                                </button>
                                <button
                                  onClick={() => removeField(section.id, field.id)}
                                  className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
                                >
                                  Remove Field
                                </button>
                              </div>
                            </div>
                          )}
                        >
                          {renderFieldEditor(section.id, field)}
                        </ErrorBoundary>
                      ))}
                    </div>

                    <button
                      onClick={() => addField(section.id)}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Icons.Plus className="w-4 h-4" />
                      <span>Add Field</span>
                    </button>
                  </div>
                  </ErrorBoundary>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <button
            onClick={handleExportToPdf}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            <Icons.FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </button>

          <div className="flex space-x-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icons.Save className="w-4 h-4" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Programmatic Import Modal */}
      {showImportModal && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <Icons.Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-gray-700">Loading import modal...</span>
            </div>
          </div>
        }>
          <ProgrammaticImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImport={handleImportTemplate}
          />
        </Suspense>
      )}
    </div>
  );
};
