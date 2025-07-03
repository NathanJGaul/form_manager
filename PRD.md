I have a large number of questionnaires and data collection forms from a recent test. I need to digitize all the data filled out on the forms. Below are the necessary features:

- no hosting required: exist in a self contained single HTML file
- constantly save progress on the form(s) into browser memory: no data can be lost
- be able to manage multiple form types from multiple users from the home screen/dashboard
- easy to use, consistent styling, custom question types
- data is exportable via CSV
  - each form type will have the same data fields
  - each instance of a form will be a row in the CSV
  - each form type will have (with all instances) will have an individual exportable CSV

Enhanced

Create a standalone HTML form management system with the following specifications:

CORE REQUIREMENTS:
1. Single HTML file implementation
   - No external dependencies or hosting needed
   - All JavaScript, CSS, and functionality self-contained
   - Runs entirely in the browser

2. Data Persistence
   - Implement automatic save functionality using localStorage/IndexedDB
   - Save form data on every field change
   - Include timestamp for last save
   - Provide visual confirmation of save status

3. Form Management Dashboard
   - Create distinct sections for different form types
   - Allow creation of new form instances
   - Display progress/completion status for each form
   - Enable form template management
   - Include search and filter capabilities

4. User Interface
   - Implement responsive, mobile-friendly design
   - Use consistent styling across all components
   - Include the following question types:
     * Single/multiple choice
     * Text input (short/long)
     * Number fields
     * Date picker
     * Checkboxes
     * File upload (images only)
   - Provide clear navigation between forms
   - Include form completion progress indicator
   - implement sections that are enabled/disabled based on logic from previous question responses

5. Data Export Functionality
   - Generate separate CSV files for each form type
   - Include the following in exports:
     * All form fields
     * Submission timestamp
     * User identifier
     * Form instance ID
   - Enable bulk export of all forms
   - Provide data preview before export
   - Include error handling for malformed data

TECHNICAL CONSTRAINTS:
- Must work offline
- Support major browsers (Chrome, Firefox, Safari)
- Maximum file size: 5MB
- Minimum screen size support: 320px width

Please create this system with a focus on reliability and user experience, ensuring no data loss occurs during usage.
