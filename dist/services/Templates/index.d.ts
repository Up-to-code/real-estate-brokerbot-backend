import { Template } from '@prisma/client';
export declare function getTemplates(page?: number, pageSize?: number): Promise<Template[]>;
export declare function getTemplateById(id: string): Promise<Template | null>;
export declare function createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template>;
export declare function updateTemplate(id: string, data: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Template>;
export declare function deleteTemplate(id: string): Promise<Template>;
