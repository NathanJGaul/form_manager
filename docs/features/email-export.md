# Email Export Feature

## Overview

The Email Export feature allows users to send form submission data via email immediately after submitting a form. This provides a convenient way to share form data with others without needing to manually export and attach files.

## How It Works

1. **Form Submission**: When a user submits a form, the data is saved as usual
2. **Email Prompt**: A modal appears asking if the user wants to email the form data
3. **Configuration**: Users can:
   - Enter the recipient's email address
   - Customize the CSV filename
   - Skip the email step if desired
4. **Email Generation**: The system generates a CSV export and opens the user's default email client

## User Interface

The email prompt modal includes:
- **Recipient Email Field**: Required field with email validation
- **CSV Filename Field**: Pre-filled with template name, customizable
- **Send Email Button**: Opens email client with pre-filled content
- **Skip Button**: Closes modal and returns to dashboard

## Technical Implementation

### Components
- `EmailPromptModal`: The modal component that handles the email workflow
- Integration in `AppRouter`: Replaces the basic submission alert

### Current Implementation
The feature currently uses a `mailto:` link approach which:
- Works without backend infrastructure
- Opens the user's default email client
- Includes CSV data in the email body (due to browser limitations on attachments)

### Future Enhancements
- **EmailJS Integration**: For direct email sending without opening email client
- **Backend Service**: For proper CSV attachments and better reliability
- **Email Templates**: Customizable email templates with branding
- **Multiple Recipients**: Support for sending to multiple email addresses

## Usage Example

```typescript
// The modal is automatically triggered after form submission
// Users see:
// 1. Email input field
// 2. Filename input (e.g., "JCC2_Questionnaire_submission.csv")
// 3. Send Email button
// 4. Skip button
```

## Security Considerations

- No API keys are exposed in the frontend
- Email validation prevents invalid addresses
- Users must actively choose to send emails (opt-in)
- CSV data is generated using existing secure export methods

## Browser Compatibility

The current implementation works across all modern browsers that support:
- `mailto:` links
- Blob URLs for file generation
- Modern JavaScript features

## Configuration

No additional configuration is required. The feature works out of the box with the existing form management system.