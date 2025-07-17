/**
 * Debug script to analyze the import process for form instances
 */

import { FormInstance, FormTemplate } from './src/types/form';
import { encodeForSharing, decodeFromSharing } from './src/utils/dataSharing';
import { storageManager } from './src/utils/storage';

// Create a mock form template for testing
const mockTemplate: FormTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template for debugging',
  sections: [
    {
      id: 'section1',
      title: 'Personal Information',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          id: 'age',
          type: 'number',
          label: 'Age',
          required: true,
          validation: { min: 0, max: 120 }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'Enter your email'
        }
      ]
    },
    {
      id: 'section2',
      title: 'Preferences',
      fields: [
        {
          id: 'favorite_color',
          type: 'select',
          label: 'Favorite Color',
          required: false,
          options: ['Red', 'Blue', 'Green', 'Yellow', 'Purple']
        },
        {
          id: 'newsletter',
          type: 'checkbox',
          label: 'Subscribe to newsletter',
          required: false
        }
      ]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Create a mock form instance with filled data
const mockInstance: FormInstance = {
  id: 'test-instance',
  templateId: 'test-template',
  templateName: 'Test Template',
  data: {
    name: 'John Doe',
    age: 30,
    email: 'john.doe@example.com',
    favorite_color: 'Blue',
    newsletter: true
  },
  progress: 80,
  completed: false,
  visitedSections: ['section1', 'section2'],
  createdAt: new Date('2024-01-01T10:00:00.000Z'),
  updatedAt: new Date('2024-01-01T10:30:00.000Z'),
  lastSaved: new Date('2024-01-01T10:30:00.000Z')
};

async function debugImportProcess() {
  console.log('=== Debug Import Process ===\n');
  
  console.log('1. Original Form Instance:');
  console.log(JSON.stringify(mockInstance, null, 2));
  console.log('\n');

  try {
    // Step 1: Encode the form instance
    console.log('2. Encoding form instance...');
    const shareString = await encodeForSharing(mockInstance);
    console.log('Share string:', shareString);
    console.log('Share string length:', shareString.length);
    console.log('\n');

    // Step 2: Decode the share string
    console.log('3. Decoding share string...');
    const decodedData = await decodeFromSharing(shareString);
    console.log('Decoded data:');
    console.log(JSON.stringify(decodedData, null, 2));
    console.log('\n');

    // Step 3: Check type guards
    console.log('4. Type guard checks:');
    console.log('Has templateId?', 'templateId' in decodedData);
    console.log('Has data?', 'data' in decodedData);
    console.log('Has progress?', 'progress' in decodedData);
    console.log('Data type:', typeof decodedData.data);
    console.log('Data keys:', Object.keys(decodedData.data || {}));
    console.log('Data values:', Object.values(decodedData.data || {}));
    console.log('\n');

    // Step 4: Test isFormInstance type guard
    const isFormInstance = (data: any): data is FormInstance => {
      return data && typeof data === 'object' && 
             'templateId' in data && 
             'data' in data && 
             'progress' in data;
    };
    
    console.log('5. Type guard result:');
    console.log('isFormInstance(decodedData):', isFormInstance(decodedData));
    console.log('\n');

    // Step 5: Simulate the import process
    console.log('6. Simulating import process...');
    if (isFormInstance(decodedData)) {
      const instanceId = `imported-${Date.now()}`;
      const importedInstance: FormInstance = {
        ...decodedData,
        id: instanceId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Imported instance:');
      console.log(JSON.stringify(importedInstance, null, 2));
      console.log('\n');
      
      // Step 6: Check data preservation
      console.log('7. Data preservation check:');
      console.log('Original data keys:', Object.keys(mockInstance.data));
      console.log('Imported data keys:', Object.keys(importedInstance.data));
      console.log('Original data values:', Object.values(mockInstance.data));
      console.log('Imported data values:', Object.values(importedInstance.data));
      console.log('\n');
      
      // Step 7: Compare each field
      console.log('8. Field-by-field comparison:');
      Object.keys(mockInstance.data).forEach(key => {
        const originalValue = mockInstance.data[key];
        const importedValue = importedInstance.data[key];
        const match = originalValue === importedValue;
        console.log(`${key}: ${originalValue} -> ${importedValue} (${match ? '✓' : '✗'})`);
      });
      
      // Step 8: Test storage
      console.log('\n9. Testing storage...');
      // Note: This won't work in Node.js environment since localStorage is not available
      console.log('Storage test would need to be run in browser environment');
      
    } else {
      console.log('Error: Decoded data is not recognized as FormInstance');
    }
    
  } catch (error) {
    console.error('Error during import process:', error);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the debug process
debugImportProcess().catch(console.error);