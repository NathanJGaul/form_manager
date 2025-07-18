/**
 * Debug script to test form instance import and storage
 */

// Mock localStorage
const localStorage = {
  data: new Map(),
  getItem(key) {
    return this.data.get(key) || null;
  },
  setItem(key, value) {
    this.data.set(key, value);
  },
  removeItem(key) {
    this.data.delete(key);
  },
  clear() {
    this.data.clear();
  }
};

// Mock global environment
global.localStorage = localStorage;

// Test form instance creation and storage
console.log('=== Testing Form Instance Import Flow ===');

// 1. Create a mock form instance (simulating what would be imported)
const mockFormInstance = {
  id: 'test-instance-1',
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

console.log('1. Mock form instance created:');
console.log(JSON.stringify(mockFormInstance, null, 2));

// 2. Simulate storage (same as ImportModal does)
const instanceToStore = {
  ...mockFormInstance,
  id: `imported-${Date.now()}`,
  createdAt: new Date(),
  updatedAt: new Date()
};

console.log('\n2. Instance prepared for storage:');
console.log(JSON.stringify(instanceToStore, null, 2));

// 3. Store in localStorage (simulating storageManager.saveInstance)
const existingInstances = [];
existingInstances.push(instanceToStore);
localStorage.setItem('form_instances', JSON.stringify(existingInstances));

console.log('\n3. Stored in localStorage');

// 4. Retrieve from localStorage (simulating storageManager.getInstances)
const storedData = localStorage.getItem('form_instances');
const retrievedInstances = JSON.parse(storedData);

console.log('\n4. Retrieved from localStorage:');
console.log(JSON.stringify(retrievedInstances, null, 2));

// 5. Simulate FormRenderer initialization (key part!)
const retrievedInstance = retrievedInstances[0];
console.log('\n5. Retrieved instance data field:');
console.log(JSON.stringify(retrievedInstance.data, null, 2));

// 6. Test the initializeFormData logic from FormRenderer
const initializeFormData = (instance) => {
  console.log('\n6. Testing initializeFormData logic:');
  console.log('instance?.data:', instance?.data);
  console.log('Object.keys(instance.data).length:', Object.keys(instance.data || {}).length);
  
  if (instance?.data && Object.keys(instance.data).length > 0) {
    console.log('→ Using instance.data');
    return instance.data;
  }
  
  console.log('→ Using default values (THIS IS THE PROBLEM!)');
  return {};
};

const formData = initializeFormData(retrievedInstance);
console.log('Final form data:');
console.log(JSON.stringify(formData, null, 2));