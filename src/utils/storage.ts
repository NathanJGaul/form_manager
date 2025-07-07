import { FormTemplate, FormInstance, FormSubmission, FormField } from '../types/form';

class StorageManager {
  private readonly TEMPLATES_KEY = 'form_templates';
  private readonly INSTANCES_KEY = 'form_instances';
  private readonly SUBMISSIONS_KEY = 'form_submissions';

  // Template methods
  getTemplates(): FormTemplate[] {
    const stored = localStorage.getItem(this.TEMPLATES_KEY);
    if (!stored) return [];
    
    const templates = JSON.parse(stored);
    return templates.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt)
    }));
  }

  saveTemplate(template: FormTemplate): void {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  deleteTemplate(templateId: string): void {
    const templates = this.getTemplates().filter(t => t.id !== templateId);
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  // Instance methods
  getInstances(): FormInstance[] {
    const stored = localStorage.getItem(this.INSTANCES_KEY);
    if (!stored) return [];
    
    const instances = JSON.parse(stored);
    return instances.map((i: any) => ({
      ...i,
      createdAt: new Date(i.createdAt),
      updatedAt: new Date(i.updatedAt),
      lastSaved: new Date(i.lastSaved)
    }));
  }

  saveInstance(instance: FormInstance): void {
    const instances = this.getInstances();
    const existingIndex = instances.findIndex(i => i.id === instance.id);
    
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
    const instances = this.getInstances().filter(i => i.id !== instanceId);
    localStorage.setItem(this.INSTANCES_KEY, JSON.stringify(instances));
  }

  // Find existing draft instance for a template (incomplete instance)
  findDraftInstance(templateId: string): FormInstance | null {
    const instances = this.getInstances();
    return instances.find(i => i.templateId === templateId && !i.completed) || null;
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
      lastSaved: new Date()
    };
    
    return newInstance;
  }

  // Submission methods
  getSubmissions(): FormSubmission[] {
    const stored = localStorage.getItem(this.SUBMISSIONS_KEY);
    if (!stored) return [];
    
    const submissions = JSON.parse(stored);
    return submissions.map((s: any) => ({
      ...s,
      submittedAt: new Date(s.submittedAt)
    }));
  }

  saveSubmission(submission: FormSubmission): void {
    const submissions = this.getSubmissions();
    submissions.push(submission);
    localStorage.setItem(this.SUBMISSIONS_KEY, JSON.stringify(submissions));
  }

  // Helper methods for CSV export
  private sanitizeLabel(text: string): string {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .trim();
  }

  private generateFieldHeaders(template: FormTemplate): { headers: string[], fieldMap: Map<string, string> } {
    const headers: string[] = [];
    const fieldMap = new Map<string, string>();
    
    // System fields
    const systemFields = [
      { key: 'id', label: 'id' },
      { key: 'status', label: 'status' },
      { key: 'progress', label: 'progress' },
      { key: 'createdAt', label: 'created_at' },
      { key: 'updatedAt', label: 'updated_at' },
      { key: 'lastSaved', label: 'last_saved' }
    ];
    
    systemFields.forEach(field => {
      headers.push(field.label);
      fieldMap.set(field.key, field.label);
    });
    
    // Form fields with dot notation
    template.sections.forEach(section => {
      const sectionName = this.sanitizeLabel(section.title);
      section.fields.forEach(field => {
        const fieldLabel = this.sanitizeLabel(field.label);
        const dotNotationHeader = `${sectionName}.${fieldLabel}`;
        headers.push(dotNotationHeader);
        fieldMap.set(field.id, dotNotationHeader);
      });
    });
    
    return { headers, fieldMap };
  }

  private generateSchemaRow(template: FormTemplate, headers: string[]): string[] {
    const schemaRow: string[] = [];
    
    // System field schemas
    const systemSchemas = new Map([
      ['id', 'system|identifier'],
      ['status', 'system|enum:Completed,In Progress,Submitted'],
      ['progress', 'system|number|min:0|max:100'],
      ['created_at', 'system|datetime'],
      ['updated_at', 'system|datetime'],
      ['last_saved', 'system|datetime']
    ]);
    
    // Create field lookup map
    const fieldLookup = new Map<string, FormField>();
    template.sections.forEach(section => {
      section.fields.forEach(field => {
        fieldLookup.set(field.id, field);
      });
    });
    
    headers.forEach(header => {
      // Check if it's a system field
      if (systemSchemas.has(header)) {
        schemaRow.push(systemSchemas.get(header)!);
        return;
      }
      
      // Find corresponding field for dot notation headers
      const field = Array.from(fieldLookup.values()).find(f => {
        const sectionName = this.sanitizeLabel(
          template.sections.find(s => s.fields.some(sf => sf.id === f.id))?.title || ''
        );
        const fieldLabel = this.sanitizeLabel(f.label);
        return header === `${sectionName}.${fieldLabel}`;
      });
      
      if (!field) {
        schemaRow.push('unknown');
        return;
      }
      
      // Build schema string
      const schemaParts = [field.type];
      
      // Required/optional
      schemaParts.push(field.required ? 'required' : 'optional');
      
      // Validation constraints
      if (field.validation) {
        if (field.validation.pattern) schemaParts.push(`pattern:${field.validation.pattern}`);
        if (field.validation.min !== undefined) schemaParts.push(`min:${field.validation.min}`);
        if (field.validation.max !== undefined) schemaParts.push(`max:${field.validation.max}`);
        if (field.validation.minLength !== undefined) schemaParts.push(`minLength:${field.validation.minLength}`);
        if (field.validation.maxLength !== undefined) schemaParts.push(`maxLength:${field.validation.maxLength}`);
      }
      
      // Options for select/radio/checkbox
      if (field.options) {
        const optionsStr = Array.isArray(field.options) 
          ? field.options.join(',')
          : field.options.map(opt => typeof opt === 'string' ? opt : opt.value).join(',');
        schemaParts.push(`options:${optionsStr}`);
      }
      
      // Multiple selection
      if (field.multiple) schemaParts.push('multiple');
      
      // Conditional fields
      if (field.conditional) {
        schemaParts.push(`depends_on:${field.conditional.dependsOn}`);
      }
      
      schemaRow.push(schemaParts.join('|'));
    });
    
    return schemaRow;
  }

  // Export methods
  exportToCSV(templateId: string): string {
    const instances = this.getInstances().filter(i => i.templateId === templateId);
    const submissions = this.getSubmissions().filter(s => s.templateId === templateId);
    const template = this.getTemplates().find(t => t.id === templateId);
    
    if (!template) return '';
    
    const allData = [
      ...instances.map(i => ({
        id: i.id,
        status: i.completed ? 'Completed' : 'In Progress',
        progress: i.progress,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
        lastSaved: i.lastSaved.toISOString(),
        ...i.data
      })),
      ...submissions.map(s => ({
        id: s.id,
        status: 'Submitted',
        progress: 100,
        createdAt: s.submittedAt.toISOString(),
        updatedAt: s.submittedAt.toISOString(),
        lastSaved: s.submittedAt.toISOString(),
        ...s.data
      }))
    ];
    
    if (allData.length === 0) return '';
    
    // Generate headers and field mapping
    const { headers, fieldMap } = this.generateFieldHeaders(template);
    
    // Generate schema row
    const schemaRow = this.generateSchemaRow(template, headers);
    
    // Map data to new header structure
    const mappedData = allData.map(row => {
      const mappedRow: Record<string, any> = {};
      headers.forEach(header => {
        // Find original key that maps to this header
        const originalKey = Array.from(fieldMap.entries()).find(([key, value]) => value === header)?.[0];
        mappedRow[header] = originalKey ? row[originalKey as keyof typeof row] : '';
      });
      return mappedRow;
    });
    
    // Format CSV content with proper escaping
    const formatCsvValue = (value: any): string => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    };
    
    const csvContent = [
      headers.map(formatCsvValue).join(','),
      schemaRow.map(formatCsvValue).join(','),
      ...mappedData.map(row => 
        headers.map(header => formatCsvValue(row[header])).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }

  exportAllToCSV(): string {
    const templates = this.getTemplates();
    const allExports = templates.map(template => ({
      templateName: template.name,
      data: this.exportToCSV(template.id)
    }));
    
    return allExports
      .filter(exp => exp.data)
      .map(exp => `Template: ${exp.templateName}\n${exp.data}`)
      .join('\n\n');
  }
}

export const storageManager = new StorageManager();