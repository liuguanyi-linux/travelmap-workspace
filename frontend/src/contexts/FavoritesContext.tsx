import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

export interface FavoriteItem {
  id: string;
  name: string;
  type: string;
  address?: string;
  location?: string; // e.g., "116.397,39.918"
  imageUrl?: string;
  timestamp: number;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'timestamp'>) => void;
  moveFavorite: (index: number, direction: 'up' | 'down') => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'travelmap_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    // Load from local storage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites', e);
      }
    }
  }, []);

  const saveToStorage = (newFavorites: FavoriteItem[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const addFavorite = (item: Omit<FavoriteItem, 'timestamp'>) => {
    if (favorites.some(fav => fav.id === item.id)) return;
    
    const newItem = { ...item, timestamp: Date.now() };
    const newFavorites = [newItem, ...favorites];
    saveToStorage(newFavorites);
  };

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    saveToStorage(newFavorites);
  };

  const isFavorite = (id: string) => {
    return favorites.some(fav => fav.id === id);
  };

  const toggleFavorite = (item: Omit<FavoriteItem, 'timestamp'>) => {
    if (isFavorite(item.id)) {
      removeFavorite(item.id);
    } else {
      addFavorite(item);
    }
  };

  const moveFavorite = (index: number, direction: 'up' | 'down') => {
    if (index < 0 || index >= favorites.length) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === favorites.length - 1) return;

    const newFavorites = [...favorites];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newFavorites[index], newFavorites[targetIndex]] = [newFavorites[targetIndex], newFavorites[index]];
    
    saveToStorage(newFavorites);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, moveFavorite }}>
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
