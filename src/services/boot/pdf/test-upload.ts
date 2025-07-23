/**
 * PDF Upload Test Script
 * 
 * Test script to verify the improved PDF upload functionality.
 */

import sendPropertyPDF from './sendPropertyPDF';

/**
 * Mock property data for testing
 */
const testProperty = {
  id: 'test-123',
  title: 'فيلا فاخرة في الرياض',
  description: 'فيلا حديثة البناء مع حديقة خاصة وموقف سيارات',
  price: 2500000,
  currency: 'SAR',
  type: 'فيلا',
  status: 'للبيع',
  bedrooms: 4,
  bathrooms: 3,
  area: 450,
  location: 'حي النرجس',
  city: 'الرياض',
  country: 'السعودية',
  images: ['https://example.com/image1.jpg'],
  features: ['مسبح', 'مطبخ مجهز', 'غرفة خادمة'],
  yearBuilt: 2023,
  parking: 2,
  contactInfo: '+966501234567',
  marketer: {
    name: 'أحمد محمد',
    role: 'وسيط عقاري'
  }
};

/**
 * Test PDF upload functionality
 */
async function testPDFUpload() {
  console.log('🧪 Testing PDF upload improvements...');
  
  try {
    const result = await sendPropertyPDF({
      property: testProperty,
      phoneNumber: '+966501234567'
    });
    
    console.log('📋 Test Results:');
    console.log('Success:', result.success);
    console.log('Message ID:', result.messageId);
    console.log('Media ID:', result.mediaId);
    console.log('File Size:', result.fileSize);
    console.log('Error:', result.error);
    console.log('Error Code:', result.errorCode);
    
    if (result.success) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Test crashed:', error);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testPDFUpload();
}

export { testPDFUpload }; 