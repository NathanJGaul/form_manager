// Test script to verify CSV export fix for section-scoped field keys

import { storageManager } from '../src/utils/storage.js';

// Create test data
const testInstance = {
  id: 'test-instance-1',
  templateId: 'test-template-1',
  templateName: 'Test Form',
  templateVersion: '1.0.0',
  data: {
    // Section-scoped fields (new format)
    'section1.field1': 'Value 1',
    'section1.field2': 'Value 2',
    'section2.field3': 'Value 3',
    // Legacy flat fields (backward compatibility)
    'field4': 'Value 4',
    'field5': 'Value 5'
  },
  progress: 100,
  completed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSaved: new Date()
};

const testTemplate = {
  id: 'test-template-1',
  name: 'Test Form',
  description: 'Test form for CSV export',
  version: '1.0.0',
  sections: [
    {
      id: 'section1',
      title: 'Section 1',
      fields: [
        { id: 'field1', type: 'text', label: 'Field 1', required: true },
        { id: 'field2', type: 'text', label: 'Field 2', required: false }
      ]
    },
    {
      id: 'section2',
      title: 'Section 2',
      fields: [
        { id: 'field3', type: 'text', label: 'Field 3', required: true }
      ]
    },
    {
      id: 'section3',
      title: 'Section 3',
      fields: [
        { id: 'field4', type: 'text', label: 'Field 4', required: false },
        { id: 'field5', type: 'text', label: 'Field 5', required: false }
      ]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Mock localStorage
global.localStorage = {
  storage: {},
  getItem(key) {
    return this.storage[key] || null;
  },
  setItem(key, value) {
    this.storage[key] = value;
  },
  removeItem(key) {
    delete this.storage[key];
  }
};

// Save test data
localStorage.setItem('form_instances', JSON.stringify([testInstance]));
localStorage.setItem('form_templates', JSON.stringify([testTemplate]));

// Test CSV export
console.log('Testing CSV export with section-scoped fields...\n');

const csvData = storageManager.exportInstanceToCSV(testInstance.id);

console.log('CSV Output:');
console.log(csvData);

// Parse CSV to verify values
const lines = csvData.split('\n');
const headers = lines[0].split(',');
const values = lines[2].split(','); // Skip schema row

console.log('\nParsed Results:');
headers.forEach((header, index) => {
  if (header.includes('section')) {
    console.log(`${header}: ${values[index]}`);
  }
});

// Verify expected values
const expectedMappings = [
  { header: 'section1.field1', expected: 'Value 1' },
  { header: 'section1.field2', expected: 'Value 2' },
  { header: 'section2.field3', expected: 'Value 3' },
  { header: 'section3.field4', expected: 'Value 4' },
  { header: 'section3.field5', expected: 'Value 5' }
];

console.log('\nVerification:');
let allPassed = true;
expectedMappings.forEach(({ header, expected }) => {
  const headerIndex = headers.indexOf(header);
  if (headerIndex === -1) {
    console.log(`❌ Header '${header}' not found`);
    allPassed = false;
  } else {
    const actual = values[headerIndex];
    if (actual === expected) {
      console.log(`✅ ${header}: ${actual}`);
    } else {
      console.log(`❌ ${header}: Expected '${expected}', got '${actual}'`);
      allPassed = false;
    }
  }
});

console.log('\n' + (allPassed ? '✅ All tests passed!' : '❌ Some tests failed'));