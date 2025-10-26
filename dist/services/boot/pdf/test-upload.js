"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPDFUpload = testPDFUpload;
const sendPropertyPDF_1 = __importDefault(require("./sendPropertyPDF"));
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
async function testPDFUpload() {
    console.log('🧪 Testing PDF upload improvements...');
    try {
        const result = await (0, sendPropertyPDF_1.default)({
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
        }
        else {
            console.log('❌ Test failed:', result.error);
        }
    }
    catch (error) {
        console.error('💥 Test crashed:', error);
    }
}
if (require.main === module) {
    testPDFUpload();
}
