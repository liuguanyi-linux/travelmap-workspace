export interface Guide {
  id: number | string;
  name: string;
  gender: 'male' | 'female';
  hasCar: boolean;
  title: string;
  avatar: string;
  intro: string;
  cities: string[];
  rank: number;
  isTop?: boolean;
  isGlobal?: boolean;
  category?: 'guide' | 'car' | 'agency';
  content?: string;
  photos?: string[];
  phone?: string;
  wechat?: string;
  kakao?: string;
  email?: string;
  expiryDate?: string;
}

export interface Strategy {
  id: number | string;
  title: string;
  city?: string;
  category: string; // '一日游' | '2日游' | '亲子游' | '其他'
  days: string;
  spots: string[];
  image: string;
  tags: string[];
  rank: number;
  content?: string;
  photos?: string[];
  phone?: string;
  wechat?: string;
  kakao?: string;
  email?: string;
  expiryDate?: string;
}

export type SpotTag = 'spot' | 'dining' | 'accommodation' | 'transport' | 'shopping' | 'other' | string;

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number;
  content: string;
  created_at: string;
  source?: string; // 'Local' | 'Meituan' | 'Dianping'
  type?: string;
  customNickname?: string;
}

export interface Spot {
  id: number | string;
  name: string;
  cnName?: string;
  city?: string;
  address?: string;
  location?: {
    lng: number;
    lat: number;
  };
  photos: string[];
  intro?: string;
  content: string;
  tags: SpotTag[];
  rank?: number;
  isTop?: boolean;
  isActive?: boolean;
  reviews?: Review[];
  phone?: string;
  wechat?: string;
  kakao?: string;
  email?: string;
  expiryDate?: string;
}

export interface AdSlot {
  id: number | string;
  title: string;
  description?: string;
  content?: string;
  image: string;
  photos?: string[];
  address?: string;
  link?: string;
  layout?: 'standard' | 'full';
  expiryDate?: string;
}

export interface ContactInfo {
  id?: number;
  phone: string;
  email: string;
  wechat?: string;
  website?: string;
  address?: string;
}

export interface City {
  id?: number;
  name: string;
  nameEn?: string;
  nameKo?: string;
  lng: number;
  lat: number;
  zoom: number;
}

export interface StrategyCategory {
  id: number;
  name: string;
}

export interface SpotCategory {
  id: number;
  name: string;
  key: string;
  icon: string;
  sortOrder: number;
}

export interface UsageGuide {
  id: number;
  title: string;
  titleEn?: string;
  titleKo?: string;
  content: string;
  contentEn?: string;
  contentKo?: string;
  createdAt: string;
  updatedAt: string;
}
