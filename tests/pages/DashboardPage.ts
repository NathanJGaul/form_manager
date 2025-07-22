import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  // Locators
  readonly searchInput = this.page.getByPlaceholder('Search templates...');
  readonly newTemplateButton = this.page.getByRole('button', { name: /new template/i });
  readonly templatesTab = this.page.getByRole('tab', { name: /templates/i });
  readonly instancesTab = this.page.getByRole('tab', { name: /instances/i });
  readonly submissionsTab = this.page.getByRole('tab', { name: /submissions/i });

  async goto() {
    await this.navigateTo('/');
  }

  async searchTemplates(query: string) {
    await this.searchInput.fill(query);
    // Wait for search results to update
    await this.page.waitForTimeout(300); // Debounce delay
  }

  async getTemplateCard(templateName: string) {
    return this.page.locator('[data-testid="template-card"]').filter({ hasText: templateName });
  }

  async startForm(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    const startButton = card.getByRole('button', { name: /start/i });
    await startButton.click();
  }

  async editTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    const editButton = card.getByRole('button', { name: /edit/i });
    await editButton.click();
  }

  async deleteTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    const deleteButton = card.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();
  }

  async duplicateTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    const duplicateButton = card.getByRole('button', { name: /duplicate/i });
    await duplicateButton.click();
  }

  async exportTemplate(templateName: string) {
    const card = await this.getTemplateCard(templateName);
    const exportButton = card.getByRole('button', { name: /export/i });
    
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await exportButton.click();
    
    return await downloadPromise;
  }

  async importTemplate() {
    const importButton = this.page.getByRole('button', { name: /import/i });
    await importButton.click();
  }

  async switchToInstances() {
    await this.instancesTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async switchToSubmissions() {
    await this.submissionsTab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getInstanceCard(instanceId: string) {
    return this.page.locator('[data-testid="instance-card"]').filter({ hasText: instanceId });
  }

  async continueInstance(instanceId: string) {
    const card = await this.getInstanceCard(instanceId);
    const continueButton = card.getByRole('button', { name: /continue/i });
    await continueButton.click();
  }

  async deleteInstance(instanceId: string) {
    const card = await this.getInstanceCard(instanceId);
    const deleteButton = card.getByRole('button', { name: /delete/i });
    await deleteButton.click();
    
    // Confirm deletion
    const confirmButton = this.page.getByRole('button', { name: /confirm/i });
    await confirmButton.click();
  }

  async getSubmissionCard(submissionId: string) {
    return this.page.locator('[data-testid="submission-card"]').filter({ hasText: submissionId });
  }

  async viewSubmission(submissionId: string) {
    const card = await this.getSubmissionCard(submissionId);
    const viewButton = card.getByRole('button', { name: /view/i });
    await viewButton.click();
  }

  async exportSubmissionAsPDF(submissionId: string) {
    const card = await this.getSubmissionCard(submissionId);
    const exportButton = card.getByRole('button', { name: /export pdf/i });
    
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await exportButton.click();
    
    return await downloadPromise;
  }

  async exportSubmissionAsCSV(submissionId: string) {
    const card = await this.getSubmissionCard(submissionId);
    const exportButton = card.getByRole('button', { name: /export csv/i });
    
    // Set up download promise before clicking
    const downloadPromise = this.page.waitForEvent('download');
    await exportButton.click();
    
    return await downloadPromise;
  }

  async getTemplateCount(): Promise<number> {
    const cards = await this.page.locator('[data-testid="template-card"]').all();
    return cards.length;
  }

  async getInstanceCount(): Promise<number> {
    await this.switchToInstances();
    const cards = await this.page.locator('[data-testid="instance-card"]').all();
    return cards.length;
  }

  async getSubmissionCount(): Promise<number> {
    await this.switchToSubmissions();
    const cards = await this.page.locator('[data-testid="submission-card"]').all();
    return cards.length;
  }

  async waitForTemplateListUpdate() {
    // Wait for any loading indicators to disappear
    await this.page.locator('[data-testid="loading-spinner"]').waitFor({ state: 'hidden' }).catch(() => {});
    await this.page.waitForLoadState('networkidle');
  }
}