import { PDFDocument, PDFForm, PDFPage, rgb } from 'pdf-lib';
import { FormTemplate, FormField, FormSection, FormFieldValue } from '../types/form';
import { PdfExportOptions, PdfFieldLayout, PdfExportResult, DEFAULT_PDF_OPTIONS, PAGE_SIZES } from '../types/pdfExport';

export class PdfExporter {
  private pdfDoc: PDFDocument;
  private form: PDFForm;
  private options: PdfExportOptions;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 50;

  constructor(options: Partial<PdfExportOptions> = {}) {
    this.options = { ...DEFAULT_PDF_OPTIONS, ...options };
    this.currentY = 0;
    this.pageWidth = 0;
    this.pageHeight = 0;
  }

  private getStringValue(value: FormFieldValue | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  }

  async exportTemplate(template: FormTemplate): Promise<PdfExportResult> {
    try {
      this.pdfDoc = await PDFDocument.create();
      this.form = this.pdfDoc.getForm();
      
      this.setupPageDimensions();
      this.currentY = this.pageHeight - this.margin;

      let page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
      
      // Add title
      page.drawText(template.name, {
        x: this.margin,
        y: this.currentY,
        size: 16,
        color: rgb(0, 0, 0),
      });
      this.currentY -= 30;

      // Add description if present
      if (template.description) {
        page.drawText(template.description, {
          x: this.margin,
          y: this.currentY,
          size: 12,
          color: rgb(0.3, 0.3, 0.3),
        });
        this.currentY -= 20;
      }

      // Process sections
      for (const section of template.sections) {
        const result = await this.processSection(section, page);
        if (result.needsNewPage) {
          page = this.pdfDoc.addPage([this.pageWidth, this.pageHeight]);
          this.currentY = this.pageHeight - this.margin;
        }
      }

      const pdfBytes = await this.pdfDoc.save();
      return { success: true, pdfBytes };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private setupPageDimensions(): void {
    const pageSize = PAGE_SIZES[this.options.pageSize];
    if (this.options.orientation === 'Landscape') {
      this.pageWidth = pageSize.height;
      this.pageHeight = pageSize.width;
    } else {
      this.pageWidth = pageSize.width;
      this.pageHeight = pageSize.height;
    }
  }

  private async processSection(section: FormSection, page: PDFPage): Promise<{ needsNewPage: boolean }> {
    // Add section header
    if (this.options.includeSectionHeaders && section.title) {
      this.currentY -= 20;
      page.drawText(section.title, {
        x: this.margin,
        y: this.currentY,
        size: 14,
        color: rgb(0, 0, 0),
      });
      this.currentY -= 25;
    }

    // Group fields by group key for matrix layout
    const groupedFields = this.groupFieldsByGroup(section.fields);
    
    for (const [groupKey, fields] of Object.entries(groupedFields)) {
      if (groupKey === 'ungrouped') {
        // Process individual fields
        for (const field of fields) {
          const result = await this.processField(field, page);
          if (result.needsNewPage) {
            return { needsNewPage: true };
          }
        }
      } else {
        // Process grouped fields as matrix
        const result = await this.processFieldGroup(groupKey, fields, page);
        if (result.needsNewPage) {
          return { needsNewPage: true };
        }
      }
    }

    return { needsNewPage: false };
  }

  private groupFieldsByGroup(fields: FormField[]): Record<string, FormField[]> {
    const grouped: Record<string, FormField[]> = { ungrouped: [] };
    
    for (const field of fields) {
      if (field.grouping?.enabled && field.grouping.groupKey) {
        if (!grouped[field.grouping.groupKey]) {
          grouped[field.grouping.groupKey] = [];
        }
        grouped[field.grouping.groupKey].push(field);
      } else {
        grouped.ungrouped.push(field);
      }
    }
    
    return grouped;
  }

  private async processFieldGroup(groupKey: string, fields: FormField[], page: PDFPage): Promise<{ needsNewPage: boolean }> {
    if (fields.length === 0) return { needsNewPage: false };

    // Check if we need a new page
    const estimatedHeight = fields.length * 35 + 50; // Rough estimate
    if (this.currentY - estimatedHeight < this.margin) {
      return { needsNewPage: true };
    }

    // Get first field to determine options (assuming all grouped fields have same options)
    const firstField = fields[0];
    const options = firstField.options || [];

    // Draw table header
    const startY = this.currentY;
    const cellWidth = 100;
    const cellHeight = 25;
    const labelWidth = 150;

    // Draw column headers
    let x = this.margin + labelWidth;
    for (const option of options) {
      page.drawText(option, {
        x: x + 5,
        y: startY,
        size: 10,
        color: rgb(0, 0, 0),
      });
      x += cellWidth;
    }

    this.currentY -= cellHeight;

    // Draw rows for each field
    for (const field of fields) {
      // Draw field label
      if (this.options.includeLabels && field.label) {
        page.drawText(field.label, {
          x: this.margin,
          y: this.currentY,
          size: 10,
          color: rgb(0, 0, 0),
        });
      }

      // Draw form fields for each option
      x = this.margin + labelWidth;
      for (let i = 0; i < options.length; i++) {
        const fieldName = `${field.id}_${i}`;
        const layout: PdfFieldLayout = {
          x: x,
          y: this.currentY - 5,
          width: 15,
          height: 15,
        };

        if (field.type === 'radio') {
          await this.createRadioField(fieldName, field, layout, i);
        } else if (field.type === 'checkbox') {
          await this.createCheckboxField(fieldName, field, layout);
        }

        x += cellWidth;
      }

      this.currentY -= cellHeight;
    }

    this.currentY -= this.options.fieldSpacing;
    return { needsNewPage: false };
  }

  private async processField(field: FormField, page: PDFPage): Promise<{ needsNewPage: boolean }> {
    // Check if we need a new page
    const fieldHeight = this.getFieldHeight(field);
    if (this.currentY - fieldHeight < this.margin) {
      return { needsNewPage: true };
    }

    // Add field label
    if (this.options.includeLabels && field.label) {
      page.drawText(field.label + (field.required ? ' *' : ''), {
        x: this.margin,
        y: this.currentY,
        size: this.options.fontSize,
        color: rgb(0, 0, 0),
      });
      this.currentY -= 20;
    }

    // Create form field based on type
    const layout: PdfFieldLayout = {
      x: this.margin,
      y: this.currentY - fieldHeight + 5,
      width: this.pageWidth - 2 * this.margin,
      height: fieldHeight,
    };

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
      case 'time':
      case 'range':
        await this.createTextField(field.id, field, layout);
        break;
      case 'textarea':
        await this.createTextAreaField(field.id, field, layout);
        break;
      case 'select':
        await this.createDropdownField(field.id, field, layout);
        break;
      case 'radio':
        await this.createRadioGroupField(field.id, field, layout);
        break;
      case 'checkbox':
        await this.createCheckboxField(field.id, field, layout);
        break;
    }

    this.currentY -= fieldHeight + this.options.fieldSpacing;
    return { needsNewPage: false };
  }

  private getFieldHeight(field: FormField): number {
    switch (field.type) {
      case 'textarea':
        return 60;
      case 'radio':
        return (field.options?.length || 1) * 25;
      case 'checkbox':
        return field.options ? field.options.length * 25 : 25;
      default:
        return 25;
    }
  }

  private async createTextField(name: string, field: FormField, layout: PdfFieldLayout): Promise<void> {
    const textField = this.form.createTextField(name);
    textField.addToPage(this.pdfDoc.getPages()[this.pdfDoc.getPageCount() - 1], {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
    });
    
    if (field.defaultValue) {
      textField.setText(this.getStringValue(field.defaultValue));
    }
    
    if (field.placeholder && !field.defaultValue) {
      textField.setText(this.getStringValue(field.placeholder));
    }
  }

  private async createTextAreaField(name: string, field: FormField, layout: PdfFieldLayout): Promise<void> {
    const textField = this.form.createTextField(name);
    textField.enableMultiline();
    textField.addToPage(this.pdfDoc.getPages()[this.pdfDoc.getPageCount() - 1], {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
    });
    
    if (field.defaultValue) {
      textField.setText(this.getStringValue(field.defaultValue));
    }
  }

  private async createDropdownField(name: string, field: FormField, layout: PdfFieldLayout): Promise<void> {
    const dropdown = this.form.createDropdown(name);
    
    if (field.options) {
      dropdown.addOptions(field.options);
      if (field.defaultValue) {
        dropdown.select(this.getStringValue(field.defaultValue));
      }
    }
    
    dropdown.addToPage(this.pdfDoc.getPages()[this.pdfDoc.getPageCount() - 1], {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      height: layout.height,
    });
  }

  private async createRadioGroupField(name: string, field: FormField, layout: PdfFieldLayout): Promise<void> {
    if (!field.options) return;

    const radioGroup = this.form.createRadioGroup(name);
    const page = this.pdfDoc.getPages()[this.pdfDoc.getPageCount() - 1];
    
    for (let i = 0; i < field.options.length; i++) {
      const option = field.options[i];
      const optionY = layout.y + layout.height - (i * 25) - 15;
      
      radioGroup.addOptionToPage(option, page, {
        x: layout.x,
        y: optionY,
        width: 15,
        height: 15,
      });
      
      // Add option label
      page.drawText(option, {
        x: layout.x + 20,
        y: optionY + 3,
        size: 10,
        color: rgb(0, 0, 0),
      });
    }
    
    if (field.defaultValue) {
      radioGroup.select(this.getStringValue(field.defaultValue));
    }
  }

  private async createRadioField(name: string, field: FormField, layout: PdfFieldLayout, optionIndex: number): Promise<void> {
    const radioGroup = this.form.createRadioGroup(name);
    const page = this.pdfDoc.getPages()[this.pdfDoc.getPageCount() - 1];
    
    if (field.options && field.options[optionIndex]) {
      radioGroup.addOptionToPage(field.options[optionIndex], page, {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
      });
    }
  }

  private async createCheckboxField(name: string, field: FormField, layout: PdfFieldLayout): Promise<void> {
    const page = this.pdfDoc.getPages()[this.pdfDoc.getPageCount() - 1];
    
    if (field.options) {
      // Multiple checkboxes
      for (let i = 0; i < field.options.length; i++) {
        const option = field.options[i];
        const optionY = layout.y + layout.height - (i * 25) - 15;
        
        const checkbox = this.form.createCheckBox(`${name}_${i}`);
        checkbox.addToPage(page, {
          x: layout.x,
          y: optionY,
          width: 15,
          height: 15,
        });
        
        // Add option label
        page.drawText(option, {
          x: layout.x + 20,
          y: optionY + 3,
          size: 10,
          color: rgb(0, 0, 0),
        });
        
        const defaultValueStr = this.getStringValue(field.defaultValue);
        if (defaultValueStr.includes(option)) {
          checkbox.check();
        }
      }
    } else {
      // Single checkbox
      const checkbox = this.form.createCheckBox(name);
      checkbox.addToPage(page, {
        x: layout.x,
        y: layout.y,
        width: 15,
        height: 15,
      });
      
      const defaultValueStr = this.getStringValue(field.defaultValue);
      if (defaultValueStr === 'true' || defaultValueStr === '1') {
        checkbox.check();
      }
    }
  }
}

export const exportTemplateToPdf = async (
  template: FormTemplate,
  options?: Partial<PdfExportOptions>
): Promise<PdfExportResult> => {
  const exporter = new PdfExporter(options);
  return await exporter.exportTemplate(template);
};

export const downloadPdf = (pdfBytes: Uint8Array, filename: string): void => {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};