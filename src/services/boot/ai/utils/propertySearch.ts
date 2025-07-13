import { searchProperties } from '../../services/searchProperties';
import { saveSearchHistory } from './historyUtils';

export async function handleSearch(query: any, clientId?: string) {
  const properties = await searchProperties(query);
  if (clientId) await saveSearchHistory(clientId, query, properties);
  return properties;
} 