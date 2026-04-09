import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export interface FavoriteItem {
  id: string;
  name: string;
  type: string; // 'poi' | 'strategy'
  address?: string;
  location?: string;
  imageUrl?: string;
  timestamp: number;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => Promise<void>;
  removeFavorite: (id: string) => Promise<void>;
  isFavorite: (id: string | number, type: 'poi' | 'strategy') => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => Promise<void>;
  moveFavorite: (index: number, direction: 'up' | 'down') => void;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Determine API URL based on environment
const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const { user } = useAuth();

  const refreshFavorites = async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/favorites?userId=${user.id}`);
      const data = response.data;
      console.log("📦 3. Raw GET Data from Backend:", data);
      
      const mappedFavorites: FavoriteItem[] = data.map((fav: any) => {
        if (fav.poi) {
          return {
            id: String(fav.poi.id || fav.poi.amapId),
            name: fav.poi.name,
            type: 'poi',
            address: fav.poi.address,
            location: fav.poi.location,
            imageUrl: fav.poi.photos ? JSON.parse(fav.poi.photos)[0] : undefined,
            timestamp: new Date(fav.createdAt).getTime()
          };
        } else if (fav.strategy) {
          return {
            id: String(fav.strategy.id),
            name: fav.strategy.title,
            type: 'strategy',
            imageUrl: fav.strategy.image,
            timestamp: new Date(fav.createdAt).getTime()
          };
        }
        return null;
      }).filter(Boolean);

      console.log("🔄 4. Mapped Data for React State:", mappedFavorites);
      setFavorites(mappedFavorites);
    } catch (error: any) {
      console.error("🔥 API ERROR DETAILS (refreshFavorites):", error.response?.data || error);
      toast.error(error.response?.data?.message || error.message || '获取收藏列表失败');
    }
  };

  useEffect(() => {
    refreshFavorites();
  }, [user]);

  const addFavorite = async (item: Omit<FavoriteItem, 'timestamp'>) => {
    if (!user) {
      toast.error('请先登录 / 로그인이 필요합니다');
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      return;
    }
    if (favorites.some(fav => fav.id === String(item.id))) return;
    
    try {
      await axios.post(`${API_URL}/favorites/toggle`, {
        userId: user.id,
        targetId: String(item.id),
        type: item.type === 'strategy' ? 'strategy' : 'poi',
        itemData: item // Pass the full item data for auto-creation
      });
      await refreshFavorites();
    } catch (error) {
      console.error('Failed to add favorite:', error);
      throw error;
    }
  };

  const removeFavorite = async (id: string) => {
    if (!user) return;
    
    const favToRemove = favorites.find(f => f.id === String(id));
    if (!favToRemove) return;

    try {
      await axios.post(`${API_URL}/favorites/toggle`, {
        userId: user.id,
        targetId: String(id),
        type: favToRemove.type === 'strategy' ? 'strategy' : 'poi'
      });
      await refreshFavorites();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
      throw error;
    }
  };

  const isFavorite = (id: string | number, type: 'poi' | 'strategy') => {
    const isFav = favorites.some(fav => fav.id === String(id) && fav.type === type);
    // console.log(`🔍 Checking isFavorite: target[${id}](${typeof id}) vs state[${favorites.map(f=>f.id).join(',')}] -> ${isFav}`);
    return isFav;
  };

  const toggleFavorite = async (item: Omit<FavoriteItem, 'timestamp'>) => {
    console.log("🚀 [Context] Inside toggleFavorite, received item:", item);
    
    if (!user) {
      console.warn("⛔ [Context] Not authenticated, aborting.");
      toast.error('请先登录 / 로그인이 필요합니다');
      window.dispatchEvent(new CustomEvent('open-login-modal'));
      throw new Error("User not authenticated"); // 必须抛出错误，阻止外层弹出假成功
    }

    try {
      const payload = {
        userId: user.id,
        targetId: String(item.id),
        type: item.type === 'strategy' ? 'strategy' : 'poi',
        itemData: item // 传递给后端用于自动落库
      };
      console.log("🌐 [Context] Calling API POST /favorites/toggle with payload:", payload);

      // 必须带上 await 发送真实请求
      const response = await axios.post(`${API_URL}/favorites/toggle`, payload);
      
      console.log("✅ [Context] API Success! Response:", response.data);
      
      // 强制刷新列表状态
      await refreshFavorites();
      return response.data; // 正常结束
    } catch (error: any) {
      console.error("🔥 [Context] API Error:", error.response?.data || error.message);
      // 把后端的真实错误抛给外层组件
      throw error;
    }
  };

  const moveFavorite = (index: number, direction: 'up' | 'down') => {
    // Reordering is only local for now, as backend doesn't support order field yet
    if (index < 0 || index >= favorites.length) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === favorites.length - 1) return;

    const newFavorites = [...favorites];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFavorites[index], newFavorites[targetIndex]] = [newFavorites[targetIndex], newFavorites[index]];
    
    setFavorites(newFavorites);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, moveFavorite, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavoritesContext() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavoritesContext must be used within a FavoritesProvider');
  }
  return context;
}
