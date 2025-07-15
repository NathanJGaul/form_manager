/**
 * Test file to verify compound conditional implementation
 */

import { evaluateConditional } from '../src/utils/formLogicEnhanced';
import { SingleCondition, CompoundCondition } from '../src/types/conditional';

// Test data
const formData1 = {
  exp_app_jcc2_cyber_ops: "NA",
  exp_app_jcc2_readiness: "3-5 Years"
};

const formData2 = {
  exp_app_jcc2_cyber_ops: "1-3 Years",
  exp_app_jcc2_readiness: "NA"
};

const formData3 = {
  exp_app_jcc2_cyber_ops: "NA",
  exp_app_jcc2_readiness: "NA"
};

const formData4 = {
  exp_app_jcc2_cyber_ops: "1-3 Years",
  exp_app_jcc2_readiness: "3-5 Years"
};

// Create OR condition for MOP 2.1.9
const orCondition: CompoundCondition = {
  logic: 'or',
  conditions: [
    { dependsOn: 'exp_app_jcc2_cyber_ops', operator: 'not_equals', values: ['NA'] },
    { dependsOn: 'exp_app_jcc2_readiness', operator: 'not_equals', values: ['NA'] }
  ]
};

// Test cases
console.log('Testing Compound Conditional Implementation:\n');

console.log('Test 1: User has JCC2 Readiness experience only');
console.log('Result:', evaluateConditional(orCondition, formData1));
console.log('Expected: true\n');

console.log('Test 2: User has JCC2 Cyber Ops experience only');
console.log('Result:', evaluateConditional(orCondition, formData2));
console.log('Expected: true\n');

console.log('Test 3: User has NO experience with either');
console.log('Result:', evaluateConditional(orCondition, formData3));
console.log('Expected: false\n');

console.log('Test 4: User has experience with BOTH');
console.log('Result:', evaluateConditional(orCondition, formData4));
console.log('Expected: true\n');

// Test single condition for backward compatibility
const singleCondition: SingleCondition = {
  dependsOn: 'exp_app_jcc2_cyber_ops',
  operator: 'not_equals',
  values: ['NA']
};

console.log('Test 5: Single condition (backward compatibility)');
console.log('Result:', evaluateConditional(singleCondition, formData2));
console.log('Expected: true');