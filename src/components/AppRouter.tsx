/**
 * Simple client-side router for code splitting and navigation
 * Provides route-based lazy loading without external dependencies
 */
import React, { useState, Suspense, lazy } from 'react';
import { FormTemplate, FormInstance } from '../types/form';
import { storageManager } from '../utils/storage';
import * as Icons from 'lucide-react';

// Lazy load route components for better code splitting
const DashboardRoute = lazy(() => import('../routes/DashboardRoute').then(module => ({ default: module.DashboardRoute })));
const BuilderRoute = lazy(() => import('../routes/BuilderRoute').then(module => ({ default: module.BuilderRoute })));
const FormRoute = lazy(() => import('../routes/FormRoute').then(module => ({ default: module.FormRoute })));

// Loading component for route transitions
const RouteLoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center space-y-4">
      <Icons.Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

type Route = 
  | { type: 'dashboard' }
  | { type: 'builder'; template?: FormTemplate }
  | { type: 'form'; template: FormTemplate; instance?: FormInstance };

export const AppRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>({ type: 'dashboard' });

  // Navigation handlers
  const navigateToDashboard = () => {
    setCurrentRoute({ type: 'dashboard' });
  };

  const navigateToBuilder = (template?: FormTemplate) => {
    setCurrentRoute({ type: 'builder', template });
  };

  const navigateToForm = (template: FormTemplate, instance?: FormInstance) => {
    setCurrentRoute({ type: 'form', template, instance });
  };

  // Template management handlers
  const handleSaveTemplate = (template: FormTemplate) => {
    storageManager.saveTemplate(template);
    navigateToDashboard();
  };

  const handleSaveInstance = (instance: FormInstance) => {
    storageManager.saveInstance(instance);
  };

  const handleSubmitInstance = (instance: FormInstance) => {
    const completedInstance = { ...instance, completed: true, submittedAt: new Date() };
    storageManager.saveInstance(completedInstance);
    alert('Form submitted successfully!');
    navigateToDashboard();
  };

  // Render current route with Suspense for lazy loading
  const renderCurrentRoute = () => {
    switch (currentRoute.type) {
      case 'dashboard':
        return (
          <DashboardRoute
            onNavigateToBuilder={navigateToBuilder}
            onNavigateToForm={navigateToForm}
          />
        );

      case 'builder':
        return (
          <BuilderRoute
            template={currentRoute.template}
            onSave={handleSaveTemplate}
            onCancel={navigateToDashboard}
          />
        );

      case 'form':
        return (
          <FormRoute
            template={currentRoute.template}
            instance={currentRoute.instance}
            onSave={handleSaveInstance}
            onSubmit={handleSubmitInstance}
            onExit={navigateToDashboard}
          />
        );

      default:
        return <DashboardRoute onNavigateToBuilder={navigateToBuilder} onNavigateToForm={navigateToForm} />;
    }
  };

  return (
    <Suspense fallback={<RouteLoadingSpinner />}>
      {renderCurrentRoute()}
    </Suspense>
  );
};