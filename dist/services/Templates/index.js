"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplates = getTemplates;
exports.getTemplateById = getTemplateById;
exports.createTemplate = createTemplate;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
async function getTemplates() {
    return [];
}
async function getTemplateById(id) {
    return null;
}
async function createTemplate(data) {
    return { id: 'new-id', ...data };
}
async function updateTemplate(id, data) {
    return { id, ...data };
}
async function deleteTemplate(id) {
    return { id };
}
