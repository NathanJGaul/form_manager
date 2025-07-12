/**
 * Lazy loading utilities for example templates and programmatic modules
 * Helps reduce initial bundle size by loading examples on demand
 */
import { FormTemplate } from '../types/form';

// Lazy load example templates
export const loadExampleTemplates = async (): Promise<FormTemplate[]> => {
  const { JCC2UserQuestionnaire } = await import('../programmatic/examples/JCC2UserQuestionnaire');
  
  return [
    JCC2UserQuestionnaire,
    // Add other example templates here as they're created
  ];
};

// Lazy load TDL processing engine
export const loadTDLEngine = async () => {
  const [
    { TDLConverter },
    { TDLParser },
    { TDLValidator }
  ] = await Promise.all([
    import('../programmatic/tdl/converter'),
    import('../programmatic/tdl/parser'),
    import('../programmatic/tdl/validator')
  ]);
  
  return {
    TDLConverter,
    TDLParser,
    TDLValidator
  };
};

// Lazy load template builder utilities
export const loadTemplateBuilderUtils = async () => {
  const { TemplateBuilder } = await import('../programmatic/TemplateBuilder');
  return { TemplateBuilder };
};

// Lazy load control flow engine
export const loadControlFlowEngine = async () => {
  const [
    { evaluateCondition },
    { processFieldGroup },
    { validateFormLogic }
  ] = await Promise.all([
    import('../programmatic/control-flow/conditions'),
    import('../programmatic/control-flow/groups'), 
    import('../programmatic/control-flow/validation')
  ]);
  
  return {
    evaluateCondition,
    processFieldGroup,
    validateFormLogic
  };
};