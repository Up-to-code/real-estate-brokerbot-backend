/**
 * Name Flow Test Script
 * 
 * Test script to verify the name flow through the entire PDF generation process.
 * This helps debug the "غير محدد" issue.
 */

import generatePropertyPdf from './generatePRopertyPdf';

/**
 * Test request with the exact data structure from the logs
 */
const testRequest = {
  type: "event" as const,
  name: "Ahmed",
  details: {
    name: "Ahmed",
    phone: "201015638178",
    requestType: "pdf" as const,
    jobType: "وسيط عقاري",
    propertyId: "test-property-id" // Replace with a real property ID for testing
  }
};

/**
 * Test name flow through PDF generation
 */
async function testNameFlow() {
  console.log('🧪 Testing name flow through PDF generation...');
  console.log('📋 Input request:', JSON.stringify(testRequest, null, 2));
  
  try {
    const result = await generatePropertyPdf(testRequest);
    
    console.log('📋 Test Results:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.success) {
      console.log('✅ Test passed! Name should be preserved as "Ahmed"');
    } else {
      console.log('❌ Test failed:', result.message);
    }
    
  } catch (error) {
    console.error('💥 Test crashed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testNameFlow();
}

export { testNameFlow }; 