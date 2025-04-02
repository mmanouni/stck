import api from './axios';

export interface InventoryItem {
  name: string;
  id?: string;
  quantity?: number;
  price?: number;
  // Add other inventory item properties as needed
}

export const inventoryApi = {
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/api/inventory');
    return response.data;
  },

  getById: async (id: string): Promise<InventoryItem> => {
    const response = await api.get(`/api/inventory/${id}`);
    return response.data;
  },

  create: async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
    const response = await api.post('/api/inventory', item);
    return response.data;
  },

  update: async (id: string, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const response = await api.put(`/api/inventory/${id}`, item);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/inventory/${id}`);
  }
};
