import { FormTemplate, FormInstance, FormSubmission } from '../types/form';

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
    
    const headers = Object.keys(allData[0]);
    const csvContent = [
      headers.join(','),
      ...allData.map(row => 
        headers.map(header => {
          const value = row[header as keyof typeof row];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
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