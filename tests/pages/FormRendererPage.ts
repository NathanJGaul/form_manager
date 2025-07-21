import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FormRendererPage extends BasePage {
  // Navigation buttons
  readonly previousButton = this.page.getByRole('button', { name: /previous/i });
  readonly nextButton = this.page.getByRole('button', { name: /next/i });
  readonly submitButton = this.page.getByRole('button', { name: /submit/i });
  readonly saveAndExitButton = this.page.getByRole('button', { name: /save & exit/i });
  
  // Progress indicators
  readonly progressBar = this.page.locator('[data-testid="progress-bar"]');
  readonly progressText = this.page.locator('[data-testid="progress-text"]');
  readonly saveIndicator = this.page.locator('[data-testid="save-indicator"]');

  async goto(templateId: string, instanceId?: string) {
    const url = instanceId 
      ? `/form/${templateId}?instance=${instanceId}`
      : `/form/${templateId}`;
    await this.navigateTo(url);
  }

  async fillField(label: string, value: string | string[] | boolean) {
    const fieldType = await this.getFieldType(label);
    
    switch (fieldType) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
      case 'time':
        await this.fillTextField(label, value as string);
        break;
        
      case 'select':
        await this.selectOption(label, value as string);
        break;
        
      case 'radio':
        await this.selectRadioOption(label, value as string);
        break;
        
      case 'checkbox':
        if (Array.isArray(value)) {
          // Multiple checkboxes
          for (const option of value) {
            await this.checkCheckbox(option, true);
          }
        } else {
          // Single checkbox
          await this.checkCheckbox(label, value as boolean);
        }
        break;
    }
  }

  async getFieldType(label: string): Promise<string> {
    const field = this.page.getByLabel(label);
    
    // Check various field types
    if (await field.locator('input[type="text"]').count() > 0) return 'text';
    if (await field.locator('textarea').count() > 0) return 'textarea';
    if (await field.locator('select').count() > 0) return 'select';
    if (await field.locator('input[type="radio"]').count() > 0) return 'radio';
    if (await field.locator('input[type="checkbox"]').count() > 0) return 'checkbox';
    if (await field.locator('input[type="email"]').count() > 0) return 'email';
    if (await field.locator('input[type="tel"]').count() > 0) return 'tel';
    if (await field.locator('input[type="url"]').count() > 0) return 'url';
    if (await field.locator('input[type="number"]').count() > 0) return 'number';
    if (await field.locator('input[type="date"]').count() > 0) return 'date';
    if (await field.locator('input[type="time"]').count() > 0) return 'time';
    
    return 'text'; // Default
  }

  async getFieldValue(label: string): Promise<string | string[] | boolean | null> {
    const fieldType = await this.getFieldType(label);
    const field = this.page.getByLabel(label);
    
    switch (fieldType) {
      case 'text':
      case 'textarea':
      case 'email':
      case 'tel':
      case 'url':
      case 'number':
      case 'date':
      case 'time':
      case 'select':
        return await field.inputValue();
        
      case 'radio':
        const checkedRadio = await this.page.locator(`input[type="radio"]:checked`).filter({ has: field });
        return await checkedRadio.inputValue();
        
      case 'checkbox':
        const checkboxes = await field.locator('input[type="checkbox"]').all();
        if (checkboxes.length === 1) {
          return await checkboxes[0].isChecked();
        } else {
          const checked = [];
          for (const cb of checkboxes) {
            if (await cb.isChecked()) {
              const label = await cb.getAttribute('aria-label') || await cb.getAttribute('value');
              if (label) checked.push(label);
            }
          }
          return checked;
        }
    }
    
    return null;
  }

  async getValidationError(fieldLabel: string): Promise<string | null> {
    const field = this.page.getByLabel(fieldLabel);
    const errorId = await field.getAttribute('aria-describedby');
    
    if (errorId) {
      const error = this.page.locator(`#${errorId}`);
      if (await error.isVisible()) {
        return await error.textContent();
      }
    }
    
    // Alternative: look for error message near the field
    const fieldContainer = field.locator('..'); // Parent
    const errorMessage = fieldContainer.locator('[role="alert"], .error-message');
    
    if (await errorMessage.isVisible()) {
      return await errorMessage.textContent();
    }
    
    return null;
  }

  async navigateToNextSection() {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToPreviousSection() {
    await this.previousButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async saveAndExit() {
    await this.saveAndExitButton.click();
    await this.waitForAutoSave();
  }

  async getProgress(): Promise<number> {
    const progressText = await this.progressText.textContent();
    const match = progressText?.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  async getCurrentSectionTitle(): Promise<string> {
    const sectionTitle = this.page.locator('h2[data-testid="section-title"]');
    return await sectionTitle.textContent() || '';
  }

  async getAllSectionTitles(): Promise<string[]> {
    const sections = await this.page.locator('[data-testid="section-nav-item"]').all();
    const titles = [];
    
    for (const section of sections) {
      const title = await section.textContent();
      if (title) titles.push(title);
    }
    
    return titles;
  }

  async isFieldVisible(fieldLabel: string): Promise<boolean> {
    const field = this.page.getByLabel(fieldLabel);
    return await field.isVisible();
  }

  async isSectionVisible(sectionTitle: string): Promise<boolean> {
    const section = this.page.locator('h2').filter({ hasText: sectionTitle });
    return await section.isVisible();
  }

  async markSectionAsNA(sectionTitle: string) {
    const section = this.page.locator('[data-testid="section-container"]').filter({ hasText: sectionTitle });
    const naCheckbox = section.getByLabel(/not applicable/i);
    await naCheckbox.check();
  }

  async fillRequiredFields() {
    // Find all required fields on the current page
    const requiredFields = await this.page.locator('[required], [aria-required="true"]').all();
    
    for (const field of requiredFields) {
      const fieldType = await field.getAttribute('type') || 'text';
      const fieldName = await field.getAttribute('name') || await field.getAttribute('id');
      
      switch (fieldType) {
        case 'text':
          await field.fill(`Test ${fieldName}`);
          break;
        case 'email':
          await field.fill('test@example.com');
          break;
        case 'tel':
          await field.fill('555-123-4567');
          break;
        case 'number':
          await field.fill('42');
          break;
        case 'date':
          await field.fill('2024-01-01');
          break;
        case 'radio':
          // Click the first option
          await field.click();
          break;
        case 'checkbox':
          await field.check();
          break;
      }
    }
    
    // Handle select elements
    const requiredSelects = await this.page.locator('select[required], select[aria-required="true"]').all();
    for (const select of requiredSelects) {
      const options = await select.locator('option').all();
      if (options.length > 1) {
        await select.selectOption({ index: 1 }); // Select first non-empty option
      }
    }
  }

  async exportFormData(format: 'pdf' | 'csv' | 'json'): Promise<void> {
    const exportButton = this.page.getByRole('button', { name: new RegExp(`export.*${format}`, 'i') });
    
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await exportButton.click();
    
    const download = await downloadPromise;
    
    // Optionally save to a specific location
    await download.saveAs(`tests/downloads/form-export.${format}`);
  }

  async shareForm(): Promise<string> {
    const shareButton = this.page.getByRole('button', { name: /share/i });
    await shareButton.click();
    
    // Get the share link from the modal
    const shareInput = this.page.getByRole('textbox', { name: /share link/i });
    const shareLink = await shareInput.inputValue();
    
    // Close modal
    const closeButton = this.page.getByRole('button', { name: /close/i });
    await closeButton.click();
    
    return shareLink;
  }

  async waitForConditionalField(fieldLabel: string, shouldBeVisible: boolean) {
    await this.waitForFieldVisible(fieldLabel, shouldBeVisible);
  }

  async fillFormSection(sectionData: Record<string, any>) {
    for (const [fieldLabel, value] of Object.entries(sectionData)) {
      if (await this.isFieldVisible(fieldLabel)) {
        await this.fillField(fieldLabel, value);
      }
    }
  }

  async completeForm(formData: Record<string, any>) {
    // Fill all fields in the form
    for (const [fieldLabel, value] of Object.entries(formData)) {
      // Wait for field to be visible (handles conditional logic)
      if (await this.isFieldVisible(fieldLabel)) {
        await this.fillField(fieldLabel, value);
        
        // Wait for any conditional logic to update
        await this.page.waitForTimeout(100);
      }
    }
    
    // Submit the form
    await this.submitForm();
  }
}