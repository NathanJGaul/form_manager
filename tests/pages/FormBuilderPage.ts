import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FormBuilderPage extends BasePage {
  // Locators
  readonly formNameInput = this.page.getByPlaceholder('Enter form name');
  readonly formDescriptionInput = this.page.getByPlaceholder('Enter form description');
  readonly saveTemplateButton = this.page.getByRole('button', { name: /save template/i });
  readonly addSectionButton = this.page.getByRole('button', { name: /add section/i });
  readonly previewButton = this.page.getByRole('button', { name: /preview/i });
  readonly backButton = this.page.getByRole('button', { name: /back/i });

  async goto() {
    await this.navigateTo('/builder');
  }

  async setFormName(name: string) {
    await this.formNameInput.fill(name);
  }

  async setFormDescription(description: string) {
    await this.formDescriptionInput.fill(description);
  }

  async addSection(title: string) {
    await this.addSectionButton.click();
    const newSectionInput = this.page.getByPlaceholder('Section title').last();
    await newSectionInput.fill(title);
  }

  async getSectionContainer(sectionTitle: string) {
    return this.page.locator('[data-testid="section-container"]').filter({ hasText: sectionTitle });
  }

  async addFieldToSection(sectionTitle: string, fieldType: string) {
    const section = await this.getSectionContainer(sectionTitle);
    const addFieldButton = section.getByRole('button', { name: new RegExp(`add ${fieldType}`, 'i') });
    await addFieldButton.click();
  }

  async configureField(fieldLabel: string, config: {
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
    defaultValue?: string;
  }) {
    const fieldContainer = this.page.locator('[data-testid="field-container"]').filter({ hasText: fieldLabel });
    
    if (config.label) {
      const labelInput = fieldContainer.getByPlaceholder('Field label');
      await labelInput.fill(config.label);
    }
    
    if (config.placeholder) {
      const placeholderInput = fieldContainer.getByPlaceholder('Placeholder text');
      await placeholderInput.fill(config.placeholder);
    }
    
    if (config.required !== undefined) {
      const requiredCheckbox = fieldContainer.getByLabel('Required');
      if (config.required) {
        await requiredCheckbox.check();
      } else {
        await requiredCheckbox.uncheck();
      }
    }
    
    if (config.options) {
      for (let i = 0; i < config.options.length; i++) {
        const optionInput = fieldContainer.getByPlaceholder(`Option ${i + 1}`);
        await optionInput.fill(config.options[i]);
        
        // Add new option if needed
        if (i < config.options.length - 1) {
          const addOptionButton = fieldContainer.getByRole('button', { name: /add option/i });
          await addOptionButton.click();
        }
      }
    }
    
    if (config.defaultValue) {
      const defaultInput = fieldContainer.getByPlaceholder('Default value');
      await defaultInput.fill(config.defaultValue);
    }
  }

  async addConditionalLogic(fieldLabel: string, condition: {
    dependsOn: string;
    operator: 'equals' | 'not_equals' | 'contains';
    values: string[];
  }) {
    const fieldContainer = this.page.locator('[data-testid="field-container"]').filter({ hasText: fieldLabel });
    const conditionalButton = fieldContainer.getByRole('button', { name: /add conditional/i });
    await conditionalButton.click();
    
    // Configure conditional
    const conditionalSection = fieldContainer.locator('[data-testid="conditional-config"]');
    
    // Select depends on field
    const dependsOnSelect = conditionalSection.getByLabel('Depends on');
    await dependsOnSelect.selectOption(condition.dependsOn);
    
    // Select operator
    const operatorSelect = conditionalSection.getByLabel('Operator');
    await operatorSelect.selectOption(condition.operator);
    
    // Add values
    for (const value of condition.values) {
      const valueInput = conditionalSection.getByPlaceholder('Value');
      await valueInput.fill(value);
      const addValueButton = conditionalSection.getByRole('button', { name: /add value/i });
      await addValueButton.click();
    }
  }

  async removeField(fieldLabel: string) {
    const fieldContainer = this.page.locator('[data-testid="field-container"]').filter({ hasText: fieldLabel });
    const removeButton = fieldContainer.getByRole('button', { name: /remove/i });
    await removeButton.click();
  }

  async reorderField(fieldLabel: string, direction: 'up' | 'down') {
    const fieldContainer = this.page.locator('[data-testid="field-container"]').filter({ hasText: fieldLabel });
    const moveButton = fieldContainer.getByRole('button', { name: new RegExp(`move ${direction}`, 'i') });
    await moveButton.click();
  }

  async duplicateField(fieldLabel: string) {
    const fieldContainer = this.page.locator('[data-testid="field-container"]').filter({ hasText: fieldLabel });
    const duplicateButton = fieldContainer.getByRole('button', { name: /duplicate/i });
    await duplicateButton.click();
  }

  async saveTemplate() {
    await this.saveTemplateButton.click();
    await this.waitForToastMessage(/template saved successfully/i);
  }

  async previewForm() {
    await this.previewButton.click();
  }

  async backToDashboard() {
    await this.backButton.click();
  }

  async getFieldCount(): Promise<number> {
    const fields = await this.page.locator('[data-testid="field-container"]').all();
    return fields.length;
  }

  async getSectionCount(): Promise<number> {
    const sections = await this.page.locator('[data-testid="section-container"]').all();
    return sections.length;
  }

  async createBasicForm(config: {
    name: string;
    description?: string;
    sections: Array<{
      title: string;
      fields: Array<{
        type: string;
        label: string;
        required?: boolean;
        options?: string[];
      }>;
    }>;
  }) {
    await this.setFormName(config.name);
    
    if (config.description) {
      await this.setFormDescription(config.description);
    }
    
    for (const section of config.sections) {
      await this.addSection(section.title);
      
      for (const field of section.fields) {
        await this.addFieldToSection(section.title, field.type);
        await this.configureField(field.label, {
          label: field.label,
          required: field.required,
          options: field.options,
        });
      }
    }
  }

  async importTemplateJSON(jsonContent: string) {
    const importButton = this.page.getByRole('button', { name: /import template/i });
    await importButton.click();
    
    const jsonInput = this.page.getByRole('textbox', { name: /paste json/i });
    await jsonInput.fill(jsonContent);
    
    const confirmImportButton = this.page.getByRole('button', { name: /confirm import/i });
    await confirmImportButton.click();
  }

  async exportTemplateJSON(): Promise<string> {
    const exportButton = this.page.getByRole('button', { name: /export json/i });
    await exportButton.click();
    
    // Get the JSON from the modal
    const jsonContent = await this.page.getByRole('textbox', { name: /template json/i }).inputValue();
    
    // Close modal
    const closeButton = this.page.getByRole('button', { name: /close/i });
    await closeButton.click();
    
    return jsonContent;
  }
}