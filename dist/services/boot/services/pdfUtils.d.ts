export declare function generatePropertyPDF(property: any, name?: string): Promise<Buffer>;
export declare function uploadPDFAndGetUrl(pdfBuffer: Buffer, property: any, name?: string): Promise<string>;
export declare function createPropertyPdf({ property, name, otherData }: {
    property: any;
    name?: string;
    otherData?: any;
}): Promise<string>;
