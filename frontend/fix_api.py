import os

file_path = 'src/api/index.ts'

content = """import axios from 'axios';

const API_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Poi {
  id?: number;
  amapId: string;
  name: string;
  type: string;
  address?: string;
  tel?: string;
  location?: string; // "lng,lat"
  photos?: any[];
  biz_ext?: any;
}

export const createOrUpdatePoi = async (poi: Poi) => {
  const response = await api.post('/pois', {
    amapId: poi.amapId,
    name: poi.name,
    type: poi.type,
    address: poi.address,
    tel: poi.tel,
    description: JSON.stringify(poi.biz_ext || {}), // Store extra info in description
    photos: JSON.stringify(poi.photos || []),
  });
  return response.data;
};

export const toggleFavorite = async (userId: number, poiId: number) => {
  const response = await api.post('/favorites/toggle', { userId, poiId });
  return response.data;
};

export const getFavorites = async (userId: number) => {
  const response = await api.get('/favorites', { params: { userId } });
  return response.data;
};

export const createBooking = async (userId: number, poiId: number, date: Date, guests: number) => {
  const response = await api.post('/bookings', { userId, poiId, date, guests });
  return response.data;
};

export const getBookings = async (userId: number) => {
  const response = await api.get('/bookings', { params: { userId } });
  return response.data;
};

export const getReviews = async (poiId: number) => {
  const response = await api.get(`/reviews/poi/${poiId}`);
  return response.data;
};

export const createReview = async (userId: number, poiId: number, rating: number, content: string) => {
  const response = await api.post('/reviews', { userId, poiId, rating, content });
  return response.data;
};

export default api;
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("API fixed")
