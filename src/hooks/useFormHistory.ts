import { useCallback, useRef } from 'react';
import { FormTemplate, FormInstance } from '../types/form.types';

export interface FormHistoryState {
  routeType: 'dashboard' | 'builder' | 'form' | 'csv-manager';
  templateId?: string;
  instanceId?: string;
  sectionIndex?: number;
  viewMode?: 'continuous' | 'section';
  timestamp?: number;
}

export const useFormHistory = () => {
  const isNavigating = useRef(false);

  const buildPath = useCallback((state: FormHistoryState): string => {
    const searchParams = new URLSearchParams();
    
    switch (state.routeType) {
      case 'dashboard':
        return '/';
      
      case 'builder':
        if (state.templateId) {
          return `/builder/${state.templateId}`;
        }
        return '/builder';
      
      case 'form':
        if (!state.templateId) {
          return '/';
        }
        
        let path = `/form/${state.templateId}`;
        
        if (state.instanceId) {
          path += `/${state.instanceId}`;
        }
        
        // Add section information for section view mode
        if (state.viewMode === 'section' && state.sectionIndex !== undefined) {
          searchParams.set('section', state.sectionIndex.toString());
        }
        
        if (state.viewMode && state.viewMode !== 'continuous') {
          searchParams.set('view', state.viewMode);
        }
        
        const queryString = searchParams.toString();
        return queryString ? `${path}?${queryString}` : path;
      
      case 'csv-manager':
        return '/csv-manager';
      
      default:
        return '/';
    }
  }, []);

  const parseCurrentUrl = useCallback((): FormHistoryState | null => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    // Dashboard route
    if (path === '/' || path === '') {
      return { routeType: 'dashboard' };
    }
    
    // Builder routes
    if (path.startsWith('/builder')) {
      const matches = path.match(/^\/builder(?:\/([^\/]+))?$/);
      if (matches) {
        return {
          routeType: 'builder',
          templateId: matches[1] || undefined
        };
      }
    }
    
    // CSV Manager route
    if (path === '/csv-manager') {
      return { routeType: 'csv-manager' };
    }
    
    // Form routes
    if (path.startsWith('/form')) {
      const matches = path.match(/^\/form\/([^\/]+)(?:\/([^\/]+))?$/);
      if (matches) {
        const state: FormHistoryState = {
          routeType: 'form',
          templateId: matches[1],
          instanceId: matches[2] || undefined
        };
        
        // Parse query parameters
        const sectionParam = searchParams.get('section');
        if (sectionParam) {
          const sectionIndex = parseInt(sectionParam, 10);
          if (!isNaN(sectionIndex)) {
            state.sectionIndex = sectionIndex;
          }
        }
        
        const viewMode = searchParams.get('view') as 'continuous' | 'section' | null;
        if (viewMode === 'section' || viewMode === 'continuous') {
          state.viewMode = viewMode;
        }
        
        return state;
      }
    }
    
    return null;
  }, []);

  const updateUrl = useCallback((state: FormHistoryState, options?: { replace?: boolean; force?: boolean }) => {
    const { replace = false, force = false } = options || {};
    
    // Prevent recursive updates
    if (isNavigating.current && !force) {
      return;
    }
    
    const path = buildPath(state);
    const currentPath = window.location.pathname + window.location.search;
    
    // Only update if path has changed
    if (path !== currentPath || force) {
      const stateData = { ...state, timestamp: Date.now() };
      
      if (replace) {
        window.history.replaceState(stateData, '', path);
      } else {
        window.history.pushState(stateData, '', path);
      }
    }
  }, [buildPath]);

  const replaceUrlParams = useCallback((updates: Partial<FormHistoryState>) => {
    const currentState = window.history.state as FormHistoryState || parseCurrentUrl();
    if (currentState) {
      const newState = { ...currentState, ...updates };
      updateUrl(newState, { replace: true });
    }
  }, [parseCurrentUrl, updateUrl]);

  const setNavigating = useCallback((value: boolean) => {
    isNavigating.current = value;
  }, []);

  return {
    buildPath,
    parseCurrentUrl,
    updateUrl,
    replaceUrlParams,
    setNavigating,
    isNavigating
  };
};