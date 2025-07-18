/**
 * Simple test to verify the sharing functionality works
 */

const { FormDataSharing } = require('./src/utils/dataSharing');

// Test template
const testTemplate = {
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template for sharing',
  sections: [
    {
      id: 'section1',
      title: 'Basic Info',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Name',
          required: true
        },
        {
          id: 'email',
          type: 'text',
          label: 'Email',
          required: true
        }
      ]
    }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
};

// Test form instance
const testInstance = {
  id: 'test-instance',
  templateId: 'test-template',
  templateName: 'Test Template',
  data: {
    name: 'John Doe',
    email: 'john@example.com'
  },
  progress: 100,
  completed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSaved: new Date()
};

async function testSharing() {
  console.log('🧪 Testing form sharing functionality...');
  
  const sharing = new FormDataSharing();
  
  try {
    // Test template encoding
    console.log('📝 Testing template encoding...');
    const templateString = await sharing.encode(testTemplate);
    console.log('✅ Template encoded successfully');
    console.log('📊 Template string length:', templateString.length);
    
    // Test template decoding
    console.log('🔓 Testing template decoding...');
    const decodedTemplate = await sharing.decode(templateString);
    console.log('✅ Template decoded successfully');
    console.log('📋 Template name:', decodedTemplate.name);
    
    // Test instance encoding
    console.log('💾 Testing instance encoding...');
    const instanceString = await sharing.encode(testInstance);
    console.log('✅ Instance encoded successfully');
    console.log('📊 Instance string length:', instanceString.length);
    
    // Test instance decoding
    console.log('🔓 Testing instance decoding...');
    const decodedInstance = await sharing.decode(instanceString);
    console.log('✅ Instance decoded successfully');
    console.log('👤 Instance data:', decodedInstance.data);
    
    // Test compression stats
    console.log('📈 Testing compression stats...');
    const stats = await sharing.getCompressionStats(testTemplate);
    console.log('✅ Compression stats:', stats);
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  testSharing();
}

module.exports = { testSharing };