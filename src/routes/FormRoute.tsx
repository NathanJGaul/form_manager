/**
 * Form Renderer route component  
 * Lazy-loaded route for form filling and viewing
 */
import React, { Suspense, lazy } from 'react';
import { FormTemplate, FormInstance } from '../types/form';
import { FormErrorBoundary } from '../components/ErrorBoundary';
import { bundleAnalyzer } from '../utils/bundleAnalyzer';
import * as Icons from 'lucide-react';

// Lazy load the FormRenderer component with tracking
const FormRenderer = lazy(() => {
  bundleAnalyzer.trackLazyLoad('FormRenderer');
  return import('../components/FormRenderer').then(module => {
    bundleAnalyzer.trackLazyComplete('FormRenderer');
    return { default: module.FormRenderer };
  });
});

// Loading component for lazy-loaded FormRenderer
const FormLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Icons.Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading form...</p>
    </div>
  </div>
);

interface FormRouteProps {
  template: FormTemplate;
  instance?: FormInstance;
  onSave: (instance: FormInstance) => void;
  onSubmit: (instance: FormInstance) => void;
  onExit: () => void;
}

export const FormRoute: React.FC<FormRouteProps> = ({
  template,
  instance,
  onSave,
  onSubmit,
  onExit
}) => {
  return (
    <FormErrorBoundary formName={template.name}>
      <Suspense fallback={<FormLoadingSpinner />}>
        <FormRenderer
          template={template}
          instance={instance}
          onSave={onSave}
          onSubmit={onSubmit}
          onExit={onExit}
        />
      </Suspense>
    </FormErrorBoundary>
  );
};