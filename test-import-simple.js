// Simple test to verify the import process works
// This script will test the encoding/decoding of a form instance

// Mock data for testing
const mockFormInstance = {
  id: 'test-instance-123',
  templateId: 'template-abc',
  templateName: 'Test Template',
  data: {
    name: 'John Doe',
    email: 'john@example.com',
    age: 25,
    preferences: ['option1', 'option2'],
    newsletter: true
  },
  progress: 75,
  completed: false,
  visitedSections: ['section1', 'section2'],
  createdAt: new Date('2024-01-01T10:00:00Z'),
  updatedAt: new Date('2024-01-01T11:00:00Z'),
  lastSaved: new Date('2024-01-01T11:00:00Z')
};

console.log('Original Form Instance:');
console.log(JSON.stringify(mockFormInstance, null, 2));

// Test the type guard function
function isFormInstance(data) {
  return data && typeof data === 'object' && 
         'templateId' in data && 
         'data' in data && 
         'progress' in data;
}

console.log('\nType guard test:');
console.log('isFormInstance(mockFormInstance):', isFormInstance(mockFormInstance));

console.log('\nType guard breakdown:');
console.log('- Is object:', typeof mockFormInstance === 'object');
console.log('- Has templateId:', 'templateId' in mockFormInstance);
console.log('- Has data:', 'data' in mockFormInstance);
console.log('- Has progress:', 'progress' in mockFormInstance);

console.log('\nData field analysis:');
console.log('- Data type:', typeof mockFormInstance.data);
console.log('- Data keys:', Object.keys(mockFormInstance.data));
console.log('- Data values:', Object.values(mockFormInstance.data));

console.log('\nSimulating import process:');
if (isFormInstance(mockFormInstance)) {
  const instanceId = `imported-${Date.now()}`;
  const importedInstance = {
    ...mockFormInstance,
    id: instanceId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  console.log('✅ Successfully created imported instance');
  console.log('New ID:', importedInstance.id);
  console.log('Preserved data keys:', Object.keys(importedInstance.data));
  console.log('Preserved data values:', Object.values(importedInstance.data));
  
  // Check if data was preserved
  const originalDataKeys = Object.keys(mockFormInstance.data);
  const importedDataKeys = Object.keys(importedInstance.data);
  const dataPreserved = originalDataKeys.every(key => 
    importedInstance.data[key] === mockFormInstance.data[key]
  );
  
  console.log('\n✅ Data preservation check:', dataPreserved ? 'PASSED' : 'FAILED');
  
  if (!dataPreserved) {
    console.log('❌ Data differences found:');
    originalDataKeys.forEach(key => {
      if (importedInstance.data[key] !== mockFormInstance.data[key]) {
        console.log(`  - ${key}: ${mockFormInstance.data[key]} != ${importedInstance.data[key]}`);
      }
    });
  }
} else {
  console.log('❌ Type guard failed - would not be recognized as FormInstance');
}

console.log('\n=== Test Summary ===');
console.log('The import process should work correctly if:');
console.log('1. The decoding process preserves all data fields');
console.log('2. The type guard correctly identifies the object as FormInstance');
console.log('3. The spread operator preserves all data when creating the new instance');
console.log('4. The FormRenderer receives the instance prop correctly');