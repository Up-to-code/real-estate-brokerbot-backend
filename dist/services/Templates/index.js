"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplates = getTemplates;
exports.getTemplateById = getTemplateById;
exports.createTemplate = createTemplate;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
const prisma_1 = require("../../lib/prisma");
const zod_1 = require("zod");
const templateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    content: zod_1.z.string().min(1),
    category: zod_1.z.string(),
    variables: zod_1.z.array(zod_1.z.string()),
    language: zod_1.z.string(),
    isActive: zod_1.z.boolean().optional(),
});
async function getTemplates(page = 1, pageSize = 20) {
    return prisma_1.prisma.template.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
    });
}
async function getTemplateById(id) {
    try {
        const template = await prisma_1.prisma.template.findUnique({ where: { id } });
        if (!template)
            throw new Error('Template not found');
        return template;
    }
    catch (error) {
        throw error;
    }
}
async function createTemplate(data) {
    const parsed = templateSchema.parse(data);
    return prisma_1.prisma.template.create({ data: parsed });
}
async function updateTemplate(id, data) {
    const parsed = templateSchema.partial().parse(data);
    return prisma_1.prisma.template.update({ where: { id }, data: parsed });
}
async function deleteTemplate(id) {
    return prisma_1.prisma.template.update({
        where: { id },
        data: { isActive: false },
    });
}
