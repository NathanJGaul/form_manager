# Troubleshooting: Email Client Not Opening

If the email client is not opening when you click "Send Email" in the form submission modal, here are some troubleshooting steps:

## Quick Fixes

1. **Check Browser Console**: Open your browser's Developer Tools (F12) and check the Console tab for any error messages when clicking "Send Email"

2. **Use the Download CSV Fallback**: After clicking "Send Email", a yellow box will appear with a "Download CSV" button. Use this to download the CSV file and attach it manually to your email.

3. **Check Default Email Client**: Ensure you have a default email client configured on your system:
   - **Windows**: Settings > Apps > Default apps > Email
   - **macOS**: Mail app > Preferences > General > Default email reader
   - **Linux**: Check your desktop environment's default applications settings

## Browser-Specific Issues

### Chrome/Edge
- Check if pop-ups are blocked for the site
- Try allowing pop-ups: Click the blocked pop-up icon in the address bar

### Firefox
- Check if `network.protocol-handler.external.mailto` is enabled in `about:config`
- Ensure Firefox is configured to handle mailto links

### Safari
- Check Safari > Preferences > General > Default email reader

## Testing Mailto Support

1. Open the test page: `/test-mailto.html` in your browser
2. Try each method to see which one works on your system
3. Check if simple mailto links work at all

## Alternative Solutions

### Manual Process
1. Click "Download CSV" to get the form data
2. Open your email client manually
3. Compose a new email
4. Attach the downloaded CSV file

### System Configuration
- **No Email Client**: If you don't have a desktop email client installed, mailto links won't work. Use webmail instead:
  1. Download the CSV using the fallback button
  2. Go to your webmail (Gmail, Outlook.com, etc.)
  3. Compose new email and attach the CSV file

### Developer Mode
If you're a developer testing this feature:
1. Check the browser console for debug messages
2. The console will show the email link details and any errors
3. You can copy the generated mailto link from the console and test it directly

## Debug Information

When clicking "Send Email", the console will log:
```javascript
Email link generated: {
  recipientEmail: "...",
  subject: "...",
  bodyLength: ...,
  fullLinkLength: ...
}
```

If the link length is over 2000 characters, the system will automatically shorten it and prompt you to attach the CSV manually.