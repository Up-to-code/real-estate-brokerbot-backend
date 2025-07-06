export async function getTemplates() {
  // TODO: Implement fetching all templates
  return [];
}

export async function getTemplateById(id: string) {
  // TODO: Implement fetching a template by ID
  return null;
}

export async function createTemplate(data: any) {
  // TODO: Implement template creation
  return { id: 'new-id', ...data };
}

export async function updateTemplate(id: string, data: any) {
  // TODO: Implement template update
  return { id, ...data };
}

export async function deleteTemplate(id: string) {
  // TODO: Implement template deletion
  return { id };
} 