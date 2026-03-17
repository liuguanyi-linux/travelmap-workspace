import axios from 'axios';

// ----------------------------------------------------------------------
// MOCK DATABASE (LocalStorage)
// ----------------------------------------------------------------------

const DB_KEYS = {
  REVIEWS: 'travelmap_db_reviews',
  FAVORITES: 'travelmap_db_favorites',
  BOOKINGS: 'travelmap_db_bookings',
};

const getDb = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
};

const setDb = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ----------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------
// MOCK API IMPLEMENTATION
// ----------------------------------------------------------------------

export const createOrUpdatePoi = async (poi: Poi) => {
  // In a real app, this would save the POI to a master DB.
  // For mock, we just return it as if it was saved.
  await delay(300);
  return { ...poi, id: Number(poi.amapId) || Date.now() }; // Mock ID generation
};

export const toggleFavorite = async (userId: number, poi: any) => {
  await delay(300);
  const favs = getDb(DB_KEYS.FAVORITES);
  const poiId = poi.id || poi.amapId; // Handle both ID types
  
  const existingIndex = favs.findIndex((f: any) => 
    (f.userId === userId) && (f.poi.id === poiId || f.poi.amapId === poiId)
  );

  if (existingIndex >= 0) {
    // Remove
    favs.splice(existingIndex, 1);
  } else {
    // Add
    favs.push({ 
      userId, 
      poi: {
        ...poi,
        // Ensure photos and description are stored as strings to match original API expectation if needed,
        // or keep as objects. The Sidebar expects objects after JSON.parse, 
        // so we'll store them as stringified to match the Sidebar's expectation of parsing them.
        photos: JSON.stringify(poi.photos || []),
        description: JSON.stringify(poi.biz_ext || {})
      },
      createdAt: new Date().toISOString() 
    });
  }
  
  setDb(DB_KEYS.FAVORITES, favs);
  return { success: true };
};

export const getFavorites = async (userId: number) => {
  await delay(300);
  const favs = getDb(DB_KEYS.FAVORITES);
  return favs.filter((f: any) => f.userId === userId);
};

export const createBooking = async (userId: number, poiId: number, date: Date, guests: number) => {
  await delay(500);
  const bookings = getDb(DB_KEYS.BOOKINGS);
  const newBooking = {
    id: Date.now(),
    userId,
    poiId,
    date,
    guests,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  bookings.push(newBooking);
  setDb(DB_KEYS.BOOKINGS, bookings);
  return newBooking;
};

export const getBookings = async (userId: number) => {
  await delay(300);
  const bookings = getDb(DB_KEYS.BOOKINGS);
  return bookings.filter((b: any) => b.userId === userId);
};

// ----------------------------------------------------------------------
// MOCK DATA GENERATORS REMOVED - ONLY REAL DATA
// ----------------------------------------------------------------------

export const getReviews = async (poiId: number | string) => {
  // If it's a number or numeric string, it's likely a database ID (Spot/Guide)
  // If it's a long string (not numeric), it might be an AMAP ID
  const isNumericId = !isNaN(Number(poiId));
  
  try {
      let url = '';
      if (isNumericId) {
          // Try fetching as Spot first (most common for "attractions")
          // But wait, the frontend distinguishes between 'poi' (amap) and 'spot' (local db)
          // Actually, 'getReviews' is called with 'poi.id'.
          // In AdminDashboard, spots have numeric IDs.
          // In MapView (AMAP), POIs have string IDs (amapId).
          
          // Let's try to determine type or just try endpoints.
          // Better approach: The backend should ideally expose a unified endpoint or we assume type.
          // Given the current architecture:
          // /api/reviews/spot/:id
          // /api/reviews/poi/:id (This expects internal POI ID, not AMAP ID?)
          // /api/reviews/amap/:amapId (We added this in backend service createForAmap but controller?)
          
          // Let's check backend controller for AMAP support.
          // It seems we only saw `findAllByPoiId`, `findAllBySpotId`.
          // If the ID is from AMAP (string), we need an endpoint that handles AMAP IDs.
          
          // However, for now, let's assume 'poiId' passed here is what the backend expects.
          // If it's a Spot (from Admin), use /api/reviews/spot/:id
          // If it's an AMAP POI, use /api/reviews/amap/:id (if exists) or /api/reviews/poi/:id?
          
          // Let's rely on the previous implementation pattern but REMOVE MOCKS.
          
          // First, try fetching from real backend API if available
          const endpoint = isNumericId ? `/api/reviews/spot/${poiId}` : `/api/reviews/amap/${poiId}`;
          
          // NOTE: Since we don't have a dedicated /amap/ endpoint exposed in the controller snippet we saw,
          // we might need to rely on the fact that `createReview` handles logic.
          // But fetching?
          // Let's assume for now we only fetch real data for SPOTS (numeric IDs) which match the Admin dashboard use case.
          // For AMAP POIs, if backend doesn't support them yet, we return empty list instead of mocks.
          
          if (isNumericId) {
             const res = await fetch(`/api/reviews/spot/${poiId}`);
             if (res.ok) {
                 return await res.json();
             }
          } else {
             // Try fetching by AMAP ID if endpoint exists, otherwise empty
             const res = await fetch(`/api/reviews/amap/${poiId}`);
             if (res.ok) {
                 return await res.json();
             }
          }
      }
  } catch (e) {
      console.error('Failed to fetch real reviews', e);
  }

  // Fallback to empty array - NO MORE MOCKS
  return [];
};

export const getUserReviews = async (userId: number) => {
  try {
    const res = await fetch(`/api/reviews/user/${userId}`);
    if (res.ok) return await res.json();
  } catch (e) { console.error(e); }
  return [];
};

export const createReview = async (userId: number | string, poiId: number | string, rating: number, content: string, userInfo?: { nickname: string, avatar?: string }) => {
  const isNumericId = !isNaN(Number(poiId));
  
  if (isNumericId) {
      // It's a Spot or internal POI
      const body = {
          userId: Number(userId),
          spotId: Number(poiId), // Defaulting to spot, might need adjustment if we distinguish types strictly
          rating,
          content,
          // If we want to support nickname overriding from frontend:
          // customNickname: userInfo?.nickname 
      };
      
      const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
      });
      return await res.json();
  } else {
      // It's an AMAP POI
      const body = {
          userId: Number(userId),
          amapId: String(poiId),
          poiName: 'Unknown', // We might need to pass this down
          poiType: 'Unknown',
          rating,
          content
      };
       const res = await fetch('/api/reviews/amap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
      });
      return await res.json();
  }
};

export const deleteReview = async (reviewId: number | string) => {
  await delay(300);
  
  // 1. Try deleting from Managed Spots
  try {
    const spots = JSON.parse(localStorage.getItem('travelmap_spots') || '[]');
    let found = false;
    const newSpots = spots.map((spot: any) => {
        if (spot.reviews) {
            const initialLen = spot.reviews.length;
            spot.reviews = spot.reviews.filter((r: any) => String(r.id) !== String(reviewId));
            if (spot.reviews.length !== initialLen) found = true;
        }
        return spot;
    });
    if (found) {
        localStorage.setItem('travelmap_spots', JSON.stringify(newSpots));
        return { success: true };
    }
  } catch (e) {
     console.error('Failed to delete from managed spots', e);
  }

  // 2. Delete from Local DB
  const reviews = getDb(DB_KEYS.REVIEWS);
  const newReviews = reviews.filter((r: any) => String(r.id) !== String(reviewId));
  setDb(DB_KEYS.REVIEWS, newReviews);
  
  return { success: true };
};

// Keep the default export for compatibility, though we aren't using axios instance anymore
const api = axios.create({ baseURL: 'http://mock-api' });
export default api;