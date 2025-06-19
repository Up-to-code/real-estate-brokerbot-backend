import { prisma } from "../../lib/prisma";
import { Template } from "@prisma/client";

export const getTemplates = async () => {
  const templates = await prisma.template.findMany();
  return templates;
};

export const getTemplateById = async (id: string) => {
  const template = await prisma.template.findUnique({ where: { id } });
  return template;
};

export const createTemplate = async (template: Template) => {
  const newTemplate = await prisma.template.create({ data: {
    name: template.name || "",
    content: template.content,
    category: template.category || "",
    language: template.language || "",
    variables: template.variables || [],
  } });
  return newTemplate;
};

export const updateTemplate = async (id: string, template: Template) => {
  const updatedTemplate = await prisma.template.update({ where: { id }, data: {
    name: template.name || "",
    content: template.content,
    category: template.category || "",
    language: template.language || "",
    variables: template.variables || [],
  } });
  return updatedTemplate;
};

export const deleteTemplate = async (id: string) => {
  const deletedTemplate = await prisma.template.delete({ where: { id } });
  return deletedTemplate;
};

 