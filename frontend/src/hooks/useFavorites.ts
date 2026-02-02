import { useFavoritesContext } from '../contexts/FavoritesContext';

// Re-export types if needed, or just use the context hook directly
export type { FavoriteItem } from '../contexts/FavoritesContext';

export function useFavorites() {
  return useFavoritesContext();
}
