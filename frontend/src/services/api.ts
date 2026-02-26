import axios from 'axios';
import { Guide, Strategy, StrategyCategory, Spot, AdSlot, ContactInfo, City, SpotCategory } from '../types/data';

// Determine API URL based on environment
// For local development, it's usually http://localhost:3000
// For production (or when running on the server), use '/api' to leverage Nginx proxy
const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Add timestamp to GET requests to prevent caching
api.interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = { ...config.params, _t: Date.now() };
  }
  return config;
});

// Add request interceptor for authentication if needed (e.g. Bearer token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const guideService = {
  getAll: async (params?: any) => {
    const response = await api.get<Guide[]>('/guides', { params });
    return response.data;
  },
  create: async (data: Omit<Guide, 'id'>) => {
    const response = await api.post<Guide>('/guides', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Guide>) => {
    const response = await api.put<Guide>(`/guides/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/guides/${id}`);
  },
};

export const strategyService = {
  getAll: async (params?: any) => {
    const response = await api.get<Strategy[]>('/strategies', { params });
    return response.data;
  },
  create: async (data: Omit<Strategy, 'id'>) => {
    const response = await api.post<Strategy>('/strategies', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Strategy>) => {
    const response = await api.put<Strategy>(`/strategies/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/strategies/${id}`);
  },
};

export const strategyCategoryService = {
  getAll: async () => {
    const response = await api.get<StrategyCategory[]>('/strategy-categories');
    return response.data;
  },
  create: async (name: string) => {
    const response = await api.post<StrategyCategory>('/strategy-categories', { name });
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/strategy-categories/${id}`);
  },
};

export const spotService = {
  getAll: async (params?: any) => {
    const response = await api.get<Spot[]>('/spots', { params });
    return response.data;
  },
  create: async (data: Omit<Spot, 'id'>) => {
    const response = await api.post<Spot>('/spots', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Spot>) => {
    const response = await api.put<Spot>(`/spots/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/spots/${id}`);
  },
};

export const adService = {
  getAll: async (params?: any) => {
    const response = await api.get<AdSlot[]>('/ads', { params });
    return response.data;
  },
  create: async (data: Omit<AdSlot, 'id'>) => {
    const response = await api.post<AdSlot>('/ads', data);
    return response.data;
  },
  update: async (id: number, data: Partial<AdSlot>) => {
    const response = await api.put<AdSlot>(`/ads/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/ads/${id}`);
  },
};

export const contactService = {
  get: async () => {
    const response = await api.get<ContactInfo>('/contact-info');
    return response.data;
  },
  update: async (data: ContactInfo) => {
    const response = await api.put<ContactInfo>('/contact-info', data);
    return response.data;
  },
};

export const cityService = {
  getAll: async () => {
    const response = await api.get('/cities');
    return response.data;
  },
  getOne: async (id: number) => {
    const response = await api.get(`/cities/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/cities', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch(`/cities/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/cities/${id}`);
  },
};

export const userService = {
  getAll: async () => {
    const response = await api.get('/users');
    return response.data;
  },
};

export const spotCategoryService = {
  getAll: async () => {
    const response = await api.get<SpotCategory[]>('/spot-categories');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post<SpotCategory>('/spot-categories', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch<SpotCategory>(`/spot-categories/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/spot-categories/${id}`);
  },
};

export default api;
