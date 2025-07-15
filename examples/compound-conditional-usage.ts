/**
 * Example: How to use compound conditionals in the JCC2 Questionnaire
 * This shows the solution for MOP 2.1.9 which should display when user has
 * experience with EITHER "JCC2 Cyber Ops" OR "JCC2 Readiness"
 */

import { TemplateBuilder } from '../src/programmatic/core';
import { CompoundConditionalBuilder } from '../src/programmatic/builder/CompoundConditionalBuilder';

// Example 1: Using the extended builder methods (once implemented)
function exampleWithExtendedBuilder() {
  const builder = new TemplateBuilder();
  
  // MOP 2.1.9 with OR condition
  builder
    .section("MOP 2.1.9: Joint forces to perform collaborative planning")
    .id("mop_2_1_9")
    // This would show the section if user has experience with EITHER app
    .conditionalOr([
      { dependsOn: "exp_app_jcc2_cyber_ops", operator: "not_equals", values: ["NA"] },
      { dependsOn: "exp_app_jcc2_readiness", operator: "not_equals", values: ["NA"] }
    ])
    .naable();
}

// Example 2: Using compound conditional directly
function exampleWithCompoundConditional() {
  const builder = new TemplateBuilder();
  
  // Create the OR condition
  const orCondition = CompoundConditionalBuilder.createOrConditional([
    { dependsOn: "exp_app_jcc2_cyber_ops", operator: "not_equals", values: ["NA"] },
    { dependsOn: "exp_app_jcc2_readiness", operator: "not_equals", values: ["NA"] }
  ]);
  
  // Apply it to the section
  builder
    .section("MOP 2.1.9: Joint forces to perform collaborative planning")
    .id("mop_2_1_9")
    .conditionalCompound(orCondition)
    .naable();
}

// Example 3: More complex compound conditions
function exampleComplexConditions() {
  const builder = new TemplateBuilder();
  
  // Show section if:
  // (has JCC2 Cyber Ops experience OR has JCC2 Readiness experience)
  // AND is a cyber operator
  const complexCondition = {
    logic: 'and' as const,
    conditions: [
      {
        logic: 'or' as const,
        conditions: [
          { dependsOn: "exp_app_jcc2_cyber_ops", operator: "not_equals" as const, values: ["NA"] },
          { dependsOn: "exp_app_jcc2_readiness", operator: "not_equals" as const, values: ["NA"] }
        ]
      },
      { dependsOn: "is_cyber_operator", operator: "equals" as const, values: ["Yes"] }
    ]
  };
  
  builder
    .section("Advanced Section")
    .id("advanced_section")
    .conditionalCompound(complexCondition)
    .naable();
}

// Example 4: Helper function for creating common patterns
function createExperienceCondition(appIds: string[]): any {
  const conditions = appIds.map(appId => ({
    dependsOn: `exp_app_${appId.toLowerCase().replace(/ /g, '_')}`,
    operator: "not_equals" as const,
    values: ["NA"]
  }));
  
  return CompoundConditionalBuilder.createOrConditional(conditions);
}

// Usage in the actual template
function updateJCC2Template() {
  const builder = new TemplateBuilder();
  const planningApps = ["jcc2_cyber_ops", "jcc2_readiness"];
  
  builder
    .section("MOP 2.1.9: Joint forces to perform collaborative planning")
    .id("mop_2_1_9")
    .conditionalCompound(createExperienceCondition(planningApps))
    .naable();
    
  // Fields within the section don't need conditions - they inherit visibility
  builder
    .field("radio", "JCC2 provides tool for collaborative planning.")
    .id("collaborative_planning_tool")
    .options(["Completely Ineffective", "Moderately Ineffective", /* ... */])
    .layout("horizontal")
    .required()
    .end();
}

// Example 5: Backward compatible approach (without modifying core)
// This is a workaround using a computed field
function backwardCompatibleApproach() {
  const builder = new TemplateBuilder();
  
  // Create a hidden computed field that combines the OR logic
  builder
    .field("hidden", "Has Planning App Experience")
    .id("has_planning_app_experience")
    .defaultValue("false")
    // This would need custom logic in form renderer to compute
    // based on exp_app_jcc2_cyber_ops OR exp_app_jcc2_readiness
    .end();
  
  // Then use the computed field for the section conditional
  builder
    .section("MOP 2.1.9: Joint forces to perform collaborative planning")
    .id("mop_2_1_9")
    .conditional("has_planning_app_experience", "equals", ["true"])
    .naable();
}