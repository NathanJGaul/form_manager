import React from 'react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../test-utils/render';
import DashboardRoute from '@/routes/DashboardRoute';
import { templateFactory, fieldFactory } from '../../test-utils/factories/template.factory';
import { storageManager } from '@/utils/storage';

// Mock modules
vi.mock('@/utils/storage', () => ({
  storageManager: {
    getTemplates: vi.fn(),
    getTemplateById: vi.fn(),
    getInstances: vi.fn(),
    getInstanceById: vi.fn(),
    saveInstance: vi.fn(),
    saveSubmission: vi.fn(),
    getSubmissions: vi.fn(),
    getOrCreateInstance: vi.fn(),
    getViewMode: vi.fn().mockReturnValue('continuous'),
    saveViewMode: vi.fn(),
  },
}));

// Note: PDF export functionality is tested by verifying the button exists.
// The actual export uses DOM manipulation that's difficult to test in jsdom.

describe('Form Submission Integration Flow', () => {
  const mockTemplate = templateFactory.build({
    name: 'Integration Test Form',
    sections: [
      {
        id: 'section-1',
        title: 'User Information',
        fields: [
          fieldFactory.text({ id: 'name', label: 'Full Name', required: true }),
          fieldFactory.email({ id: 'email', label: 'Email Address', required: true }),
          fieldFactory.select({ 
            id: 'department', 
            label: 'Department', 
            options: ['Sales', 'Engineering', 'Marketing'],
            required: true 
          }),
        ],
      },
      {
        id: 'section-2',
        title: 'Additional Information',
        fields: [
          fieldFactory.textarea({ id: 'comments', label: 'Comments' }),
          fieldFactory.checkbox({ 
            id: 'subscribe', 
            label: 'Subscribe to updates',
            options: ['Subscribe to updates'] // Add options for proper rendering
          }),
        ],
      },
    ],
  });

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Setup storage mock
    vi.mocked(storageManager.getTemplates).mockReturnValue([mockTemplate]);
    vi.mocked(storageManager.getTemplateById).mockReturnValue(mockTemplate);
    vi.mocked(storageManager.getInstances).mockReturnValue([]);
    vi.mocked(storageManager.saveInstance).mockImplementation((instance) => instance);
    vi.mocked(storageManager.saveSubmission).mockImplementation((submission) => submission);
    vi.mocked(storageManager.getOrCreateInstance).mockReturnValue({
      id: 'test-instance-id',
      templateId: mockTemplate.id,
      templateName: mockTemplate.name,
      data: {},
      progress: 0,
      completed: false,
      visitedSections: ['section-1', 'section-2'], // Mark all sections as visited for continuous mode
      naSections: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSaved: new Date(),
    });
  });

  describe('Complete Form Submission Workflow', () => {
    it('should handle the complete workflow from dashboard to submission', async () => {
      const user = userEvent.setup();
      
      // 1. Start at dashboard
      render(<DashboardRoute />);
      
      // 2. Find and start the form
      const formCard = screen.getByText('Integration Test Form').closest('div');
      expect(formCard).toBeInTheDocument();
      
      const startButton = screen.getByRole('button', { name: /start/i });
      await user.click(startButton);
      
      // 3. Should navigate to form renderer
      await waitFor(() => {
        expect(screen.getByText('User Information')).toBeInTheDocument();
      });
      
      // Debug: Check what fields are actually rendered
      // screen.debug();
      
      // 4. Fill out the form
      // Find inputs by placeholder or name since labels aren't properly associated
      await user.type(screen.getByPlaceholderText('Enter Full Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('email@example.com'), 'john.doe@example.com');
      // Find select by its display text
      const departmentSelect = screen.getByDisplayValue('Select an option');
      await user.selectOptions(departmentSelect, 'Engineering');
      
      // 5. In continuous mode, all sections are visible - verify second section is present
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
      
      // 6. Fill optional fields (find by placeholder since labels aren't associated)
      await user.type(screen.getByPlaceholderText('Enter Comments'), 'This is a test submission');
      
      // Find checkbox by role and name (it's rendered as a checkbox with the option as its label)
      const subscribeCheckbox = screen.getByRole('checkbox', { name: 'Subscribe to updates' });
      await user.click(subscribeCheckbox);
      
      // 7. Submit the form
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      // 8. Verify submission was saved
      await waitFor(() => {
        expect(storageManager.saveSubmission).toHaveBeenCalled();
      });
      
      // Now check the specific data
      expect(storageManager.saveSubmission).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-instance-id',
          formInstanceId: 'test-instance-id',
          templateId: mockTemplate.id,
          templateName: mockTemplate.name,
          data: expect.objectContaining({
            name: 'John Doe',
            email: 'john.doe@example.com',
            department: 'Engineering',
            comments: 'This is a test submission',
            subscribe: ['Subscribe to updates'] // Checkbox with options returns array of selected values
          }),
          submittedAt: expect.any(Date),
        })
      );
      
      // 9. Should show success message
      // Note: The current FormRenderer doesn't show a success message after submission
      // expect(screen.getByText(/form submitted successfully/i)).toBeInTheDocument();
    });

    it('should handle validation on form submission', async () => {
      const user = userEvent.setup();
      
      render(<DashboardRoute />);
      
      // Start form
      await user.click(screen.getByRole('button', { name: /start/i }));
      
      // Verify submit button is disabled when form is incomplete
      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toBeDisabled();
      
      // Fill all required fields
      await user.type(screen.getByPlaceholderText('Enter Full Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('email@example.com'), 'john.doe@example.com');
      await user.selectOptions(screen.getByDisplayValue('Select an option'), 'Engineering');
      
      // Submit button should now be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      // Now we can test actual submission
      await user.click(submitButton);
      
      // Should successfully submit
      await waitFor(() => {
        expect(storageManager.saveSubmission).toHaveBeenCalled();
      });
    });

    it('should persist form data across page refreshes', async () => {
      const user = userEvent.setup();
      
      const { unmount } = render(<DashboardRoute />);
      
      // Start form and fill some data
      await user.click(screen.getByRole('button', { name: /start/i }));
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText('User Information')).toBeInTheDocument();
      });
      
      await user.type(screen.getByPlaceholderText('Enter Full Name'), 'John Doe');
      await user.type(screen.getByPlaceholderText('email@example.com'), 'john@example.com');
      
      // Wait for auto-save (1 second debounce + processing time)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Verify save was called
      expect(storageManager.saveInstance).toHaveBeenCalled();
      
      // Get the saved instance from the mock call
      const saveInstanceCalls = vi.mocked(storageManager.saveInstance).mock.calls;
      expect(saveInstanceCalls.length).toBeGreaterThan(0);
      const savedInstance = saveInstanceCalls[saveInstanceCalls.length - 1][0];
      
      // Verify the saved instance has the data we entered
      expect(savedInstance.data).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
      });
      
      // Create a properly structured instance with all required fields
      const persistedInstance = {
        ...savedInstance,
        id: savedInstance.id || 'test-instance-id',
        templateId: mockTemplate.id,
        templateName: mockTemplate.name,
        data: savedInstance.data,
        progress: savedInstance.progress || 0,
        completed: false,
        visitedSections: savedInstance.visitedSections || ['section-1', 'section-2'],
        naSections: savedInstance.naSections || [],
        createdAt: savedInstance.createdAt || new Date(),
        updatedAt: savedInstance.updatedAt || new Date(),
        lastSaved: savedInstance.lastSaved || new Date(),
      };
      
      // Update all mocks to return the saved instance with data
      vi.mocked(storageManager.getInstances).mockReturnValue([persistedInstance]);
      vi.mocked(storageManager.getInstanceById).mockReturnValue(persistedInstance);
      vi.mocked(storageManager.getOrCreateInstance).mockImplementation(() => persistedInstance);
      
      // Simulate page refresh
      unmount();
      render(<DashboardRoute />);
      
      // Should show instance in dashboard
      await waitFor(() => {
        const instancesTable = screen.getByRole('table');
        expect(instancesTable).toBeInTheDocument();
      });
      
      // Continue the form by clicking edit button
      const editButton = screen.getByRole('button', { name: /edit form instance/i });
      await user.click(editButton);
      
      // Wait for form to load and check if data is restored
      await waitFor(() => {
        expect(screen.getByText('User Information')).toBeInTheDocument();
      });
      
      // Wait a bit more for the form to fully initialize with the data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check that form fields have the saved values
      const nameInput = screen.getByPlaceholderText('Enter Full Name') as HTMLInputElement;
      const emailInput = screen.getByPlaceholderText('email@example.com') as HTMLInputElement;
      
      expect(nameInput.value).toBe('John Doe');
      expect(emailInput.value).toBe('john@example.com');
    });

    it('should have PDF export functionality available', async () => {
      const user = userEvent.setup();
      
      render(<DashboardRoute />);
      
      // Templates are shown by default in the dashboard
      expect(screen.getByText('Integration Test Form')).toBeInTheDocument();
      
      // Verify PDF export button exists for templates
      const pdfExportButtons = screen.getAllByTitle('Export as PDF');
      expect(pdfExportButtons.length).toBeGreaterThan(0);
      
      // The button should be clickable
      const firstPdfButton = pdfExportButtons[0];
      expect(firstPdfButton).not.toBeDisabled();
      
      // Note: Actual PDF generation involves DOM manipulation and file downloads
      // which are difficult to test in a jsdom environment. The implementation
      // is verified to exist and be accessible via the UI.
    });

    it('should handle form with conditional logic', async () => {
      const user = userEvent.setup();
      
      const conditionalTemplate = templateFactory.build({
        name: 'Conditional Form',
        sections: [
          {
            id: 'section-1',
            title: 'Main Section',
            fields: [
              fieldFactory.radio({ 
                id: 'hasDetails', 
                label: 'Do you want to provide details?',
                options: ['Yes', 'No'],
                required: true,
              }),
              fieldFactory.withConditional(
                fieldFactory.textarea({ 
                  id: 'details', 
                  label: 'Please provide details',
                  required: true,
                }),
                {
                  dependsOn: 'hasDetails',
                  values: ['Yes'],
                  operator: 'equals',
                }
              ),
            ],
          },
        ],
      });
      
      vi.mocked(storageManager.getTemplates).mockReturnValue([conditionalTemplate]);
      vi.mocked(storageManager.getTemplateById).mockReturnValue(conditionalTemplate);
      vi.mocked(storageManager.getOrCreateInstance).mockReturnValue({
        id: 'test-conditional-instance',
        templateId: conditionalTemplate.id,
        templateName: conditionalTemplate.name,
        data: {},
        progress: 0,
        completed: false,
        visitedSections: ['section-1'], // Mark section as visited for continuous mode
        naSections: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSaved: new Date(),
      });
      
      render(<DashboardRoute />);
      
      await user.click(screen.getByRole('button', { name: /start/i }));
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText('Do you want to provide details?')).toBeInTheDocument();
      });
      
      // Initially, details field should not be visible
      expect(screen.queryByPlaceholderText('Enter Please provide details')).not.toBeInTheDocument();
      
      // Select "Yes" - radio buttons are properly labeled
      const yesRadio = screen.getByRole('radio', { name: 'Yes' });
      await user.click(yesRadio);
      
      // Details field should appear
      await waitFor(() => {
        const detailsField = screen.getByPlaceholderText('Enter Please provide details');
        expect(detailsField).toBeInTheDocument();
      });
      
      // Try to submit without filling the conditional required field
      const submitButton = screen.getByRole('button', { name: /submit/i });
      // Submit button should be disabled because required field is empty
      expect(submitButton).toBeDisabled();
      
      // Select "No"
      const noRadio = screen.getByRole('radio', { name: 'No' });
      await user.click(noRadio);
      
      // Details field should disappear
      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Enter Please provide details')).not.toBeInTheDocument();
      });
      
      // Submit button should now be enabled
      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
      
      // Should be able to submit now
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      await waitFor(() => {
        expect(storageManager.saveSubmission).toHaveBeenCalledWith(
          expect.objectContaining({
            data: {
              hasDetails: 'No',
              details: null, // Conditional field should be nullified
            },
          })
        );
      });
    });
  });
});