/**
 * Form Builder route component
 * Lazy-loaded route for template creation and editing
 */
import React, { Suspense, lazy, useEffect } from 'react';
import { FormTemplate } from '../types/form';
import { TemplateErrorBoundary } from '../components/ErrorBoundary';
import { bundleAnalyzer } from '../utils/bundleAnalyzer';
import * as Icons from 'lucide-react';

// Lazy load the FormBuilder component with tracking
const FormBuilder = lazy(() => {
  bundleAnalyzer.trackLazyLoad('FormBuilder');
  return import('../components/FormBuilder').then(module => {
    bundleAnalyzer.trackLazyComplete('FormBuilder');
    return { default: module.FormBuilder };
  });
});

// Loading component for lazy-loaded FormBuilder
const BuilderLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Icons.Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading form builder...</p>
    </div>
  </div>
);

interface BuilderRouteProps {
  template?: FormTemplate;
  onSave: (template: FormTemplate) => void;
  onCancel: () => void;
}

export const BuilderRoute: React.FC<BuilderRouteProps> = ({
  template,
  onSave,
  onCancel
}) => {
  return (
    <TemplateErrorBoundary templateName={template?.name || 'New Template'}>
      <Suspense fallback={<BuilderLoadingSpinner />}>
        <FormBuilder
          template={template}
          onSave={onSave}
          onCancel={onCancel}
        />
      </Suspense>
    </TemplateErrorBoundary>
  );
};