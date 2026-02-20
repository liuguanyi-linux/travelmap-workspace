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
// MOCK DATA GENERATORS
// ----------------------------------------------------------------------

const MOCK_USERNAMES = ['张伟', '李娜', '王强', '刘洋', '陈静', '杨敏', '赵军', '黄婷', '周杰', '吴艳', '小吃货', '旅行达人', '爱生活', '美食家', '探店小能手'];
const MOCK_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
];

const MOCK_COMMENTS = [
  '味道很不错，环境也很好，强烈推荐！',
  '服务态度超级好，下次还会再来。',
  '性价比很高，适合朋友聚餐。',
  '排队人有点多，但是值得等待。',
  '这里风景独好，拍照很出片。',
  '房间很干净，设施也很新，住得很舒服。',
  '位置很好找，交通便利，周围配套齐全。',
  '第一次来，感觉很惊喜，还会推荐给朋友。',
  '总体来说还可以，就是价格稍微有点贵。',
  '体验非常好，工作人员很热情。',
  '必打卡的地方，果然名不虚传。',
  '很有特色，让人印象深刻。'
];

const generateMockReviews = (poiId: number | string) => {
  // Use poiId to seed or just generate random consistent set
  // Simple deterministic pseudo-random based on poiId string char codes
  const seed = String(poiId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const count = (seed % 5) + 3; // Generate 3-7 reviews

  const reviews: any[] = [];
  for (let i = 0; i < count; i++) {
    const isMeituan = (seed + i) % 2 === 0;
    reviews.push({
      id: `mock_${poiId}_${i}`,
      user_id: 1000 + i,
      username: MOCK_USERNAMES[(seed + i) % MOCK_USERNAMES.length],
      avatar: MOCK_AVATARS[(seed + i) % MOCK_AVATARS.length],
      poiId,
      rating: 3 + ((seed + i) % 3), // 3-5 stars
      content: MOCK_COMMENTS[(seed + i) % MOCK_COMMENTS.length],
      created_at: new Date(Date.now() - (seed * 100000 + i * 86400000)).toISOString(),
      source: isMeituan ? 'Meituan' : 'Dianping'
    });
  }
  return reviews;
};

export const getReviews = async (poiId: number | string) => {
  await delay(300);
  
  // 1. Get Local DB Reviews (Legacy/External)
  const dbReviews = getDb(DB_KEYS.REVIEWS)
    .filter((r: any) => String(r.poiId) === String(poiId))
    .map((r: any) => ({ ...r, source: 'Local' }));
    
  // 2. Get Reviews from Managed Spots (travelmap_spots)
  let managedReviews: any[] = [];
  try {
    const spots = JSON.parse(localStorage.getItem('travelmap_spots') || '[]');
    const spot = spots.find((s: any) => String(s.id) === String(poiId));
    if (spot && spot.reviews) {
      managedReviews = spot.reviews.map((r: any) => ({
        ...r,
        user_id: r.userId, // Map userId to user_id for frontend compatibility
        poiId: poiId,
        source: r.source || 'Local'
      }));
    }
  } catch (e) {
    console.error('Failed to load managed spots reviews', e);
  }

  // 3. Mock Reviews
  const mockReviews = generateMockReviews(poiId);
  
  // Combine and sort
  // Prioritize managed reviews, then local db reviews, then mocks
  return [...managedReviews, ...dbReviews, ...mockReviews]
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const getUserReviews = async (userId: number) => {
  await delay(300);
  const reviews = getDb(DB_KEYS.REVIEWS);
  return reviews.filter((r: any) => r.user_id === userId);
};

export const createReview = async (userId: number | string, poiId: number | string, rating: number, content: string, userInfo?: { nickname: string, avatar?: string }) => {
  await delay(400);
  
  const newReview = {
    id: Date.now().toString(),
    userId: userId, // Store consistent field name
    user_id: userId, // For compatibility
    username: userInfo?.nickname || '游客',
    avatar: userInfo?.avatar,
    poiId,
    rating,
    content,
    created_at: new Date().toISOString(),
    source: 'Local'
  };

  // Try to save to Managed Spots first
  try {
    const spots = JSON.parse(localStorage.getItem('travelmap_spots') || '[]');
    const spotIndex = spots.findIndex((s: any) => String(s.id) === String(poiId));
    
    if (spotIndex >= 0) {
      if (!spots[spotIndex].reviews) {
        spots[spotIndex].reviews = [];
      }
      spots[spotIndex].reviews.unshift(newReview);
      localStorage.setItem('travelmap_spots', JSON.stringify(spots));
      return newReview;
    }
  } catch (e) {
    console.error('Failed to save to managed spots', e);
  }

  // Fallback to separate DB for unmanaged spots
  const reviews = getDb(DB_KEYS.REVIEWS);
  reviews.push(newReview);
  setDb(DB_KEYS.REVIEWS, reviews);
  
  return newReview;
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