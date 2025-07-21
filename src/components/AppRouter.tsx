/**
 * Simple client-side router for code splitting and navigation
 * Provides route-based lazy loading without external dependencies
 */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { FormTemplate, FormInstance } from '../types/form';
import { storageManager } from '../utils/storage';
import * as Icons from 'lucide-react';
import EmailPromptModal from './EmailPromptModal';
import { useFormHistory, FormHistoryState } from '../hooks/useFormHistory';

// Lazy load route components for better code splitting
const DashboardRoute = lazy(() => import('../routes/DashboardRoute'));
const BuilderRoute = lazy(() => import('../routes/BuilderRoute'));
const FormRoute = lazy(() => import('../routes/FormRoute'));

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
  | { type: 'form'; template: FormTemplate; instance?: FormInstance; sectionIndex?: number; viewMode?: 'continuous' | 'section' };

export const AppRouter: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>({ type: 'dashboard' });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [submittedInstance, setSubmittedInstance] = useState<FormInstance | null>(null);
  const [submittedTemplateName, setSubmittedTemplateName] = useState('');
  const { parseCurrentUrl, updateUrl, setNavigating } = useFormHistory();

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setNavigating(true);
      
      const state = event.state as FormHistoryState | null;
      if (state) {
        // Use state from history
        restoreRouteFromHistoryState(state);
      } else {
        // Parse current URL if no state
        const parsedState = parseCurrentUrl();
        if (parsedState) {
          restoreRouteFromHistoryState(parsedState);
        } else {
          setCurrentRoute({ type: 'dashboard' });
        }
      }
      
      setNavigating(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseCurrentUrl, setNavigating]);

  // Parse URL on initial load
  useEffect(() => {
    const initialState = parseCurrentUrl();
    if (initialState && initialState.routeType !== 'dashboard') {
      restoreRouteFromHistoryState(initialState);
    }
  }, []);

  // Restore route from history state
  const restoreRouteFromHistoryState = (state: FormHistoryState) => {
    switch (state.routeType) {
      case 'dashboard':
        setCurrentRoute({ type: 'dashboard' });
        break;
        
      case 'builder':
        if (state.templateId) {
          const template = storageManager.getTemplates().find(t => t.id === state.templateId);
          if (template) {
            setCurrentRoute({ type: 'builder', template });
          } else {
            // Template not found, go to new template
            setCurrentRoute({ type: 'builder' });
          }
        } else {
          setCurrentRoute({ type: 'builder' });
        }
        break;
        
      case 'form':
        if (state.templateId) {
          const template = storageManager.getTemplates().find(t => t.id === state.templateId);
          if (template) {
            let instance: FormInstance | undefined;
            if (state.instanceId) {
              instance = storageManager.getInstances().find(i => i.id === state.instanceId);
            }
            setCurrentRoute({ 
              type: 'form', 
              template, 
              instance,
              sectionIndex: state.sectionIndex,
              viewMode: state.viewMode
            });
          } else {
            // Template not found, go to dashboard
            setCurrentRoute({ type: 'dashboard' });
          }
        } else {
          setCurrentRoute({ type: 'dashboard' });
        }
        break;
    }
  };

  // Navigation handlers
  const navigateToDashboard = () => {
    setCurrentRoute({ type: 'dashboard' });
    updateUrl({ routeType: 'dashboard' });
  };

  const navigateToBuilder = (template?: FormTemplate) => {
    setCurrentRoute({ type: 'builder', template });
    updateUrl({
      routeType: 'builder',
      templateId: template?.id
    });
  };

  const navigateToForm = (template: FormTemplate, instance?: FormInstance) => {
    setCurrentRoute({ type: 'form', template, instance });
    updateUrl({
      routeType: 'form',
      templateId: template.id,
      instanceId: instance?.id
    });
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
    
    // Get template name for the modal
    const template = storageManager.getTemplates().find(t => t.id === instance.templateId);
    const templateName = template?.name || instance.templateName || 'Form';
    
    // Show email modal instead of alert
    setSubmittedInstance(completedInstance);
    setSubmittedTemplateName(templateName);
    setShowEmailModal(true);
  };
  
  const handleEmailModalClose = () => {
    setShowEmailModal(false);
    setSubmittedInstance(null);
    setSubmittedTemplateName('');
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
            initialSectionIndex={currentRoute.sectionIndex}
            initialViewMode={currentRoute.viewMode}
          />
        );

      default:
        return <DashboardRoute onNavigateToBuilder={navigateToBuilder} onNavigateToForm={navigateToForm} />;
    }
  };

  return (
    <>
      <Suspense fallback={<RouteLoadingSpinner />}>
        {renderCurrentRoute()}
      </Suspense>
      
      <EmailPromptModal
        isOpen={showEmailModal}
        onClose={handleEmailModalClose}
        formInstance={submittedInstance}
        templateName={submittedTemplateName}
      />
    </>
  );
};