import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  async navigateTo(path: string) {
    await this.page.goto(path);
    await this.waitForLoadComplete();
  }

  async waitForLoadComplete() {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForAutoSave() {
    // Wait for the saving indicator to appear and disappear
    const savingIndicator = this.page.getByText('Saving...');
    const savedIndicator = this.page.getByText('Saved');
    
    // Wait for saving to start (if it does)
    await savingIndicator.waitFor({ state: 'visible', timeout: 1000 }).catch(() => {});
    // Wait for saved state
    await savedIndicator.waitFor({ state: 'visible', timeout: 5000 });
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `tests/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async getToastMessage(): Promise<string | null> {
    const toast = this.page.locator('[role="alert"]');
    try {
      await toast.waitFor({ state: 'visible', timeout: 5000 });
      return await toast.textContent();
    } catch {
      return null;
    }
  }

  async waitForToastMessage(expectedText: string | RegExp) {
    const toast = this.page.locator('[role="alert"]');
    await toast.filter({ hasText: expectedText }).waitFor({ state: 'visible' });
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  async getLocalStorageItem(key: string): Promise<any> {
    return await this.page.evaluate((k) => {
      const item = localStorage.getItem(k);
      return item ? JSON.parse(item) : null;
    }, key);
  }

  async setLocalStorageItem(key: string, value: any) {
    await this.page.evaluate(({ k, v }) => {
      localStorage.setItem(k, JSON.stringify(v));
    }, { k: key, v: value });
  }

  async waitForFieldVisible(fieldLabel: string, shouldBeVisible = true) {
    const field = this.page.getByLabel(fieldLabel);
    if (shouldBeVisible) {
      await field.waitFor({ state: 'visible' });
    } else {
      await field.waitFor({ state: 'hidden' });
    }
  }

  async fillTextField(label: string, value: string) {
    const field = this.page.getByLabel(label);
    await field.fill(value);
  }

  async selectOption(label: string, value: string) {
    const select = this.page.getByLabel(label);
    await select.selectOption(value);
  }

  async checkCheckbox(label: string, check = true) {
    const checkbox = this.page.getByLabel(label);
    if (check) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  async selectRadioOption(groupLabel: string, optionValue: string) {
    const radioGroup = this.page.locator(`fieldset:has-text("${groupLabel}")`);
    await radioGroup.getByLabel(optionValue).check();
  }
}