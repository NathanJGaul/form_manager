/**
 * Debug script to simulate the exact import flow from ImportModal
 */

// Mock environment
const localStorage = {
  data: new Map(),
  getItem(key) {
    return this.data.get(key) || null;
  },
  setItem(key, value) {
    this.data.set(key, value);
  }
};

global.localStorage = localStorage;

// Test the exact flow from ImportModal
console.log('=== Testing Real Import Flow ===');

// 1. Simulate decoding result (what decodeFromSharing returns)
const decodedFormInstance = {
  id: 'original-id',
  templateId: 'template-1',
  templateName: 'Test Template',
  data: {
    'field1': 'Test Value 1',
    'field2': 'Test Value 2',
    'field3': ['Option A', 'Option B']
  },
  progress: 75,
  completed: false,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-02'),
  lastSaved: new Date('2023-01-02')
};

console.log('1. Decoded form instance:');
console.log('decodedFormInstance.data:', decodedFormInstance.data);
console.log('typeof decodedFormInstance.data:', typeof decodedFormInstance.data);
console.log('Object.keys(decodedFormInstance.data):', Object.keys(decodedFormInstance.data));

// 2. ImportModal processing (lines 87-95)
const instanceId = `imported-${Date.now()}`;
const instance = {
  ...decodedFormInstance,
  id: instanceId,
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('\n2. Instance after ImportModal processing:');
console.log('instance.data:', instance.data);
console.log('typeof instance.data:', typeof instance.data);
console.log('Object.keys(instance.data):', Object.keys(instance.data));

// 3. StorageManager.saveInstance (lines 181-195)
const instances = [];
const existingIndex = instances.findIndex((i) => i.id === instance.id);

instance.lastSaved = new Date();
instance.updatedAt = new Date();

if (existingIndex >= 0) {
  instances[existingIndex] = instance;
} else {
  instances.push(instance);
}

localStorage.setItem('form_instances', JSON.stringify(instances));

console.log('\n3. After JSON.stringify and setItem:');
console.log('Stored JSON:', localStorage.getItem('form_instances'));

// 4. StorageManager.getInstances (lines 168-179)
const stored = localStorage.getItem('form_instances');
const parsedInstances = JSON.parse(stored);
const mappedInstances = parsedInstances.map((i) => ({
  ...i,
  createdAt: new Date(i.createdAt),
  updatedAt: new Date(i.updatedAt),
  lastSaved: new Date(i.lastSaved),
}));

console.log('\n4. After getInstances mapping:');
const retrievedInstance = mappedInstances[0];
console.log('retrievedInstance.data:', retrievedInstance.data);
console.log('typeof retrievedInstance.data:', typeof retrievedInstance.data);
console.log('Object.keys(retrievedInstance.data):', Object.keys(retrievedInstance.data));

// 5. FormRenderer.initializeFormData (lines 211-226)
const initializeFormData = (instance) => {
  console.log('\n5. FormRenderer.initializeFormData:');
  console.log('instance?.data:', instance?.data);
  console.log('instance?.data check:', instance?.data && Object.keys(instance.data).length > 0);
  
  if (instance?.data && Object.keys(instance.data).length > 0) {
    console.log('→ USING instance.data');
    return instance.data;
  }

  console.log('→ USING default values (NO DATA!)');
  const defaultData = {};
  return defaultData;
};

const formData = initializeFormData(retrievedInstance);
console.log('\nFinal form data:');
console.log(JSON.stringify(formData, null, 2));

// 6. Test potential issue with different data structures
console.log('\n6. Testing potential data structure issues:');
console.log('instance.data === null:', retrievedInstance.data === null);
console.log('instance.data === undefined:', retrievedInstance.data === undefined);
console.log('Array.isArray(instance.data):', Array.isArray(retrievedInstance.data));
console.log('instance.data constructor:', retrievedInstance.data.constructor.name);