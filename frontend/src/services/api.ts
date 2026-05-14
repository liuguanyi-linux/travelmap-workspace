import axios from 'axios';
import { Guide, Strategy, StrategyCategory, Spot, AdSlot, ContactInfo, City, SpotCategory } from '../types/data';

// Determine API URL based on environment
// For local development, it's usually http://localhost:3000
// For production (or when running on the server), use '/api' to leverage Nginx proxy
// dev/prod 모두 /api 으로 통일 (dev 은 vite proxy → :3001, prod 은 nginx)
const API_URL = '/api';

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

// Response interceptor: auto-redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('admin_token')) {
      localStorage.removeItem('admin_token');
      alert('登录已过期，请重新登录');
      window.location.href = '/admin/login';
    }
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
  update: async (id: string, data: Partial<Guide>) => {
    const response = await api.put<Guide>(`/guides/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
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
  update: async (id: string, data: Partial<Strategy>) => {
    const response = await api.put<Strategy>(`/strategies/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
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
  updateStatus: async (id: number | string, isActive: boolean) => {
    // 强制转换为字符串，放在 Body 里传输，避开 URL 路径的任何潜在截断和代理问题
    // 注意：使用相对路径 /spots/update-status 并在外部 baseURL 加上拦截器配置确保 json 发送
    const response = await api.put<Spot>(`/spots/${String(id)}/status`, {
      isActive: Boolean(isActive)
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },
  delete: async (id: number | string) => {
    const stringId = String(id);
    await api.delete(`/spots/${stringId}`);
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

export const usageGuideService = {
  getAll: async () => {
    const response = await api.get<any[]>('/usage-guides');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post<any>('/usage-guides', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.patch<any>(`/usage-guides/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/usage-guides/${id}`);
  },
};

export default api;
