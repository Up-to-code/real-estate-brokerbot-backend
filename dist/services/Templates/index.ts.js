"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.getTemplateById = exports.getTemplates = void 0;
const prisma_1 = require("../../lib/prisma");
const getTemplates = async () => {
    const templates = await prisma_1.prisma.template.findMany();
    return templates;
};
exports.getTemplates = getTemplates;
const getTemplateById = async (id) => {
    const template = await prisma_1.prisma.template.findUnique({ where: { id } });
    return template;
};
exports.getTemplateById = getTemplateById;
const createTemplate = async (template) => {
    const newTemplate = await prisma_1.prisma.template.create({ data: {
            name: template.name || "",
            content: template.content,
            category: template.category || "",
            language: template.language || "",
            variables: template.variables || [],
        } });
    return newTemplate;
};
exports.createTemplate = createTemplate;
const updateTemplate = async (id, template) => {
    const updatedTemplate = await prisma_1.prisma.template.update({ where: { id }, data: {
            name: template.name || "",
            content: template.content,
            category: template.category || "",
            language: template.language || "",
            variables: template.variables || [],
        } });
    return updatedTemplate;
};
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (id) => {
    const deletedTemplate = await prisma_1.prisma.template.delete({ where: { id } });
    return deletedTemplate;
};
exports.deleteTemplate = deleteTemplate;
