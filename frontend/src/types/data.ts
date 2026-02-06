export interface Guide {
  id: number;
  name: string;
  gender: 'male' | 'female';
  hasCar: boolean;
  title: string;
  avatar: string;
  intro: string;
  cities: string[];
  rank: number;
  content?: string;
  photos?: string[];
}

export interface Strategy {
  id: number;
  title: string;
  days: string;
  spots: string[];
  image: string;
  tags: string[];
  rank: number;
  content?: string;
  photos?: string[];
  videos?: string[];
}

export type SpotTag = 'spot' | 'dining' | 'accommodation' | 'transport' | 'other';

export interface Spot {
  id: number;
  name: string;
  photos: string[];
  videos?: string[];
  content: string;
  tags: SpotTag[];
}

export interface AdSlot {
  id: number;
  title: string;
  image: string;
  link?: string;
  layout?: 'standard' | 'full';
}
