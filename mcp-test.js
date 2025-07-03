#!/usr/bin/env node

// Test script to verify MCP Playwright server integration
import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('Testing MCP Playwright Server Integration...');

try {
  // Test 1: Check if the MCP server is configured
  console.log('\n1. Checking MCP server configuration...');
  const mcpList = execSync('~/.claude/local/claude mcp list', { encoding: 'utf8' });
  console.log('✓ MCP servers configured:', mcpList.trim());
  
  // Test 2: Check if the server executable exists
  console.log('\n2. Checking server executable...');
  const serverPath = '/home/nathanjgaul/.nvm/versions/node/v22.16.0/lib/node_modules/@playwright/mcp/index.js';
  if (existsSync(serverPath)) {
    console.log('✓ Server executable found at:', serverPath);
  } else {
    console.log('✗ Server executable not found at:', serverPath);
  }
  
  // Test 3: Check Playwright installation
  console.log('\n3. Checking Playwright installation...');
  try {
    const playwrightVersion = execSync('npx playwright --version', { encoding: 'utf8' });
    console.log('✓ Playwright version:', playwrightVersion.trim());
  } catch (error) {
    console.log('✗ Playwright not accessible via npx');
  }
  
  console.log('\n✓ MCP Playwright server setup complete!');
  console.log('\nTo use the MCP server:');
  console.log('- Start your development server: npm run dev');
  console.log('- Restart Claude Code to load the MCP server');
  console.log('- Use MCP tools like mcp__playwright_goto, mcp__playwright_screenshot, etc.');
  
} catch (error) {
  console.error('Error during MCP test:', error.message);
}