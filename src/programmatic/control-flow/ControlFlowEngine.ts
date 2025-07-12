import { 
  Condition, 
  ConditionalBlock, 
  LoopBlock, 
  TemplateAction, 
  TemplateContext, 
  TemplateError,
  ProgrammaticField,
  ProgrammaticSection,
  ControlFlowConfig 
} from '../types';
import { TemplateContextManager } from './TemplateContext';
import { ConditionEvaluator } from './ConditionEvaluator';

export class ControlFlowEngine {
  private contextManager: TemplateContextManager;
  private conditionEvaluator: ConditionEvaluator;
  private maxIterations: number;
  private currentIterations: number;

  constructor(contextManager: TemplateContextManager, maxIterations: number = 10000) {
    this.contextManager = contextManager;
    this.conditionEvaluator = new ConditionEvaluator(contextManager);
    this.maxIterations = maxIterations;
    this.currentIterations = 0;
  }

  /**
   * Execute a conditional block
   */
  executeConditional(conditional: ConditionalBlock): TemplateAction[] {
    const results: TemplateAction[] = [];

    // Evaluate main condition
    if (this.conditionEvaluator.evaluate(conditional.if)) {
      results.push(...conditional.then);
    } 
    // Evaluate else-if conditions
    else if (conditional.elseIf) {
      for (const elseIfBranch of conditional.elseIf) {
        if (this.conditionEvaluator.evaluate(elseIfBranch.condition)) {
          results.push(...elseIfBranch.then);
          break; // Only execute first matching else-if
        }
      }
    }
    // Execute else branch if no conditions matched
    else if (conditional.else) {
      results.push(...conditional.else);
    }

    return results;
  }

  /**
   * Execute a loop block
   */
  executeLoop(loop: LoopBlock): TemplateAction[] {
    const results: TemplateAction[] = [];
    this.currentIterations = 0;

    // Create new scope for loop
    const loopScope = this.contextManager.createScope();

    try {
      switch (loop.type) {
        case 'forEach':
          results.push(...this.executeForEachLoop(loop));
          break;
        case 'repeat':
          results.push(...this.executeRepeatLoop(loop));
          break;
        case 'while':
          results.push(...this.executeWhileLoop(loop));
          break;
      }
    } finally {
      // Always exit loop scope
      this.contextManager.exitScope();
    }

    return results;
  }

  /**
   * Execute forEach loop
   */
  private executeForEachLoop(loop: LoopBlock): TemplateAction[] {
    const results: TemplateAction[] = [];
    
    if (!loop.array) {
      throw new Error('forEach loop requires array property');
    }

    const array = Array.isArray(loop.array) 
      ? loop.array 
      : this.contextManager.getVariable(loop.array as string);

    if (!Array.isArray(array)) {
      console.warn('forEach loop array is not an array:', array);
      return results;
    }

    for (let i = 0; i < array.length; i++) {
      if (this.currentIterations >= this.maxIterations) {
        throw new Error(`Loop exceeded maximum iterations (${this.maxIterations})`);
      }

      const item = array[i];
      
      // Set loop variables
      if (loop.variable) {
        this.contextManager.setVariable(loop.variable, item);
      }
      this.contextManager.setVariable('index', i);
      this.contextManager.setVariable('length', array.length);

      // Execute loop body
      const bodyResults = this.executeActions(loop.body);
      results.push(...bodyResults);

      // Check for loop control
      if (this.contextManager.shouldBreakLoop()) {
        this.contextManager.clearLoopControls();
        break;
      }
      if (this.contextManager.shouldContinueLoop()) {
        this.contextManager.clearLoopControls();
        continue;
      }

      this.currentIterations++;
    }

    return results;
  }

  /**
   * Execute repeat loop
   */
  private executeRepeatLoop(loop: LoopBlock): TemplateAction[] {
    const results: TemplateAction[] = [];
    
    if (!loop.count) {
      throw new Error('repeat loop requires count property');
    }

    const count = typeof loop.count === 'number' 
      ? loop.count 
      : this.contextManager.evaluateExpression(loop.count as string);

    if (typeof count !== 'number' || count < 0) {
      console.warn('Invalid repeat count:', count);
      return results;
    }

    for (let i = 0; i < count; i++) {
      if (this.currentIterations >= this.maxIterations) {
        throw new Error(`Loop exceeded maximum iterations (${this.maxIterations})`);
      }

      // Set loop variables
      if (loop.variable) {
        this.contextManager.setVariable(loop.variable, i);
      }
      this.contextManager.setVariable('index', i);
      this.contextManager.setVariable('count', count);

      // Execute loop body
      const bodyResults = this.executeActions(loop.body);
      results.push(...bodyResults);

      // Check for loop control
      if (this.contextManager.shouldBreakLoop()) {
        this.contextManager.clearLoopControls();
        break;
      }
      if (this.contextManager.shouldContinueLoop()) {
        this.contextManager.clearLoopControls();
        continue;
      }

      this.currentIterations++;
    }

    return results;
  }

  /**
   * Execute while loop
   */
  private executeWhileLoop(loop: LoopBlock): TemplateAction[] {
    const results: TemplateAction[] = [];
    
    if (!loop.condition) {
      throw new Error('while loop requires condition property');
    }

    while (this.conditionEvaluator.evaluate(loop.condition)) {
      if (this.currentIterations >= this.maxIterations) {
        throw new Error(`Loop exceeded maximum iterations (${this.maxIterations})`);
      }

      // Set loop variables
      this.contextManager.setVariable('iteration', this.currentIterations);

      // Execute loop body
      const bodyResults = this.executeActions(loop.body);
      results.push(...bodyResults);

      // Check for loop control
      if (this.contextManager.shouldBreakLoop()) {
        this.contextManager.clearLoopControls();
        break;
      }
      if (this.contextManager.shouldContinueLoop()) {
        this.contextManager.clearLoopControls();
        continue;
      }

      this.currentIterations++;
    }

    return results;
  }

  /**
   * Execute a list of template actions
   */
  executeActions(actions: TemplateAction[]): TemplateAction[] {
    const results: TemplateAction[] = [];

    for (const action of actions) {
      switch (action.type) {
        case 'conditional':
          if (action.conditional) {
            const conditionalResults = this.executeConditional(action.conditional);
            results.push(...conditionalResults);
          }
          break;
        case 'loop':
          if (action.loop) {
            const loopResults = this.executeLoop(action.loop);
            results.push(...loopResults);
          }
          break;
        case 'setVariable':
          if (action.data?.name && action.data?.value !== undefined) {
            this.contextManager.setVariable(action.data.name, action.data.value);
          }
          break;
        case 'callFunction':
          if (action.data?.name) {
            try {
              const result = this.contextManager.callFunction(action.data.name, ...action.data.args || []);
              if (action.data.returnVariable) {
                this.contextManager.setVariable(action.data.returnVariable, result);
              }
            } catch (error) {
              console.warn(`Error calling function ${action.data.name}:`, error);
            }
          }
          break;
        default:
          results.push(action);
      }
    }

    return results;
  }

  /**
   * Process control flow configuration for fields/sections
   */
  processControlFlow(config: ControlFlowConfig): ProgrammaticField[] | ProgrammaticSection[] {
    const results: (ProgrammaticField | ProgrammaticSection)[] = [];

    // Handle conditional logic
    if (config.if) {
      const conditionalBlock: ConditionalBlock = {
        if: config.if,
        then: this.convertToTemplateActions(config.then || []),
        elseIf: config.elseIf?.map(branch => ({
          condition: branch.condition,
          then: this.convertToTemplateActions(branch.then || [])
        })),
        else: config.else ? this.convertToTemplateActions(config.else) : undefined
      };

      const actions = this.executeConditional(conditionalBlock);
      results.push(...this.convertActionsToFields(actions));
    }

    // Handle forEach loop
    if (config.forEach) {
      const loopBlock: LoopBlock = {
        type: 'forEach',
        array: config.forEach.array,
        variable: config.forEach.variable,
        body: this.convertToTemplateActions(config.forEach.do)
      };

      const actions = this.executeLoop(loopBlock);
      results.push(...this.convertActionsToFields(actions));
    }

    // Handle repeat loop
    if (config.repeat) {
      const loopBlock: LoopBlock = {
        type: 'repeat',
        count: config.repeat.count,
        variable: config.repeat.variable,
        body: this.convertToTemplateActions(config.repeat.do)
      };

      const actions = this.executeLoop(loopBlock);
      results.push(...this.convertActionsToFields(actions));
    }

    // Handle while loop
    if (config.while) {
      const loopBlock: LoopBlock = {
        type: 'while',
        condition: config.while.condition,
        body: this.convertToTemplateActions(config.while.do)
      };

      const actions = this.executeLoop(loopBlock);
      results.push(...this.convertActionsToFields(actions));
    }

    return results;
  }

  /**
   * Convert field/section arrays to template actions
   */
  private convertToTemplateActions(items: unknown[]): TemplateAction[] {
    return items.map(item => ({
      type: 'createField' as const,
      data: item
    }));
  }

  /**
   * Convert template actions back to fields/sections
   */
  private convertActionsToFields(actions: TemplateAction[]): (ProgrammaticField | ProgrammaticSection)[] {
    return actions
      .filter(action => action.type === 'createField' && action.data)
      .map(action => action.data);
  }

  /**
   * Validate control flow configuration
   */
  validateControlFlow(config: ControlFlowConfig): TemplateError[] {
    const errors: TemplateError[] = [];

    // Validate conditional logic
    if (config.if) {
      errors.push(...this.conditionEvaluator.validateCondition(config.if));
    }

    if (config.elseIf) {
      for (const branch of config.elseIf) {
        errors.push(...this.conditionEvaluator.validateCondition(branch.condition));
      }
    }

    // Validate forEach loop
    if (config.forEach) {
      if (!config.forEach.array) {
        errors.push({
          type: 'validation',
          message: 'forEach loop requires array property'
        });
      }
      if (!config.forEach.variable) {
        errors.push({
          type: 'validation',
          message: 'forEach loop requires variable property'
        });
      }
    }

    // Validate repeat loop
    if (config.repeat) {
      if (!config.repeat.count) {
        errors.push({
          type: 'validation',
          message: 'repeat loop requires count property'
        });
      }
    }

    // Validate while loop
    if (config.while) {
      if (!config.while.condition) {
        errors.push({
          type: 'validation',
          message: 'while loop requires condition property'
        });
      } else {
        errors.push(...this.conditionEvaluator.validateCondition(config.while.condition));
      }
    }

    return errors;
  }

  /**
   * Get current execution state
   */
  getExecutionState(): Record<string, unknown> {
    return {
      currentIterations: this.currentIterations,
      maxIterations: this.maxIterations,
      context: this.contextManager.getDebugInfo()
    };
  }

  /**
   * Reset execution state
   */
  reset(): void {
    this.currentIterations = 0;
    this.contextManager.reset();
  }
}