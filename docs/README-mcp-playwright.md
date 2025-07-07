# MCP Playwright Server Setup

This project is now configured with the official Microsoft Playwright MCP (Model Context Protocol) server, enabling Claude Code to interact with your web application directly through browser automation.

## What is MCP Playwright?

The MCP Playwright server provides browser automation capabilities through the Model Context Protocol, allowing Claude Code to:
- Navigate web pages
- Take screenshots
- Interact with page elements
- Execute JavaScript
- Extract content from pages
- Test user interactions

## Configuration

The MCP server is configured and ready to use:

✅ **Server Installed**: `@playwright/mcp` (official Microsoft package)
✅ **Server Configured**: Added to Claude Code MCP configuration
✅ **Playwright Ready**: Browser binaries installed and configured

## Available MCP Tools

When the MCP server is active, you'll have access to these tools with the `mcp__` prefix:

### Navigation & Page Control
- `mcp__playwright_goto` - Navigate to a URL
- `mcp__playwright_back` - Go back in browser history
- `mcp__playwright_forward` - Go forward in browser history
- `mcp__playwright_reload` - Reload the current page

### Element Interaction
- `mcp__playwright_click` - Click on elements
- `mcp__playwright_fill` - Fill form fields
- `mcp__playwright_select` - Select dropdown options
- `mcp__playwright_check` - Check/uncheck checkboxes
- `mcp__playwright_hover` - Hover over elements

### Content Extraction
- `mcp__playwright_screenshot` - Take page screenshots
- `mcp__playwright_get_title` - Get page title
- `mcp__playwright_get_url` - Get current URL
- `mcp__playwright_get_content` - Extract page content
- `mcp__playwright_find_element` - Find elements by selector

### JavaScript Execution
- `mcp__playwright_evaluate` - Execute JavaScript in the page context

## Usage Examples

### Start Your Development Server
```bash
npm run dev
```

### Example MCP Commands
Once Claude Code is restarted and the MCP server is loaded, you can use commands like:

```
Take a screenshot of the homepage
Navigate to the form builder
Fill out a form and submit it
Test the dashboard functionality
```

## Debugging & Development

### Configuration Files
- **Global**: `~/.config/claude-code/claude_code_config.json`
- **Project**: `.claude-code/mcp.json`

### Environment Variables
The MCP server is configured with:
- `PLAYWRIGHT_HEADLESS=false` - Shows browser window
- `PLAYWRIGHT_SLOW_MO=1000` - Slows down actions for visibility
- `PLAYWRIGHT_BASE_URL=http://localhost:5173` - Your dev server URL

### Testing the Setup
Run the verification script:
```bash
node mcp-test.js
```

## Troubleshooting

### Common Issues

1. **MCP Server Not Found**
   - Ensure Claude Code is restarted after configuration
   - Check that the server path is correct in the configuration

2. **Browser Not Opening**
   - Verify your dev server is running on port 5173
   - Check that Playwright browsers are installed: `npx playwright install`

3. **Tools Not Available**
   - Look for `mcp__` prefixed tools in Claude Code
   - Ensure the MCP server is properly configured and running

### Verification Steps
1. ✅ Development server running (`npm run dev`)
2. ✅ Claude Code restarted
3. ✅ MCP tools available with `mcp__` prefix
4. ✅ Browser automation working

## Integration with Existing Tests

The MCP server complements your existing Playwright test suite:
- **MCP**: Interactive testing and debugging with Claude Code
- **Test Suite**: Automated testing with `npm test`

Both use the same Playwright installation and configuration, ensuring consistency across your testing workflow.

## Next Steps

With MCP Playwright configured, you can now:
1. Ask Claude Code to test specific user flows
2. Generate screenshots for documentation
3. Debug form interactions interactively
4. Automate repetitive testing tasks
5. Extract data from your application

The MCP server provides a powerful interface for Claude Code to understand and interact with your web application directly.