import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../test-utils/render';
import { DashboardRoute } from '@/routes/DashboardRoute';
import { templateFactory, fieldFactory } from '../../test-utils/factories/template.factory';
import { storageManager } from '@/utils/storage';
import { PDFDocument } from 'pdf-lib';

// Mock modules
vi.mock('@/utils/storage');
vi.mock('pdf-lib');

describe('Form Submission Integration Flow', () => {
  const mockTemplate = templateFactory.build({
    name: 'Integration Test Form',
    sections: [
      {
        id: 'section-1',
        title: 'User Information',
        fields: [
          fieldFactory.text({ id: 'name', label: 'Full Name', required: true }),
          fieldFactory.email({ id: 'email', label: 'Email', required: true }),
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
          fieldFactory.checkbox({ id: 'subscribe', label: 'Subscribe to updates' }),
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
    
    // Setup PDF mock
    const mockPdfDoc = {
      save: vi.fn().mockResolvedValue(new Uint8Array()),
    };
    vi.mocked(PDFDocument.create).mockResolvedValue(mockPdfDoc as any);
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
      
      // 4. Fill out the form
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
      await user.selectOptions(screen.getByLabelText('Department'), 'Engineering');
      
      // 5. Navigate to next section
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      await waitFor(() => {
        expect(screen.getByText('Additional Information')).toBeInTheDocument();
      });
      
      // 6. Fill optional fields
      await user.type(screen.getByLabelText('Comments'), 'This is a test submission');
      await user.click(screen.getByLabelText('Subscribe to updates'));
      
      // 7. Submit the form
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      // 8. Verify submission was saved
      await waitFor(() => {
        expect(storageManager.saveSubmission).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: mockTemplate.id,
            data: {
              name: 'John Doe',
              email: 'john.doe@example.com',
              department: 'Engineering',
              comments: 'This is a test submission',
              subscribe: true,
            },
            completed: true,
          })
        );
      });
      
      // 9. Should show success message
      expect(screen.getByText(/form submitted successfully/i)).toBeInTheDocument();
    });

    it('should handle validation across sections', async () => {
      const user = userEvent.setup();
      
      render(<DashboardRoute />);
      
      // Start form
      await user.click(screen.getByRole('button', { name: /start/i }));
      
      // Try to navigate to next section without filling required fields
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      // Should show validation errors
      await waitFor(() => {
        expect(screen.getAllByText('This field is required')).toHaveLength(3);
      });
      
      // Should not navigate
      expect(screen.getByText('User Information')).toBeInTheDocument();
      
      // Fill one field and try again
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.click(screen.getByRole('button', { name: /next/i }));
      
      // Should still show errors for remaining fields
      expect(screen.getAllByText('This field is required')).toHaveLength(2);
    });

    it('should persist form data across page refreshes', async () => {
      const user = userEvent.setup();
      
      const { unmount } = render(<DashboardRoute />);
      
      // Start form and fill some data
      await user.click(screen.getByRole('button', { name: /start/i }));
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email'), 'john@example.com');
      
      // Wait for auto-save
      await waitFor(() => {
        expect(storageManager.saveInstance).toHaveBeenCalled();
      }, { timeout: 3000 });
      
      // Get the saved instance
      const savedInstance = vi.mocked(storageManager.saveInstance).mock.calls[0][0];
      vi.mocked(storageManager.getInstances).mockReturnValue([savedInstance]);
      vi.mocked(storageManager.getInstanceById).mockReturnValue(savedInstance);
      
      // Simulate page refresh
      unmount();
      render(<DashboardRoute />);
      
      // Should show instance in dashboard
      expect(screen.getByText(/in progress/i)).toBeInTheDocument();
      
      // Continue the form
      const continueButton = screen.getByRole('button', { name: /continue/i });
      await user.click(continueButton);
      
      // Should restore form data
      await waitFor(() => {
        expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
      });
    });

    it('should handle PDF export after submission', async () => {
      const user = userEvent.setup();
      
      // Complete a form submission
      const completedSubmission = {
        id: 'submission-1',
        templateId: mockTemplate.id,
        templateName: mockTemplate.name,
        data: {
          name: 'John Doe',
          email: 'john@example.com',
          department: 'Engineering',
        },
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      vi.mocked(storageManager.getSubmissions).mockReturnValue([completedSubmission]);
      
      render(<DashboardRoute />);
      
      // Go to submissions tab
      await user.click(screen.getByRole('tab', { name: /submissions/i }));
      
      // Find the submission
      expect(screen.getByText('Integration Test Form')).toBeInTheDocument();
      
      // Export as PDF
      const exportButton = screen.getByRole('button', { name: /export pdf/i });
      await user.click(exportButton);
      
      // Verify PDF generation was called
      await waitFor(() => {
        expect(PDFDocument.create).toHaveBeenCalled();
      });
      
      // Should trigger download
      expect(screen.getByText(/PDF exported successfully/i)).toBeInTheDocument();
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
      
      render(<DashboardRoute />);
      
      await user.click(screen.getByRole('button', { name: /start/i }));
      
      // Initially, details field should not be visible
      expect(screen.queryByLabelText('Please provide details')).not.toBeInTheDocument();
      
      // Select "Yes"
      await user.click(screen.getByLabelText('Yes'));
      
      // Details field should appear
      await waitFor(() => {
        expect(screen.getByLabelText('Please provide details')).toBeInTheDocument();
      });
      
      // Try to submit without filling the conditional required field
      await user.click(screen.getByRole('button', { name: /submit/i }));
      
      // Should show validation error
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      
      // Select "No"
      await user.click(screen.getByLabelText('No'));
      
      // Details field should disappear
      await waitFor(() => {
        expect(screen.queryByLabelText('Please provide details')).not.toBeInTheDocument();
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