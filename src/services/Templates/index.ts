import { prisma } from '../../lib/prisma';
import { Template } from '@prisma/client';
import { z } from 'zod';

// Zod schema for input validation
const templateSchema = z.object({
  name: z.string().min(1),
  content: z.string().min(1),
  category: z.string(),
  variables: z.array(z.string()),
  language: z.string(),
  isActive: z.boolean().optional(),
});

export async function getTemplates(page = 1, pageSize = 20): Promise<Template[]> {
  return prisma.template.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTemplateById(id: string): Promise<Template | null> {
  try {
    const template = await prisma.template.findUnique({ where: { id } });
    if (!template) throw new Error('Template not found');
    return template;
  } catch (error) {
    throw error;
  }
}

export async function createTemplate(data: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
  const parsed = templateSchema.parse(data);
  return prisma.template.create({ data: parsed });
}

export async function updateTemplate(id: string, data: Partial<Omit<Template, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Template> {
  const parsed = templateSchema.partial().parse(data);
  return prisma.template.update({ where: { id }, data: parsed });
}

export async function deleteTemplate(id: string): Promise<Template> {
  // Soft delete: set isActive to false
  return prisma.template.update({
    where: { id },
    data: { isActive: false },
  });
}

