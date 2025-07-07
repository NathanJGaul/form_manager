import React, { useState } from "react";
import { FormTemplate, FormSection, FormField } from "../types/form";
import { storageManager } from "../utils/storage";
import * as Icons from "lucide-react";
import { ProgrammaticImportModal } from "./ProgrammaticImportModal";

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
    template?.sections || []
  );
  const [showImportModal, setShowImportModal] = useState(false);

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
    const newField: FormField = {
      id: crypto.randomUUID(),
      type: "text",
      label: "New Field",
      required: false,
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
    setName(importedTemplate.name);
    setDescription(importedTemplate.description);
    setSections(importedTemplate.sections);
    setShowImportModal(false);
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
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">Text Input</option>
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
                    value={Array.isArray(field.defaultValue) ? field.defaultValue.join('\n') : ''}
                    onChange={(e) =>
                      updateField(sectionId, field.id, {
                        defaultValue: e.target.value
                          .split('\n')
                          .filter(v => v.trim())
                      })
                    }
                    placeholder="Enter default selections (one per line)"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter values that should be pre-selected from your options
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
                      defaultValue: e.target.value ? Number(e.target.value) : undefined,
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
                  value={field.options?.join("\n") || ""}
                  onChange={(e) =>
                    updateField(sectionId, field.id, {
                      options: e.target.value
                        .split("\n")
                        .filter((opt) => opt.trim()),
                    })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  <div key={section.id} className="border rounded-lg p-6">
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

                    <div className="space-y-4">
                      {section.fields.map((field) =>
                        renderFieldEditor(section.id, field)
                      )}
                    </div>

                    <button
                      onClick={() => addField(section.id)}
                      className="mt-4 flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Icons.Plus className="w-4 h-4" />
                      <span>Add Field</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end space-x-4">
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

      {/* Programmatic Import Modal */}
      <ProgrammaticImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportTemplate}
      />
    </div>
  );
};
