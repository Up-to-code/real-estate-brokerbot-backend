export declare function getTemplates(): Promise<never[]>;
export declare function getTemplateById(id: string): Promise<null>;
export declare function createTemplate(data: any): Promise<any>;
export declare function updateTemplate(id: string, data: any): Promise<any>;
export declare function deleteTemplate(id: string): Promise<{
    id: string;
}>;
