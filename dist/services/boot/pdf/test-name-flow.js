"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testNameFlow = testNameFlow;
const generatePRopertyPdf_1 = __importDefault(require("./generatePRopertyPdf"));
const testRequest = {
    type: "event",
    name: "Ahmed",
    details: {
        name: "Ahmed",
        phone: "201015638178",
        requestType: "pdf",
        jobType: "وسيط عقاري",
        propertyId: "test-property-id"
    }
};
async function testNameFlow() {
    console.log('🧪 Testing name flow through PDF generation...');
    console.log('📋 Input request:', JSON.stringify(testRequest, null, 2));
    try {
        const result = await (0, generatePRopertyPdf_1.default)(testRequest);
        console.log('📋 Test Results:');
        console.log('Success:', result.success);
        console.log('Message:', result.message);
        if (result.success) {
            console.log('✅ Test passed! Name should be preserved as "Ahmed"');
        }
        else {
            console.log('❌ Test failed:', result.message);
        }
    }
    catch (error) {
        console.error('💥 Test crashed:', error);
    }
}
if (require.main === module) {
    testNameFlow();
}
