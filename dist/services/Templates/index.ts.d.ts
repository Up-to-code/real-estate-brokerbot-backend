import { Template } from "@prisma/client";
export declare const getTemplates: () => Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    category: string;
    language: string;
    isActive: boolean;
    content: string;
    variables: string[];
}[]>;
export declare const getTemplateById: (id: string) => Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    category: string;
    language: string;
    isActive: boolean;
    content: string;
    variables: string[];
} | null>;
export declare const createTemplate: (template: Template) => Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    category: string;
    language: string;
    isActive: boolean;
    content: string;
    variables: string[];
}>;
export declare const updateTemplate: (id: string, template: Template) => Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    category: string;
    language: string;
    isActive: boolean;
    content: string;
    variables: string[];
}>;
export declare const deleteTemplate: (id: string) => Promise<{
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    category: string;
    language: string;
    isActive: boolean;
    content: string;
    variables: string[];
}>;
