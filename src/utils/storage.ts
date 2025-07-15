import {
  FormTemplate,
  FormInstance,
  FormSubmission,
  FormField,
  FormFieldValue,
} from "../types/form";
import { CommonTemplates } from "../programmatic/library/CommonTemplates";
import { TDLConverter } from "../programmatic/tdl/converter";
import { updateConditionalFieldsAsNull } from "./formLogic";

interface StoredTemplate {
  id: string;
  name: string;
  description: string;
  sections: any[];
  createdAt: string;
  updatedAt: string;
}

interface StoredInstance {
  id: string;
  templateId: string;
  templateName: string;
  data: Record<string, FormFieldValue>;
  progress: number;
  completed: boolean;
  visitedSections?: string[];
  createdAt: string;
  updatedAt: string;
  lastSaved: string;
}

interface StoredSubmission {
  id: string;
  formInstanceId: string;
  templateId: string;
  templateName: string;
  data: Record<string, FormFieldValue>;
  submittedAt: string;
}

class StorageManager {
  private readonly TEMPLATES_KEY = "form_templates";
  private readonly INSTANCES_KEY = "form_instances";
  private readonly SUBMISSIONS_KEY = "form_submissions";
  private readonly DEFAULT_TEMPLATES_LOADED_KEY = "default_templates_loaded";
  private readonly VIEW_MODE_KEY = "form_view_mode";

  // Template methods
  getTemplates(): FormTemplate[] {
    // Load default templates on first run
    this.loadDefaultTemplatesIfNeeded();

    const stored = localStorage.getItem(this.TEMPLATES_KEY);
    if (!stored) return [];

    const templates = JSON.parse(stored);
    return templates.map((t: StoredTemplate) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  }

  private loadDefaultTemplatesIfNeeded(): void {
    const defaultsLoaded = localStorage.getItem(
      this.DEFAULT_TEMPLATES_LOADED_KEY
    );
    if (defaultsLoaded) return;

    console.log("🔄 Loading default templates...");

    // Load default templates from CommonTemplates
    // const defaultTemplateNames = ['contact', 'survey', 'registration', 'jcc2-questionnaire'];
    const defaultTemplateNames = [
      "jcc2-questionnaire",
      "jcc2-data-collection-form",
    ];
    const existingTemplates = this.getTemplatesRaw();
    const converter = new TDLConverter();

    defaultTemplateNames.forEach((templateName) => {
      try {
        const programmaticTemplate = CommonTemplates.getTemplate(templateName);
        const conversionResult = converter.convertToGUI(programmaticTemplate, {
          preserveIds: true,
        });

        if (conversionResult.success && conversionResult.result) {
          const formTemplate = conversionResult.result as FormTemplate;

          // Check if template with this name already exists
          const exists = existingTemplates.some(
            (t) => t.name === formTemplate.name
          );
          if (!exists) {
            // Mark as default template
            formTemplate.id = `default-${templateName}`;
            formTemplate.createdAt = new Date();
            formTemplate.updatedAt = new Date();

            existingTemplates.push(formTemplate);
            console.log(`✅ Added default template: ${formTemplate.name}`);
          } else {
            console.log(`⚠️  Template already exists: ${formTemplate.name}`);
          }
        } else {
          console.warn(
            `Failed to convert template: ${templateName}`,
            conversionResult.errors
          );
        }
      } catch (error) {
        console.warn(`Failed to load default template: ${templateName}`, error);
      }
    });

    // Save updated templates and mark defaults as loaded
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(existingTemplates));
    localStorage.setItem(this.DEFAULT_TEMPLATES_LOADED_KEY, "true");
    console.log(
      `✅ Default templates loaded. Total templates: ${existingTemplates.length}`
    );
  }

  private getTemplatesRaw(): FormTemplate[] {
    const stored = localStorage.getItem(this.TEMPLATES_KEY);
    if (!stored) return [];

    const templates = JSON.parse(stored);
    return templates.map((t: StoredTemplate) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
    }));
  }

  saveTemplate(template: FormTemplate): void {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex((t) => t.id === template.id);

    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }

    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  deleteTemplate(templateId: string): void {
    const templates = this.getTemplates().filter((t) => t.id !== templateId);
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  // Method to reset default templates (for testing)
  resetDefaultTemplates(): void {
    localStorage.removeItem(this.DEFAULT_TEMPLATES_LOADED_KEY);
    // Remove default templates
    const templates = this.getTemplatesRaw().filter(
      (t) => !t.id.startsWith("default-")
    );
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  // Instance methods
  getInstances(): FormInstance[] {
    const stored = localStorage.getItem(this.INSTANCES_KEY);
    if (!stored) return [];

    const instances = JSON.parse(stored);
    return instances.map((i: StoredInstance) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      updatedAt: new Date(i.updatedAt),
      lastSaved: new Date(i.lastSaved),
    }));
  }

  saveInstance(instance: FormInstance): void {
    const instances = this.getInstances();
    const existingIndex = instances.findIndex((i) => i.id === instance.id);

    instance.lastSaved = new Date();
    instance.updatedAt = new Date();

    if (existingIndex >= 0) {
      instances[existingIndex] = instance;
    } else {
      instances.push(instance);
    }

    localStorage.setItem(this.INSTANCES_KEY, JSON.stringify(instances));
  }

  deleteInstance(instanceId: string): void {
    const instances = this.getInstances().filter((i) => i.id !== instanceId);
    localStorage.setItem(this.INSTANCES_KEY, JSON.stringify(instances));
    
    // Also delete the associated submission record if it exists
    // Since instances and submissions now share the same ID, we can delete by the same ID
    this.deleteSubmission(instanceId);
  }

  // Find existing draft instance for a template (incomplete instance)
  findDraftInstance(templateId: string): FormInstance | null {
    const instances = this.getInstances();
    return (
      instances.find((i) => i.templateId === templateId && !i.completed) || null
    );
  }

  // Get or create instance for a template (reuses existing draft)
  getOrCreateInstance(templateId: string, templateName: string): FormInstance {
    const existingDraft = this.findDraftInstance(templateId);

    if (existingDraft) {
      return existingDraft;
    }

    // Create new instance if no draft exists
    const newInstance: FormInstance = {
      id: crypto.randomUUID(),
      templateId,
      templateName,
      data: {},
      progress: 0,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSaved: new Date(),
    };

    return newInstance;
  }

  // Submission methods
  getSubmissions(): FormSubmission[] {
    const stored = localStorage.getItem(this.SUBMISSIONS_KEY);
    if (!stored) return [];

    const submissions = JSON.parse(stored);
    return submissions.map((s: StoredSubmission) => ({
      ...s,
      submittedAt: new Date(s.submittedAt),
    }));
  }

  saveSubmission(submission: FormSubmission): void {
    const submissions = this.getSubmissions();
    submissions.push(submission);
    localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions));
  }

  deleteSubmission(submissionId: string): void {
    const submissions = this.getSubmissions().filter((s) => s.id !== submissionId);
    localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions));
  }

  // Helper methods for CSV export
  private sanitizeLabel(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  }

  private generateFieldHeaders(template: FormTemplate): {
    headers: string[];
    fieldMap: Map<string, string>;
  } {
    const headers: string[] = [];
    const fieldMap = new Map<string, string>();

    // System fields
    const systemFields = [
      { key: "id", label: "id" },
      { key: "status", label: "status" },
      { key: "progress", label: "progress" },
      { key: "createdAt", label: "created_at" },
      { key: "updatedAt", label: "updated_at" },
      { key: "lastSaved", label: "last_saved" },
    ];

    systemFields.forEach((field) => {
      headers.push(field.label);
      fieldMap.set(field.key, field.label);
    });

    // Form fields with dot notation
    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const dotNotationHeader = `${section.id}.${field.id}`;
        headers.push(dotNotationHeader);
        fieldMap.set(field.id, dotNotationHeader);
      });
    });

    return { headers, fieldMap };
  }

  private generateSchemaRow(
    template: FormTemplate,
    headers: string[]
  ): string[] {
    const schemaRow: string[] = [];

    // System field schemas
    const systemSchemas = new Map([
      ["id", "system|identifier"],
      ["status", "system|enum:Completed,In Progress,Submitted"],
      ["progress", "system|number|min:0|max:100"],
      ["created_at", "system|datetime"],
      ["updated_at", "system|datetime"],
      ["last_saved", "system|datetime"],
    ]);

    // Create field lookup map
    const fieldLookup = new Map<string, FormField>();
    template.sections.forEach((section) => {
      section.fields.forEach((field) => {
        fieldLookup.set(field.id, field);
      });
    });

    headers.forEach((header) => {
      // Check if it's a system field
      if (systemSchemas.has(header)) {
        schemaRow.push(systemSchemas.get(header)!);
        return;
      }

      // Find corresponding field for dot notation headers
      const field = Array.from(fieldLookup.values()).find((f) => {
        const section = template.sections.find((s) =>
          s.fields.some((sf) => sf.id === f.id)
        );
        return section && header === `${section.id}.${f.id}`;
      });

      if (!field) {
        schemaRow.push("unknown");
        return;
      }

      // Build schema string
      const schemaParts = [field.type];

      // Required/optional
      schemaParts.push(field.required ? "required" : "optional");

      // Validation constraints
      if (field.validation) {
        if (field.validation.pattern)
          schemaParts.push(`pattern:${field.validation.pattern}`);
        if (field.validation.min !== undefined)
          schemaParts.push(`min:${field.validation.min}`);
        if (field.validation.max !== undefined)
          schemaParts.push(`max:${field.validation.max}`);
        if (field.validation.minLength !== undefined)
          schemaParts.push(`minLength:${field.validation.minLength}`);
        if (field.validation.maxLength !== undefined)
          schemaParts.push(`maxLength:${field.validation.maxLength}`);
      }

      // Options for select/radio/checkbox
      if (field.options) {
        const optionsStr = Array.isArray(field.options)
          ? field.options.join(",")
          : field.options
              .map((opt) => (typeof opt === "string" ? opt : opt.value))
              .join(",");
        schemaParts.push(`options:${optionsStr}`);
      }

      // Multiple selection
      if (field.multiple) schemaParts.push("multiple");

      // Conditional fields
      if (field.conditional) {
        schemaParts.push(`depends_on:${field.conditional.dependsOn}`);
      }

      schemaRow.push(schemaParts.join("|"));
    });

    return schemaRow;
  }

  // Export methods
  exportToCSV(templateId: string): string {
    const submissions = this.getSubmissions().filter(
      (s) => s.templateId === templateId
    );
    const template = this.getTemplates().find((t) => t.id === templateId);

    if (!template) return "";

    // Only export submitted forms, not draft instances or completed instances
    // This prevents duplicate records from appearing in exports
    const allData = submissions.map((s) => {
      // Apply conditional field nullification to ensure consistent null handling
      const nullifiedData = updateConditionalFieldsAsNull(
        template.sections,
        s.data
      );
      return {
        id: s.id,
        status: "Submitted",
        progress: 100,
        createdAt: s.submittedAt.toISOString(),
        updatedAt: s.submittedAt.toISOString(),
        lastSaved: s.submittedAt.toISOString(),
        ...nullifiedData,
      };
    });

    if (allData.length === 0) return "";

    // Generate headers and field mapping
    const { headers, fieldMap } = this.generateFieldHeaders(template);

    // Generate schema row
    const schemaRow = this.generateSchemaRow(template, headers);

    // Map data to new header structure
    const mappedData = allData.map((row) => {
      const mappedRow: Record<string, FormFieldValue | null> = {};
      headers.forEach((header) => {
        // Find the original field key that maps to this header
        const fieldId = Array.from(fieldMap.entries()).find(
          ([key, value]) => value === header
        )?.[0];
        if (fieldId) {
          // Found a direct mapping
          const value = row[fieldId as keyof typeof row];
          mappedRow[header] = value !== undefined ? value : "";
        } else {
          // If no mapping found, try to extract field ID from dot notation
          const parts = header.split(".");
          if (parts.length === 2) {
            const fieldKey = parts[1]; // Extract field ID from section.field format
            const value = row[fieldKey as keyof typeof row];
            mappedRow[header] = value !== undefined ? value : "";
          } else {
            mappedRow[header] = "";
          }
        }
      });
      return mappedRow;
    });

    // Format CSV content with proper escaping
    const formatCsvValue = (
      value: FormFieldValue | null | undefined
    ): string => {
      if (value === null) return "null";
      if (value === undefined) return "";
      const stringValue = String(value);
      return stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    };

    const csvContent = [
      headers.map(formatCsvValue).join(","),
      schemaRow.map(formatCsvValue).join(","),
      ...mappedData.map((row) =>
        headers.map((header) => formatCsvValue(row[header])).join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  exportAllToCSV(): string {
    const templates = this.getTemplates();
    const allExports = templates.map((template) => ({
      templateName: template.name,
      data: this.exportToCSV(template.id),
    }));

    return allExports
      .filter((exp) => exp.data)
      .map((exp) => `Template: ${exp.templateName}\n${exp.data}`)
      .join("\n\n");
  }

  // View mode methods
  getViewMode(): "continuous" | "section" {
    const stored = localStorage.getItem(this.VIEW_MODE_KEY);
    return stored === "continuous" ? "continuous" : "section";
  }

  saveViewMode(viewMode: "continuous" | "section"): void {
    localStorage.setItem(this.VIEW_MODE_KEY, viewMode);
  }
}

export const storageManager = new StorageManager();
