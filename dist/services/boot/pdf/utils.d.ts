export declare function getMarketerRole(name: string): string;
export declare function validatePhoneNumber(phoneNumber: string): boolean;
export declare function validateEnvironment(): {
    isValid: boolean;
    error?: string;
};
export declare function isPdfSizeOptimal(pdfBuffer: Buffer): boolean;
export declare function getPdfSizeInfo(pdfBuffer: Buffer): string;
export declare function shouldOptimizePdf(pdfBuffer: Buffer): boolean;
export declare function addOptimizationHints(propertyData: any): any;
