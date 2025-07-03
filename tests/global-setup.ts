import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Global setup for debugging
  if (process.env.DEBUG_MODE) {
    console.log('Running in debug mode');
  }
  
  // You can add global setup logic here
  // For example, starting a test database, seeding data, etc.
  
  return undefined;
}

export default globalSetup;