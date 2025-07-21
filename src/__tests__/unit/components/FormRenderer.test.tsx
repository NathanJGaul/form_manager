import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../test-utils/render';
import { FormRenderer } from '@/components/FormRenderer';
import { templateFactory, fieldFactory } from '../../test-utils/factories/template.factory';
import { instanceFactory } from '../../test-utils/factories/instance.factory';
import { storageManager } from '@/utils/storage';

// Mock the storage manager
vi.mock('@/utils/storage', () => ({
  storageManager: {
    getTemplateById: vi.fn(),
    saveInstance: vi.fn(),
    saveSubmission: vi.fn(),
    getInstanceById: vi.fn(),
  },
}));

// Mock the data sharing utility
vi.mock('@/utils/dataSharing', () => ({
  encodeForSharing: vi.fn().mockReturnValue('mock-share-string'),
}));

describe('FormRenderer', () => {
  const mockTemplate = templateFactory.complex();
  const mockInstance = instanceFactory.build({ templateId: mockTemplate.id });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(storageManager.getTemplateById).mockReturnValue(mockTemplate);
    vi.mocked(storageManager.getInstanceById).mockReturnValue(mockInstance);
  });

  describe('initialization', () => {
    it('should render template name and description', () => {
      render(<FormRenderer templateId={mockTemplate.id} />);

      expect(screen.getByText(mockTemplate.name)).toBeInTheDocument();
      expect(screen.getByText(mockTemplate.description)).toBeInTheDocument();
    });

    it('should load existing instance data', () => {
      const instanceWithData = instanceFactory.withData({
        'Full Name': 'John Doe',
        'Email Address': 'john@example.com',
      });
      vi.mocked(storageManager.getInstanceById).mockReturnValue(instanceWithData);

      render(<FormRenderer templateId={mockTemplate.id} instanceId={instanceWithData.id} />);

      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });

    it('should apply default values when no instance data', () => {
      const templateWithDefaults = templateFactory.withFields([
        fieldFactory.text({ 
          label: 'Default Field', 
          defaultValue: 'Default Value' 
        }),
      ]);
      vi.mocked(storageManager.getTemplateById).mockReturnValue(templateWithDefaults);

      render(<FormRenderer templateId={templateWithDefaults.id} />);

      expect(screen.getByDisplayValue('Default Value')).toBeInTheDocument();
    });

    it('should handle template not found', () => {
      vi.mocked(storageManager.getTemplateById).mockReturnValue(null);

      render(<FormRenderer templateId="non-existent" />);

      expect(screen.getByText(/template not found/i)).toBeInTheDocument();
    });
  });

  describe('field rendering', () => {
    it('should render all visible fields', () => {
      render(<FormRenderer templateId={mockTemplate.id} />);

      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
      expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should mark required fields', () => {
      render(<FormRenderer templateId={mockTemplate.id} />);

      const fullNameLabel = screen.getByText('Full Name');
      expect(fullNameLabel.textContent).toContain('*');
    });

    it('should render different field types correctly', async () => {
      const templateWithFieldTypes = templateFactory.withFields([
        fieldFactory.text({ label: 'Text Field' }),
        fieldFactory.textarea({ label: 'Textarea Field' }),
        fieldFactory.select({ label: 'Select Field', options: ['Option 1', 'Option 2'] }),
        fieldFactory.radio({ label: 'Radio Field', options: ['Yes', 'No'] }),
        fieldFactory.checkbox({ label: 'Checkbox Field' }),
        fieldFactory.date({ label: 'Date Field' }),
      ]);
      vi.mocked(storageManager.getTemplateById).mockReturnValue(templateWithFieldTypes);

      render(<FormRenderer templateId={templateWithFieldTypes.id} />);

      expect(screen.getByRole('textbox', { name: 'Text Field' })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: 'Textarea Field' })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: 'Select Field' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Yes' })).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: 'Checkbox Field' })).toBeInTheDocument();
      expect(screen.getByLabelText('Date Field')).toHaveAttribute('type', 'date');
    });
  });

  describe('conditional logic', () => {
    it('should show/hide fields based on conditions', async () => {
      const user = userEvent.setup();
      
      // Template has conditional field that shows when Department = Marketing
      render(<FormRenderer templateId={mockTemplate.id} />);

      // Initially, conditional section should not be visible
      expect(screen.queryByText('Additional Details')).not.toBeInTheDocument();

      // Select Marketing department
      const departmentSelect = screen.getByLabelText('Department');
      await user.selectOptions(departmentSelect, 'Marketing');

      // Conditional section should now be visible
      await waitFor(() => {
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
        expect(screen.getByLabelText('Comments')).toBeInTheDocument();
      });
    });

    it('should clear hidden field values', async () => {
      const user = userEvent.setup();
      const templateWithConditional = templateFactory.withFields([
        fieldFactory.radio({ 
          id: 'trigger',
          label: 'Show Field?', 
          options: ['Yes', 'No'] 
        }),
        fieldFactory.withConditional(
          fieldFactory.text({ id: 'conditional', label: 'Conditional Field' }),
          { dependsOn: 'trigger', values: ['Yes'], operator: 'equals' }
        ),
      ]);
      vi.mocked(storageManager.getTemplateById).mockReturnValue(templateWithConditional);

      render(<FormRenderer templateId={templateWithConditional.id} />);

      // Select Yes to show field
      await user.click(screen.getByLabelText('Yes'));
      const conditionalField = await screen.findByLabelText('Conditional Field');
      
      // Enter value
      await user.type(conditionalField, 'Test Value');
      expect(conditionalField).toHaveValue('Test Value');

      // Select No to hide field
      await user.click(screen.getByLabelText('No'));
      
      // Field should be hidden
      await waitFor(() => {
        expect(screen.queryByLabelText('Conditional Field')).not.toBeInTheDocument();
      });

      // Select Yes again - field should be empty
      await user.click(screen.getByLabelText('Yes'));
      const fieldAgain = await screen.findByLabelText('Conditional Field');
      expect(fieldAgain).toHaveValue('');
    });
  });

  describe('form validation', () => {
    it('should validate required fields on submit', async () => {
      const user = userEvent.setup();
      render(<FormRenderer templateId={mockTemplate.id} />);

      // Try to submit without filling required fields
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText('This field is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<FormRenderer templateId={mockTemplate.id} />);

      const emailField = screen.getByLabelText('Email Address');
      await user.type(emailField, 'invalid-email');
      await user.tab(); // Trigger blur

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should clear validation errors when field is corrected', async () => {
      const user = userEvent.setup();
      render(<FormRenderer templateId={mockTemplate.id} />);

      // Submit to trigger validation
      await user.click(screen.getByRole('button', { name: /submit/i }));
      expect(await screen.findByText('This field is required')).toBeInTheDocument();

      // Fill the field
      const nameField = screen.getByLabelText('Full Name');
      await user.type(nameField, 'John Doe');

      // Error should disappear
      await waitFor(() => {
        expect(screen.queryByText('This field is required')).not.toBeInTheDocument();
      });
    });
  });

  describe('data persistence', () => {
    it('should auto-save form data', async () => {
      const user = userEvent.setup();
      render(<FormRenderer templateId={mockTemplate.id} />);

      const nameField = screen.getByLabelText('Full Name');
      await user.type(nameField, 'John Doe');

      // Wait for debounced save
      await waitFor(() => {
        expect(storageManager.saveInstance).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              'Full Name': 'John Doe',
            }),
          })
        );
      }, { timeout: 3000 });
    });

    it('should show save indicator during auto-save', async () => {
      const user = userEvent.setup();
      render(<FormRenderer templateId={mockTemplate.id} />);

      const nameField = screen.getByLabelText('Full Name');
      await user.type(nameField, 'John Doe');

      // Should show saving indicator
      expect(await screen.findByText('Saving...')).toBeInTheDocument();

      // Should show saved indicator after save
      await waitFor(() => {
        expect(screen.getByText('Saved')).toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should submit valid form data', async () => {
      const user = userEvent.setup();
      const onComplete = vi.fn();
      render(<FormRenderer templateId={mockTemplate.id} onComplete={onComplete} />);

      // Fill required fields
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await user.selectOptions(screen.getByLabelText('Department'), 'Sales');

      // Submit form
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(storageManager.saveSubmission).toHaveBeenCalledWith(
          expect.objectContaining({
            templateId: mockTemplate.id,
            data: expect.objectContaining({
              'Full Name': 'John Doe',
              'Email Address': 'john@example.com',
              'Department': 'Sales',
            }),
            completed: true,
          })
        );
        expect(onComplete).toHaveBeenCalled();
      });
    });

    it('should prevent submission with validation errors', async () => {
      const user = userEvent.setup();
      render(<FormRenderer templateId={mockTemplate.id} />);

      // Try to submit without required fields
      await user.click(screen.getByRole('button', { name: /submit/i }));

      await waitFor(() => {
        expect(storageManager.saveSubmission).not.toHaveBeenCalled();
        expect(screen.getAllByText('This field is required')).toHaveLength(3);
      });
    });
  });

  describe('navigation', () => {
    it('should navigate between sections', async () => {
      const user = userEvent.setup();
      render(<FormRenderer templateId={mockTemplate.id} viewMode="section" />);

      // Should show first section
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
      expect(screen.queryByText('Additional Details')).not.toBeInTheDocument();

      // Fill required fields and navigate to next
      await user.type(screen.getByLabelText('Full Name'), 'John Doe');
      await user.type(screen.getByLabelText('Email Address'), 'john@example.com');
      await user.selectOptions(screen.getByLabelText('Department'), 'Marketing');

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should show second section
      await waitFor(() => {
        expect(screen.queryByText('Basic Information')).not.toBeInTheDocument();
        expect(screen.getByText('Additional Details')).toBeInTheDocument();
      });

      // Navigate back
      await user.click(screen.getByRole('button', { name: /previous/i }));

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument();
      });
    });

    it('should calculate and display progress', () => {
      const instance = instanceFactory.inProgress(50);
      vi.mocked(storageManager.getInstanceById).mockReturnValue(instance);

      render(<FormRenderer templateId={mockTemplate.id} instanceId={instance.id} />);

      expect(screen.getByText(/50%/)).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('should display error boundary on component error', () => {
      // Mock console.error to avoid test noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error by passing invalid template
      vi.mocked(storageManager.getTemplateById).mockImplementation(() => {
        throw new Error('Template error');
      });

      render(<FormRenderer templateId="error-template" />);

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should handle localStorage quota exceeded', async () => {
      const user = userEvent.setup();
      vi.mocked(storageManager.saveInstance).mockRejectedValue(new Error('QuotaExceededError'));

      render(<FormRenderer templateId={mockTemplate.id} />);

      await user.type(screen.getByLabelText('Full Name'), 'John Doe');

      await waitFor(() => {
        expect(screen.getByText(/Storage quota exceeded/i)).toBeInTheDocument();
      });
    });
  });
});