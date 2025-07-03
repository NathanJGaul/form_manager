# Playwright Testing Setup

This project now includes Playwright for end-to-end testing and debugging.

## Available Commands

- `npm test` - Run all tests
- `npm run test:ui` - Run tests with UI mode (interactive)
- `npm run test:headed` - Run tests in headed mode (visible browser)
- `npm run test:debug` - Run tests in debug mode (step through)

## Debugging Options

### 1. Debug Mode
```bash
npm run test:debug
```
This opens the Playwright Inspector where you can:
- Step through test actions
- Inspect DOM elements
- View console logs
- Set breakpoints

### 2. UI Mode
```bash
npm run test:ui
```
Interactive mode with:
- Visual test runner
- Time-travel debugging
- DOM snapshots
- Network requests

### 3. Headed Mode
```bash
npm run test:headed
```
Runs tests in visible browser windows for observation.

### 4. VS Code Integration
Use the launch configurations in `.vscode/launch.json`:
- "Debug Playwright Tests" - Debug all tests
- "Debug Playwright Test (Current File)" - Debug current file

## Test Structure

Tests are organized in the `/tests` directory:
- `app.spec.ts` - Main app functionality
- `form-builder.spec.ts` - Form creation and editing
- `dashboard.spec.ts` - Dashboard and data management

## Configuration

The `playwright.config.ts` file includes:
- Multiple browser support (Chrome, Firefox, Safari)
- Screenshot/video capture on failure
- Trace recording for debugging
- Automatic dev server startup

## Reports

After running tests, view the HTML report:
```bash
npx playwright show-report
```

## Tips for Debugging

1. **Add console.log()** in your tests to track execution
2. **Use page.pause()** to stop execution and inspect manually
3. **Set breakpoints** in VS Code for step-by-step debugging
4. **Use locator.highlight()** to visually identify elements
5. **Check network tab** in UI mode for API calls

## Common Issues

- If tests fail to start, ensure the dev server is running on port 5173
- For system library warnings, they don't affect test execution
- Use `--headed` flag to see what's happening in real-time